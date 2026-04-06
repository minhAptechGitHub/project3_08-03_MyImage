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
    public class PhotosController : ControllerBase
    {
        private readonly P3MyImage3Context _context;
        private readonly IWebHostEnvironment _env;

        public PhotosController(P3MyImage3Context context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/Photos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Photo>>> GetPhotos()
        {
            return await _context.Photos.ToListAsync();
        }

        // GET: api/Photos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Photo>> GetPhoto(int id)
        {
            var photo = await _context.Photos.FindAsync(id);

            if (photo == null)
            {
                return NotFound();
            }

            return photo;
        }

        // PUT: api/Photos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPhoto(int id, Photo photo)
        {
            if (id != photo.PhotoId)
            {
                return BadRequest();
            }

            _context.Entry(photo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PhotoExists(id))
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

        // POST: api/Photos
        [HttpPost]
        public async Task<ActionResult<Photo>> PostPhoto(Photo photo)
        {
            _context.Photos.Add(photo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPhoto", new { id = photo.PhotoId }, photo);
        }

        // DELETE: api/Photos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int id)
        {
            var photo = await _context.Photos.FindAsync(id);
            if (photo == null)
            {
                return NotFound();
            }

            // Xóa file vật lý nếu tồn tại
            if (!string.IsNullOrEmpty(photo.FilePath))
            {
                var fullPath = Path.Combine(
                    _env.WebRootPath,
                    photo.FilePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)
                );
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
            }

            _context.Photos.Remove(photo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PhotoExists(int id)
        {
            return _context.Photos.Any(e => e.PhotoId == id);
        }

        // POST: api/Photos/upload
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UploadPhoto([FromForm] UploadPhotoRequest request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest("No file provided.");

            var file = request.File;
            var orderId = request.OrderId;

            var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                ".jpg", ".jpeg", ".png", ".webp"
            };

            string extension = Path.GetExtension(file.FileName);

            if (!allowedExtensions.Contains(extension))
                return BadRequest($"Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, WEBP.");

            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound($"Order {orderId} not found.");

            string folderName = order.FolderName;

            string uploadRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "user", folderName);
            Directory.CreateDirectory(uploadRoot);

            string fileName = $"{Guid.NewGuid()}{extension}";
            string fullPath = Path.Combine(uploadRoot, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            string relativeFilePath = $"uploads/user/{folderName}/{fileName}";

            return Ok(new
            {
                fileName = fileName,
                filePath = relativeFilePath
            });
        }
    }
}