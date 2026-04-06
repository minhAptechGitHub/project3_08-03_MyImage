using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using p3_backend.Models;
using p3_backend.DTOs;
using p3_backend.Services;

namespace p3_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly P3MyImage3Context _context;
        private readonly IWebHostEnvironment _env;
        private readonly IEmailService _emailService;

        public OrdersController(P3MyImage3Context context, IWebHostEnvironment env, IEmailService emailService)
        {
            _context = context;
            _env = env;
            _emailService = emailService;
        }

        // GET: api/Orders (admin)
        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _context.Orders
                .AsNoTracking()
                .Include(o => o.Cust)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Size)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Photo)
                .Select(o => new
                {
                    o.OrderId,
                    o.CustId,
                    o.FolderName,
                    o.OrderDate,                    // ← Trả UTC, frontend convert sau
                    o.TotalPrice,
                    o.ShippingAddress,
                    o.Status,
                    o.PaymentMethod,
                    o.ProcessedByAdminId,
                    Cust = o.Cust == null ? null : new
                    {
                        o.Cust.CustId,
                        o.Cust.FName,
                        o.Cust.LName,
                        o.Cust.Email,
                        o.Cust.PNo,
                        o.Cust.Address
                    },
                    OrderDetails = o.OrderDetails.Select(od => new
                    {
                        od.OrderDetailId,
                        od.PhotoId,
                        od.SizeId,
                        od.Quantity,
                        od.PricePerCopy,
                        od.LineTotal,
                        od.NoteToAdmin,
                        Size = od.Size == null ? null : new
                        {
                            od.Size.SizeId,
                            od.Size.SizeName,
                            od.Size.Price
                        },
                        Photo = od.Photo == null ? null : new
                        {
                            od.Photo.PhotoId,
                            od.Photo.FileName,
                            od.Photo.FilePath
                        }
                    }).ToList()
                })
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            Console.WriteLine($"[GetOrders] Trả về {orders.Count} đơn hàng cho admin");
            return Ok(orders);
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Photo)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Size)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null) return NotFound();
            return order;
        }

        // POST: api/Orders
        [HttpPost]
        public async Task<ActionResult<Order>> PostOrder(OrderCreateDto orderDto)
        {
            if (orderDto == null)
                return BadRequest("Data is null");

            Console.WriteLine($"[PostOrder] Nhận request - CustId: {orderDto.CustId}, DetailsCount: {orderDto.OrderDetails?.Count ?? 0}");

            var order = new Order
            {
                CustId = orderDto.CustId,
                ShippingAddress = orderDto.ShippingAddress,
                Status = orderDto.Status ?? "Pending",
                OrderDate = DateTime.UtcNow,
                TotalPrice = 0,
                PaymentMethod = orderDto.PaymentMethod
            };

            if (orderDto.OrderDetails != null && orderDto.OrderDetails.Any())
            {
                decimal runningTotal = 0;
                foreach (var item in orderDto.OrderDetails)
                {
                    if (item.PhotoId <= 0 || item.PricePerCopy <= 0)
                        return BadRequest("Thông tin ảnh hoặc giá không hợp lệ.");

                    decimal currentLineTotal = (item.Quantity > 0 ? item.Quantity : 1) * item.PricePerCopy;

                    var detail = new OrderDetail
                    {
                        PhotoId = item.PhotoId,
                        SizeId = item.SizeId,
                        Quantity = item.Quantity > 0 ? item.Quantity : 1,
                        PricePerCopy = item.PricePerCopy,
                        LineTotal = currentLineTotal
                    };

                    runningTotal += currentLineTotal;
                    order.OrderDetails.Add(detail);
                }
                order.TotalPrice = runningTotal;
            }
            else
            {
                Console.WriteLine($"[PostOrder] Tạo draft order không có ảnh cho CustId = {orderDto.CustId}");
            }

            try
            {
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                await _context.Entry(order).ReloadAsync();

                Console.WriteLine($"[PostOrder] Tạo thành công Order #{order.OrderId} | Ảnh: {order.OrderDetails.Count}");
                return CreatedAtAction("GetOrder", new { id = order.OrderId }, order);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PostOrder] Lỗi: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/Orders/customer/{custId}/details  ← ĐÃ SỬA LỖI 500
        [HttpGet("customer/{custId}/details")]
        public async Task<IActionResult> GetOrdersByCustomer(int custId)
        {
            var orders = await _context.Orders
                .AsNoTracking()
                .Where(o => o.CustId == custId)
                .Select(o => new
                {
                    o.OrderId,
                    o.OrderDate,                    // ← Trả UTC, frontend convert sau
                    o.TotalPrice,
                    o.ShippingAddress,
                    o.Status,
                    o.FolderName,
                    OrderDetails = o.OrderDetails.Select(od => new
                    {
                        od.OrderDetailId,
                        od.Quantity,
                        od.PricePerCopy,
                        od.LineTotal,
                        od.NoteToAdmin,
                        Photo = od.Photo == null ? null : new { od.Photo.PhotoId, od.Photo.FileName, od.Photo.FilePath },
                        Size = od.Size == null ? null : new { od.Size.SizeId, od.Size.SizeName, od.Size.Price }
                    }).ToList()
                })
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            Console.WriteLine($"[GetOrdersByCustomer] Khách {custId} có {orders.Count} đơn hàng");

            return Ok(orders);
        }

        // Các hàm còn lại giữ nguyên
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, Order order)
        {
            if (id != order.OrderId) return BadRequest();
            _context.Entry(order).State = EntityState.Modified;
            _context.Entry(order).Property(x => x.FolderName).IsModified = false;
            _context.Entry(order).Property(x => x.PaymentMethod).IsModified = false;

            try
            {
                await _context.SaveChangesAsync();
                if (order.Status == "Pending")
                {
                    await SendPendingOrderEmail(order.CustId, id, order.PaymentMethod);
                }
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id)) return NotFound();
                else throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating order: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("Status/{id}")]
        public async Task<IActionResult> PutStatus(int id, [FromBody] string status)
        {
            var order = await _context.Orders
                .Include(o => o.Cust)
                .FirstOrDefaultAsync(o => o.OrderId == id);
            if (order == null) return NotFound("Order not found");

            string oldStatus = order.Status;
            order.Status = status;

            try
            {
                await _context.SaveChangesAsync();
                if (status != "Pending")
                {
                    await SendStatusUpdateEmail(order, status);
                }
                if (status == "Completed")
                {
                    await DeletePhotoFolderForOrder(order);
                }
                return Ok(new { message = "Status updated", oldStatus, newStatus = status });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id)) return NotFound();
                else throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating status: {ex.Message}");
            }
        }

        [HttpPut("PaymentMethod/{id}")]
        public async Task<IActionResult> PutPaymentMethod(int id, [FromBody] string paymentMethod)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();
            order.PaymentMethod = paymentMethod;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        // ===== HELPER METHODS =====
        private async Task SendPendingOrderEmail(int custId, int orderId, string paymentMethod)
        {
            try
            {
                var customer = await _context.Customers.FindAsync(custId);
                if (!string.IsNullOrEmpty(customer?.Email) && paymentMethod != "VNPay")
                {
                    await _emailService.SendOrderStatusEmailAsync(
                        customer.Email,
                        $"{customer.FName} {customer.LName}",
                        orderId,
                        "Pending"
                    );
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SendPendingOrderEmail] Lỗi gửi email: {ex.Message}");
            }
        }

        private async Task SendStatusUpdateEmail(Order order, string newStatus)
        {
            try
            {
                if (!string.IsNullOrEmpty(order.Cust?.Email))
                {
                    await _emailService.SendOrderStatusEmailAsync(
                        order.Cust.Email,
                        $"{order.Cust.FName} {order.Cust.LName}",
                        order.OrderId,
                        newStatus
                    );
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SendStatusUpdateEmail] Lỗi gửi email: {ex.Message}");
            }
        }

        private async Task DeletePhotoFolderForOrder(Order order)
        {
            try
            {
                string folderName = order.FolderName;
                if (string.IsNullOrEmpty(folderName))
                {
                    var photo = await _context.Photos
                        .Where(p => p.CustId == order.CustId && !string.IsNullOrEmpty(p.FilePath))
                        .FirstOrDefaultAsync();
                    if (photo != null)
                    {
                        var normalized = photo.FilePath.Replace("\\", "/");
                        var parts = normalized.Split('/');
                        if (parts.Length >= 2)
                            folderName = parts[^2];
                    }
                }
                if (!string.IsNullOrEmpty(folderName))
                {
                    var folderPath = Path.Combine(_env.WebRootPath, "uploads", folderName);
                    if (Directory.Exists(folderPath))
                    {
                        Directory.Delete(folderPath, recursive: true);
                        Console.WriteLine($"[DeletePhotoFolder] Đã xoá thư mục: {folderPath}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DeletePhotoFolder] Lỗi xoá thư mục: {ex.Message}");
            }
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }
    }
}