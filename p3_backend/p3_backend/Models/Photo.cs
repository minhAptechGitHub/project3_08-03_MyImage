using System;
using System.Collections.Generic;

namespace p3_backend.Models;

public partial class Photo
{
    public int PhotoId { get; set; }

    public int OrderId { get; set; }

    public int CustId { get; set; }

    public string FileName { get; set; } = null!;

    public string FilePath { get; set; } = null!;

    public DateTime UploadDate { get; set; }

    public virtual Customer Cust { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}
