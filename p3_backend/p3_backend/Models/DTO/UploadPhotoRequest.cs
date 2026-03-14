namespace p3_backend.Models.DTO
{
    public class UploadPhotoRequest
    {
        public IFormFile File { get; set; } = null!;
        public int OrderId { get; set; }
    }
}
