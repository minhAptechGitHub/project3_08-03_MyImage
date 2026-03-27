using System.Collections.Generic;

namespace p3_backend.DTOs
{
    public class OrderCreateDto
    {
        public int CustId { get; set; }
        public string ShippingAddress { get; set; } = null!;
        public string Status { get; set; } = "Pending";
        public decimal TotalPrice { get; set; }
        public string PaymentMethod { get; set; }

        // Danh sách các ảnh đi kèm đơn hàng này
        public List<OrderDetailCreateDto> OrderDetails { get; set; } = new List<OrderDetailCreateDto>();
    }
}