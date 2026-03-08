using System;
using System.Collections.Generic;

namespace p3_backend.Models;

public partial class PrintSize
{
    public int SizeId { get; set; }

    public string SizeName { get; set; } = null!;

    public decimal Price { get; set; }

    public bool IsAvailable { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}
