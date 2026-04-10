using System;
using System.Collections.Generic;

namespace p3_backend.Models;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public int OrderId { get; set; }

    public int? PhotoId { get; set; }

    public int? SizeId { get; set; }

    public int Quantity { get; set; }

    public decimal PricePerCopy { get; set; }

    public string NoteToAdmin { get; set; }

    public decimal? LineTotal { get; set; }

    public virtual Order Order { get; set; }

    public virtual Photo? Photo { get; set; }

    public virtual PrintSize Size { get; set; }
}
