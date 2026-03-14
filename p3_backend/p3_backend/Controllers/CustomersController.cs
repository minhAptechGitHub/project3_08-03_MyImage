using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using p3_backend.Models;
using p3_backend.Models.DTO;

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
            {
                return NotFound();
            }

            return customer;
        }

        // PUT: api/Customers/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCustomer(int id, Customer customer)
        {
            if (id != customer.CustId)
            {
                return BadRequest();
            }

            // Only hash if password was changed (not already a bcrypt hash)
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

        // POST: api/Customers
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Customer>> PostCustomer(Customer customer)
        {
            // Hash the password before saving
            customer.Password = BCrypt.Net.BCrypt.HashPassword(customer.Password);

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetCustomer", new { id = customer.CustId }, customer);
        }

        // DELETE: api/Customers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound();
            }

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CustomerExists(int id)
        {
            return _context.Customers.Any(e => e.CustId == id);
        }


        //Login: api/Customer/

        [HttpPost("login")]
        public async Task<ActionResult<Customer>> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrEmpty(dto.Username))
                return BadRequest("Username is required");

            var customer = await _context.Customers
                .FirstOrDefaultAsync(m => m.Username == dto.Username);

            if (customer == null || !BCrypt.Net.BCrypt.Verify(dto.Password, customer.Password))
                return Unauthorized("Invalid username or password");

            return Ok(customer);
        }
    }
}
