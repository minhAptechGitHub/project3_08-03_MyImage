using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using p3_backend.Helpers;
using p3_backend.Models;

namespace p3_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VnPayController : ControllerBase
    {
        private readonly P3MyImage3Context _context;
        private readonly IConfiguration _config;

        public VnPayController(P3MyImage3Context context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        //Get:
        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            var list = await _context.PaymentTransactions
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
            return Ok(list);
        }

        // ================================================================
        // POST api/VnPay/create-payment-url
        // Body: { "orderId": 5, "amount": 46000 }
        // ================================================================
        [HttpPost("create-payment-url")]
        public async Task<IActionResult> CreatePaymentUrl([FromBody] CreateVnPayRequest req)
        {
            var order = await _context.Orders.FindAsync(req.OrderId);
            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng." });

            var vnpCfg   = _config.GetSection("Vnpay");
            string tmnCode   = vnpCfg["TmnCode"];
            string hashSecret = vnpCfg["HashSecret"];
            string baseUrl   = vnpCfg["BaseUrl"];
            string returnUrl = vnpCfg["PaymentBackReturnUrl"];
            string version   = vnpCfg["Version"];
            string command   = vnpCfg["Command"];
            string currCode  = vnpCfg["CurrCode"];
            string locale    = vnpCfg["Locale"];

            // VNPay yêu cầu số tiền nhân 100
            long amount = (long)(req.Amount * 100);

            string timeZoneId = _config["TimeZoneId"] ?? "SE Asia Standard Time";
            var tz = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);

            var txnRef = req.OrderId.ToString();

            var vnpParams = new SortedDictionary<string, string>
            {
                { "vnp_Version",     version  },
                { "vnp_Command",     command  },
                { "vnp_TmnCode",     tmnCode  },
                { "vnp_Amount",      amount.ToString() },
                { "vnp_CurrCode",    currCode },
                { "vnp_TxnRef",      txnRef   },
                { "vnp_OrderInfo",   $"Thanh toan don hang #{req.OrderId}" },
                { "vnp_OrderType",   "other"  },
                { "vnp_Locale",      locale   },
                { "vnp_ReturnUrl",   returnUrl },
                { "vnp_IpAddr",      HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1" },
                { "vnp_CreateDate",  VnPayHelper.GetVnPayDateString(now) },
            };

            var paymentUrl = VnPayHelper.CreatePaymentUrl(baseUrl, vnpParams, hashSecret);

            // Ghi lại transaction (trạng thái Pending)
            var tx = new PaymentTransaction
            {
                OrderId   = req.OrderId,
                TxnRef    = txnRef,
                Amount    = req.Amount,
                Status    = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            _context.PaymentTransactions.Add(tx);

            // Cập nhật payment method trên đơn hàng
            order.PaymentMethod = "VNPay";
            await _context.SaveChangesAsync();

            return Ok(new { paymentUrl });
        }

        // ================================================================
        // GET api/VnPay/callback?vnp_ResponseCode=00&vnp_TxnRef=5&...
        // VNPay gọi về URL này (server-side IPN) - HOẶC 
        // Frontend redirect về rồi gọi endpoint này để xác nhận.
        // ================================================================
        [HttpGet("callback")]
        public async Task<IActionResult> Callback()
        {
            var queryParams = Request.Query
                .Select(kv => new KeyValuePair<string, string>(kv.Key, kv.Value.ToString()))
                .ToList();

            string hashSecret = _config["Vnpay:HashSecret"];

            if (!VnPayHelper.ValidateSignature(queryParams, hashSecret))
                return BadRequest(new { message = "Chữ ký không hợp lệ." });

            string responseCode = Request.Query["vnp_ResponseCode"];
            string txnRef       = Request.Query["vnp_TxnRef"];
            string vnpTxnNo     = Request.Query["vnp_TransactionNo"];
            string vnpMessage   = Request.Query["vnp_OrderInfo"];

            bool success = responseCode == "00";

            if (!int.TryParse(txnRef, out int orderId))
                return BadRequest(new { message = "TxnRef không hợp lệ." });

            // Cập nhật PaymentTransaction
            var tx = await _context.PaymentTransactions
                .Where(t => t.TxnRef == txnRef && t.Status == "Pending")
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();

            if (tx != null)
            {
                tx.ResponseCode     = responseCode;
                tx.VnpTransactionNo = vnpTxnNo;
                tx.Message          = vnpMessage;
                tx.Status           = success ? "Success" : "Failed";
            }

            // Cập nhật Payment record
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId);
            if (payment != null)
            {
                payment.PaymentStatus = success ? "Verified" : "Failed";
            }

            // Cập nhật trạng thái đơn hàng
            var order = await _context.Orders.FindAsync(orderId);
            if (order != null && success && order.Status == "Pending")
            {
                order.Status = "Payment Verified";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success,
                responseCode,
                orderId,
                message = success ? "Thanh toán thành công." : "Thanh toán thất bại hoặc bị huỷ."
            });
        }
    }

    public class CreateVnPayRequest
    {
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
    }
}
