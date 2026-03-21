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
    public class ProductGalleryController : ControllerBase
    {
        private readonly P3MyImage3Context _context;

        public ProductGalleryController(P3MyImage3Context context)
        {
            _context = context;
        }

        // GET: api/ProductGallery
        // Lấy tất cả ảnh mẫu trong hệ thống (Dùng cho Admin)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductGallery>>> GetProductGalleries()
        {
            return await _context.ProductGalleries
                .Include(pg => pg.Template) // Hiển thị kèm thông tin loại sản phẩm
                .ToListAsync();
        }

        // GET: api/ProductGallery/ByTemplate/5
        // LẤY QUAN TRỌNG: Lấy danh sách ảnh demo cho một loại dịch vụ cụ thể
        [HttpGet("ByTemplate/{templateId}")]
        public async Task<ActionResult<IEnumerable<ProductGallery>>> GetGalleryByTemplate(int templateId)
        {
            var gallery = await _context.ProductGalleries
                .Where(pg => pg.TemplateId == templateId)
                .ToListAsync();

            if (gallery == null || !gallery.Any())
            {
                return NotFound(new { message = "Chưa có ảnh mẫu cho loại sản phẩm này." });
            }

            return gallery;
        }

        // GET: api/ProductGallery/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductGallery>> GetProductGallery(int id)
        {
            var productGallery = await _context.ProductGalleries.FindAsync(id);

            if (productGallery == null)
            {
                return NotFound();
            }

            return productGallery;
        }

        // PUT: api/ProductGallery/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProductGallery(int id, ProductGallery productGallery)
        {
            if (id != productGallery.GalleryId)
            {
                return BadRequest();
            }

            _context.Entry(productGallery).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductGalleryExists(id))
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

        // POST: api/ProductGallery
        [HttpPost]
        public async Task<ActionResult<ProductGallery>> PostProductGallery(ProductGallery productGallery)
        {
            _context.ProductGalleries.Add(productGallery);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProductGallery", new { id = productGallery.GalleryId }, productGallery);
        }

        // DELETE: api/ProductGallery/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductGallery(int id)
        {
            var productGallery = await _context.ProductGalleries.FindAsync(id);
            if (productGallery == null)
            {
                return NotFound();
            }

            _context.ProductGalleries.Remove(productGallery);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductGalleryExists(int id)
        {
            return _context.ProductGalleries.Any(e => e.GalleryId == id);
        }

        // POST: api/ProductGallery/upload
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadGalleryImage(IFormFile file)
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

            string uploadRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "galleries");
            Directory.CreateDirectory(uploadRoot);

            string fileName = $"{Guid.NewGuid()}{extension}";
            string fullPath = Path.Combine(uploadRoot, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            string relativeFilePath = $"uploads/galleries/{fileName}";

            return Ok(new
            {
                fileName = fileName,
                filePath = relativeFilePath
            });
        }
    }
}