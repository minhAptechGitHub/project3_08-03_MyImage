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
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductTemplate>>> GetProductTemplates()
        {
            return await _context.ProductTemplates
                .OrderBy(t => t.TemplateId)
                .ToListAsync();
        }

        // GET: api/ProductTemplates/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductTemplate>> GetProductTemplate(int id)
        {
            var productTemplate = await _context.ProductTemplates
                .Include(t => t.PrintSizes)
                .Include(t => t.ProductGalleries)
                .FirstOrDefaultAsync(t => t.TemplateId == id);

            if (productTemplate == null)
                return NotFound(new { message = "Không tìm thấy loại sản phẩm này." });

            return productTemplate;
        }

        // GET: api/ProductTemplates/active
        // GET: api/ProductTemplates/active?category=photobook
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<ProductTemplate>>> GetActiveTemplates(
            [FromQuery] string? category = null)
        {
            var query = _context.ProductTemplates
                .Where(t => t.IsActive);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(t => t.Category == category);

            return await query.OrderBy(t => t.TemplateId).ToListAsync();
        }

        // GET: api/ProductTemplates/category/in-anh
        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<ProductTemplate>>> GetTemplatesByCategory(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
                return BadRequest(new { message = "Danh mục không hợp lệ." });

            var templates = await _context.ProductTemplates
                .Where(t => t.IsActive && t.Category == category)
                .OrderBy(t => t.TemplateId)
                .ToListAsync();

            return Ok(templates);
        }

        // GET: api/ProductTemplates/featured
        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<ProductTemplate>>> GetFeaturedTemplates()
        {
            return await _context.ProductTemplates
                .Where(t => t.IsActive && t.IsFeatured)
                .OrderBy(t => t.TemplateId)
                .ToListAsync();
        }

        // PUT: api/ProductTemplates/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutProductTemplate(int id, ProductTemplate productTemplate)
        {
            if (id != productTemplate.TemplateId)
                return BadRequest();

            _context.Entry(productTemplate).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductTemplateExists(id))
                    return NotFound();
                else
                    throw;
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
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteProductTemplate(int id)
        {
            var productTemplate = await _context.ProductTemplates.FindAsync(id);
            if (productTemplate == null)
                return NotFound();

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
        public async Task<IActionResult> UploadTemplateImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file provided.");

            var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                { ".jpg", ".jpeg", ".png", ".webp" };

            string extension = Path.GetExtension(file.FileName);

            if (!allowedExtensions.Contains(extension))
                return BadRequest("Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, WEBP.");

            string uploadRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "templates");
            Directory.CreateDirectory(uploadRoot);

            string fileName = $"{Guid.NewGuid()}{extension}";
            string fullPath = Path.Combine(uploadRoot, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new
            {
                fileName = fileName,
                filePath = $"uploads/templates/{fileName}"
            });
        }
    }
}