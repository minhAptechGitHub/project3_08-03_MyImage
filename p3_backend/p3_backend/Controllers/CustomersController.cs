using BCrypt.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using p3_backend.Helpers;
using p3_backend.Models;
using p3_backend.Models.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace p3_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly P3MyImage3Context _context;

        public CustomersController(P3MyImage3Context context)
        {
            _context = context;
        }

        // GET: api/Customers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            return await _context.Customers.ToListAsync();
        }

        // GET: api/Customers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound();
            return customer;
        }

        // PUT: api/Customers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCustomer(int id, Customer customer)
        {
            if (id != customer.CustId)
                return BadRequest();

            if (!customer.Password.StartsWith("$2"))
                customer.Password = BCrypt.Net.BCrypt.HashPassword(customer.Password);

            _context.Entry(customer).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CustomerExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // POST: api/Customers (đăng ký)
        [HttpPost]
        public async Task<ActionResult<Customer>> PostCustomer(Customer customer)
        {
            // Kiểm tra username đã tồn tại chưa
            var usernameExists = await _context.Customers
                .AnyAsync(c => c.Username.ToLower() == customer.Username.ToLower());
            if (usernameExists)
                return Conflict(new { message = "Tên đăng nhập đã tồn tại." });

            // Kiểm tra email đã tồn tại chưa
            if (!string.IsNullOrWhiteSpace(customer.Email))
            {
                var emailExists = await _context.Customers
                    .AnyAsync(c => c.Email.ToLower() == customer.Email.ToLower());
                if (emailExists)
                    return Conflict(new { message = "Email đã được sử dụng." });
            }

            customer.Password = BCrypt.Net.BCrypt.HashPassword(customer.Password);
            customer.CreatedAt = DateTime.Now;
            customer.IsActive = true;

            _context.Customers.Add(customer);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("UNIQUE") == true
                                             || ex.InnerException?.Message.Contains("duplicate") == true)
            {
                return Conflict(new { message = "Tên đăng nhập hoặc email đã tồn tại." });
            }

            return CreatedAtAction(nameof(GetCustomer), new { id = customer.CustId }, customer);
        }

        // DELETE: api/Customers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound();

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CustomerExists(int id)
        {
            return _context.Customers.Any(e => e.CustId == id);
        }

        // POST: api/customers/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username))
                return BadRequest(new { message = "Username is required" });

            if (string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Password is required" });

            var customer = await _context.Customers
                .FirstOrDefaultAsync(m => m.Username.Trim().ToLower() == dto.Username.Trim().ToLower());

            if (customer == null || (!BCrypt.Net.BCrypt.Verify(dto.Password, customer.Password) && customer.Password != dto.Password))
                return Unauthorized(new { message = "Invalid username or password" });

            if (!customer.IsActive)
                return Unauthorized(new { message = "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ." });

            var token = JwtHelper.GenerateToken(customer.Username, "Customer", customer.CustId);

            return Ok(new
            {
                user = customer,
                token = token
            });
        }
    }
}