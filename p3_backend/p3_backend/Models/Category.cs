namespace p3_backend.Models
{
    public class Category
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string Slug { get; set; }

        public ICollection<ProductTemplate> ProductTemplates { get; set; }
    }
}
