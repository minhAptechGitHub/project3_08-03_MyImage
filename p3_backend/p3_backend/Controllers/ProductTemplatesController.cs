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
    public class ProductTemplatesController : ControllerBase
    {
        private readonly P3MyImage3Context _context;

        public ProductTemplatesController(P3MyImage3Context context)
        {
            _context = context;
        }

        // GET: api/ProductTemplates
        // Lấy danh sách tất cả các loại dịch vụ (Canvas, Rửa ảnh, Polaroid...)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductTemplate>>> GetProductTemplates()
        {
            return await _context.ProductTemplates
                .OrderBy(t => t.TemplateId)
                .ToListAsync();
        }

        // GET: api/ProductTemplates/5
        // Lấy chi tiết 1 loại dịch vụ kèm theo các Size và Gallery của nó
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductTemplate>> GetProductTemplate(int id)
        {
            var productTemplate = await _context.ProductTemplates
                .Include(t => t.PrintSizes)     // Lấy luôn danh sách các kích thước (10x15, 13x18...)
                .Include(t => t.ProductGalleries) // Lấy luôn danh sách ảnh mẫu demo
                .FirstOrDefaultAsync(t => t.TemplateId == id);

            if (productTemplate == null)
            {
                return NotFound(new { message = "Không tìm thấy loại sản phẩm này." });
            }

            return productTemplate;
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<ProductTemplate>>> GetActiveTemplates()
        {
            return await _context.ProductTemplates
                .Where(t => t.IsActive)
                .OrderBy(t => t.TemplateId)
                .ToListAsync();
        }

        // PUT: api/ProductTemplates/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProductTemplate(int id, ProductTemplate productTemplate)
        {
            if (id != productTemplate.TemplateId)
            {
                return BadRequest();
            }

            _context.Entry(productTemplate).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductTemplateExists(id))
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

        // POST: api/ProductTemplates
        [HttpPost]
        public async Task<ActionResult<ProductTemplate>> PostProductTemplate(ProductTemplate productTemplate)
        {
            _context.ProductTemplates.Add(productTemplate);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProductTemplate", new { id = productTemplate.TemplateId }, productTemplate);
        }

        // DELETE: api/ProductTemplates/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductTemplate(int id)
        {
            var productTemplate = await _context.ProductTemplates.FindAsync(id);
            if (productTemplate == null)
            {
                return NotFound();
            }

            // Lưu ý: Nếu có ràng buộc khóa ngoại, bạn cần xử lý xóa các PrintSize/Gallery liên quan trước 
            // hoặc thiết lập Cascade Delete trong Database.
            _context.ProductTemplates.Remove(productTemplate);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductTemplateExists(int id)
        {
            return _context.ProductTemplates.Any(e => e.TemplateId == id);
        }

        // POST: api/ProductTemplates/upload
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadTemplateImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file provided.");

            var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    ".jpg", ".jpeg", ".png", ".webp"
                };

            string extension = Path.GetExtension(file.FileName);

            if (!allowedExtensions.Contains(extension))
                return BadRequest($"Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, WEBP.");

            string uploadRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "templates");
            Directory.CreateDirectory(uploadRoot);

            string fileName = $"{Guid.NewGuid()}{extension}";
            string fullPath = Path.Combine(uploadRoot, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            string relativeFilePath = $"uploads/templates/{fileName}";

            return Ok(new
            {
                fileName = fileName,
                filePath = relativeFilePath
            });
        }
    }
}