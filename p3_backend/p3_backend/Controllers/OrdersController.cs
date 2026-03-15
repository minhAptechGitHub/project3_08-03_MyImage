using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        public OrdersController(P3MyImage3Context context)
        {
            _context = context;
        }

        // GET: api/Orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return await _context.Orders
                .Include(o => o.Cust)
                .Include(o => o.OrderDetails)
                .ToListAsync();
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Photo) // Include thêm Photo để xem chi tiết
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null) return NotFound();
            return order;
        }

        // POST: api/Orders
        // SỬA TẠI ĐÂY: Nhận OrderCreateDto thay vì Order
        [HttpPost]
        public async Task<ActionResult<Order>> PostOrder(OrderCreateDto orderDto)
        {
            if (orderDto == null) return BadRequest("Data is null");

            // 1. Khởi tạo Order Entity
            var order = new Order
            {
                CustId = orderDto.CustId,
                ShippingAddress = orderDto.ShippingAddress,
                Status = orderDto.Status ?? "Pending",
                OrderDate = DateTime.Now,
                TotalPrice = 0 // Mặc định là 0, sẽ tính ở dưới
            };

            // 2. Xử lý tính toán tiền bạc (Logic quan trọng)
            if (orderDto.OrderDetails != null && orderDto.OrderDetails.Any())
            {
                decimal runningTotal = 0;

                foreach (var item in orderDto.OrderDetails)
                {
                    // Tính toán LineTotal dựa trên dữ liệu thực tế từ DTO
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

                // Gán tổng tiền sau khi đã duyệt hết danh sách ảnh
                order.TotalPrice = runningTotal;
            }

            // 3. Lưu vào Database
            try
            {
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Load lại để lấy FolderName (Computed) và các dữ liệu phát sinh từ DB
                await _context.Entry(order).ReloadAsync();

                // Trả về Order đã có đầy đủ ID và TotalPrice
                return CreatedAtAction("GetOrder", new { id = order.OrderId }, order);
            }
            catch (Exception ex)
            {
                // Log lỗi chi tiết nếu có
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/Orders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, Order order)
        {
            if (id != order.OrderId) return BadRequest();

            _context.Entry(order).State = EntityState.Modified;
            // Giữ nguyên FolderName cũ, không cho sửa qua API
            _context.Entry(order).Property(x => x.FolderName).IsModified = false;

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
                        Photo = new { od.Photo.PhotoId, od.Photo.FileName, od.Photo.FilePath },
                        Size = new { od.Size.SizeId, od.Size.SizeName, od.Size.Price }
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

            if (order == null)
            {
                return NotFound();
            }

            order.Status = status;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }
    }
}