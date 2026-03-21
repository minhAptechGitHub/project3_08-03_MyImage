using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using p3_backend.Models;

namespace p3_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrintSizesController : ControllerBase
    {
        private readonly P3MyImage3Context _context;

        public PrintSizesController(P3MyImage3Context context)
        {
            _context = context;
        }

        // GET: api/PrintSizes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PrintSize>>> GetPrintSizes()
        {
            return await _context.PrintSizes.ToListAsync();
        }

        // GET: api/PrintSizes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PrintSize>> GetPrintSize(int id)
        {
            var printSize = await _context.PrintSizes.FindAsync(id);

            if (printSize == null)
            {
                return NotFound();
            }

            return printSize;
        }

        // GET: api/PrintSizes/ByTemplate/5
        [HttpGet("ByTemplate/{templateId}")]
        public async Task<ActionResult<IEnumerable<PrintSize>>> GetPrintSizesByTemplate(int templateId)
        {
            // Lọc danh sách size theo ID của loại sản phẩm (Rửa ảnh, Canvas, v.v.)
            var sizes = await _context.PrintSizes
                .Where(s => s.TemplateId == templateId && s.IsAvailable == true)
                .OrderBy(s => s.Price) // Sắp xếp giá từ thấp đến cao cho khách dễ chọn
                .ToListAsync();

            if (sizes == null || !sizes.Any())
            {
                return NotFound(new { message = "Không tìm thấy kích thước nào cho loại sản phẩm này." });
            }

            return sizes;
        }

        // PUT: api/PrintSizes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPrintSize(int id, PrintSize printSize)
        {
            if (id != printSize.SizeId)
            {
                return BadRequest();
            }

            _context.Entry(printSize).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PrintSizeExists(id))
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

        // POST: api/PrintSizes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<PrintSize>> PostPrintSize(PrintSize printSize)
        {
            _context.PrintSizes.Add(printSize);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPrintSize", new { id = printSize.SizeId }, printSize);
        }

        // DELETE: api/PrintSizes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrintSize(int id)
        {
            var printSize = await _context.PrintSizes.FindAsync(id);
            if (printSize == null)
            {
                return NotFound();
            }

            _context.PrintSizes.Remove(printSize);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PrintSizeExists(int id)
        {
            return _context.PrintSizes.Any(e => e.SizeId == id);
        }
    }
}
