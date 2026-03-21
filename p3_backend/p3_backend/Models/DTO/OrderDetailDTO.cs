namespace p3_backend.DTOs
{
    public class OrderDetailCreateDto
    {
        public int PhotoId { get; set; }
        public int? SizeId { get; set; }
        public int Quantity { get; set; }
        public decimal PricePerCopy { get; set; }
    }
}