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

namespace p3_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly P3MyImage3Context _context;
        private readonly IWebHostEnvironment _env;

        public OrdersController(P3MyImage3Context context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/Orders
        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _context.Orders
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
                    o.OrderDate,
                    o.TotalPrice,
                    o.ShippingAddress,
                    o.Status,
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
            if (orderDto == null) return BadRequest("Data is null");

            var order = new Order
            {
                CustId = orderDto.CustId,
                ShippingAddress = orderDto.ShippingAddress,
                Status = orderDto.Status ?? "Pending",
                OrderDate = DateTime.Now,
                TotalPrice = 0,
                PaymentMethod = orderDto.PaymentMethod
            };

            if (orderDto.OrderDetails != null && orderDto.OrderDetails.Any())
            {
                decimal runningTotal = 0;

                foreach (var item in orderDto.OrderDetails)
                {
                    decimal currentLineTotal = (item.Quantity > 0 ? item.Quantity : 1) * item.PricePerCopy;

                    var detail = new OrderDetail
                    {
                        PhotoId = item.PhotoId,
                        SizeId = item.SizeId,
                        Quantity = item.Quantity,
                        PricePerCopy = item.PricePerCopy,
                        LineTotal = currentLineTotal
                    };

                    runningTotal += currentLineTotal;
                    order.OrderDetails.Add(detail);
                }

                order.TotalPrice = runningTotal;
            }

            try
            {
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                await _context.Entry(order).ReloadAsync();
                return CreatedAtAction("GetOrder", new { id = order.OrderId }, order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/Orders/5
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
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Orders/customer/{custId}/details
        [HttpGet("customer/{custId}/details")]
        public async Task<IActionResult> GetOrdersByCustomer(int custId)
        {
            var orders = await _context.Orders
                .Where(o => o.CustId == custId)
                .Select(o => new
                {
                    o.OrderId,
                    o.OrderDate,
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

            return Ok(orders);
        }

        // PUT: api/Orders/Status/{id}
        [HttpPut("Status/{id}")]
        public async Task<IActionResult> PutStatus(int id, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = status;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id)) return NotFound();
                else throw;
            }

            if (status == "Completed")
            {
                await DeletePhotoFolderForOrder(order);
            }

            return NoContent();
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
                        if (parts.Length >= 4)
                            folderName = parts[2];
                    }
                }

                if (string.IsNullOrEmpty(folderName)) return;

                var webRoot = _env.WebRootPath ?? _env.ContentRootPath;
                var folderPath = Path.Combine(webRoot, "uploads", "user", folderName);

                Console.WriteLine($"[DeletePhotoFolder] Tìm folder: {folderPath}");

                if (Directory.Exists(folderPath))
                {
                    Directory.Delete(folderPath, recursive: true);
                    Console.WriteLine($"[DeletePhotoFolder] Đã xóa folder: {folderPath}");
                }
                else
                {
                    Console.WriteLine($"[DeletePhotoFolder] Không tìm thấy folder: {folderPath}");
                }

                var photos = await _context.Photos
                    .Where(p => p.CustId == order.CustId)
                    .ToListAsync();

                if (photos.Any())
                {
                    _context.Photos.RemoveRange(photos);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"[DeletePhotoFolder] Đã xóa {photos.Count} ảnh khỏi DB");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DeletePhotoFolder] Lỗi khi xóa folder đơn #{order.OrderId}: {ex.Message}");
            }
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }
    }
}