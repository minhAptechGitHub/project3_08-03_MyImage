using System;
using System.Collections.Generic;

namespace p3_backend.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public int CustId { get; set; }

    public string? FolderName { get; set; }

    public DateTime OrderDate { get; set; }

    public decimal TotalPrice { get; set; }

    public string ShippingAddress { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int? ProcessedByAdminId { get; set; }

    public virtual Customer Cust { get; set; } = null!;

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual Payment? Payment { get; set; }

    public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();

    public virtual Admin? ProcessedByAdmin { get; set; }
}
