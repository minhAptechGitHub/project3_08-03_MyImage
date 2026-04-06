using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using p3_backend.Helpers;
using p3_backend.Models;
using p3_backend.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace p3_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VnPayController : ControllerBase
    {
        private readonly P3MyImage3Context _context;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public VnPayController(P3MyImage3Context context, IConfiguration config, IEmailService emailService)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            var list = await _context.PaymentTransactions
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
            return Ok(list);
        }

        // POST api/VnPay/create-payment-url
        [HttpPost("create-payment-url")]
        public async Task<IActionResult> CreatePaymentUrl([FromBody] CreateVnPayRequest req)
        {
            var order = await _context.Orders.FindAsync(req.OrderId);
            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng." });

            var vnpCfg = _config.GetSection("Vnpay");
            string tmnCode = vnpCfg["TmnCode"];
            string hashSecret = vnpCfg["HashSecret"];
            string baseUrl = vnpCfg["BaseUrl"];
            string returnUrl = vnpCfg["PaymentBackReturnUrl"];
            string version = vnpCfg["Version"];
            string command = vnpCfg["Command"];
            string currCode = vnpCfg["CurrCode"];
            string locale = vnpCfg["Locale"];

            long amount = (long)(req.Amount * 100);
            string timeZoneId = _config["TimeZoneId"] ?? "SE Asia Standard Time";
            var tz = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);

            var txnRef = $"{req.OrderId}_{Guid.NewGuid()}";

            var vnpParams = new SortedDictionary<string, string>(StringComparer.Ordinal)
            {
                { "vnp_Version", version },
                { "vnp_Command", command },
                { "vnp_TmnCode", tmnCode },
                { "vnp_Amount", amount.ToString() },
                { "vnp_CurrCode", currCode },
                { "vnp_TxnRef", txnRef },
                { "vnp_OrderInfo", $"Thanh toan don hang #{req.OrderId}" },
                { "vnp_OrderType", "other" },
                { "vnp_Locale", locale },
                { "vnp_ReturnUrl", returnUrl },
                { "vnp_IpAddr", HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1" },
                { "vnp_CreateDate", VnPayHelper.GetVnPayDateString(now) },
            };

            var paymentUrl = VnPayHelper.CreatePaymentUrl(baseUrl, vnpParams, hashSecret);

            _context.PaymentTransactions.Add(new PaymentTransaction
            {
                OrderId = req.OrderId,
                TxnRef = txnRef,
                Amount = req.Amount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            });

            order.PaymentMethod = "VNPay";

            await _context.SaveChangesAsync();

            return Ok(new { paymentUrl });
        }

        private async Task<(bool success, int orderId, string message)> ProcessVnPayResponse(Dictionary<string, string> queryParams)
        {
            string responseCode = queryParams["vnp_ResponseCode"];
            string txnRef = queryParams["vnp_TxnRef"];
            string vnpTxnNo = queryParams.ContainsKey("vnp_TransactionNo") ? queryParams["vnp_TransactionNo"] : null;
            string vnpMessage = queryParams.ContainsKey("vnp_OrderInfo") ? queryParams["vnp_OrderInfo"] : null;

            bool success = responseCode == "00";

            var orderIdStr = txnRef.Split('_')[0];
            if (!int.TryParse(orderIdStr, out int orderId))
                throw new Exception("TxnRef không hợp lệ");

            // 🔥 Update transaction
            var tx = await _context.PaymentTransactions
                .Where(t => t.TxnRef == txnRef && t.Status == "Pending")
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();

            if (tx != null)
            {
                tx.ResponseCode = responseCode;
                tx.VnpTransactionNo = vnpTxnNo;
                tx.Message = vnpMessage;
                tx.Status = success ? "Success" : "Failed";
            }

            // 🔥 Update order
            var order = await _context.Orders.FindAsync(orderId);
            bool statusJustChanged = false;

            if (order != null && success && order.Status == "Pending")
            {
                order.Status = "Payment Verified";
                statusJustChanged = true;
            }

            await _context.SaveChangesAsync();

            // 🔥 gửi email
            if (statusJustChanged && order != null)
            {
                try
                {
                    var customer = await _context.Customers.FindAsync(order.CustId);
                    if (!string.IsNullOrEmpty(customer?.Email))
                    {
                        await _emailService.SendOrderStatusEmailAsync(
                            customer.Email,
                            $"{customer.FName} {customer.LName}",
                            order.OrderId,
                            "Payment Verified"
                        );
                    }
                }
                catch { }
            }

            return (
                success,
                orderId,
                success ? "Thanh toán thành công." : "Thanh toán thất bại hoặc bị huỷ."
            );
        }

        // GET api/VnPay/callback
        [HttpGet("callback")]
        public async Task<IActionResult> Callback()
        {
            var queryDict = Request.Query
                .ToDictionary(kv => kv.Key, kv => kv.Value.ToString());

            string hashSecret = _config["Vnpay:HashSecret"];

            if (!VnPayHelper.ValidateSignature(
                queryDict.Select(kv => new KeyValuePair<string, string>(kv.Key, kv.Value)),
                hashSecret))
            {
                return BadRequest(new { message = "Chữ ký không hợp lệ." });
            }

            try
            {
                var result = await ProcessVnPayResponse(queryDict);

                return Ok(new
                {
                    success = result.success,
                    orderId = result.orderId,
                    message = result.message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("verify")]
        public async Task<IActionResult> Verify([FromBody] Dictionary<string, string> queryParams)
        {
            string hashSecret = _config["Vnpay:HashSecret"];

            if (!VnPayHelper.ValidateSignature(queryParams, hashSecret))
                return BadRequest(new { message = "Chữ ký không hợp lệ." });

            try
            {
                var result = await ProcessVnPayResponse(queryParams);

                return Ok(new
                {
                    success = result.success,
                    orderId = result.orderId,
                    message = result.message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }



    public class CreateVnPayRequest
    {
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
    }
}
