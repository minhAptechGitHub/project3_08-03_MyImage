using System;
using System.Collections.Generic;

namespace p3_backend.Models;

public partial class Photo
{
    public int PhotoId { get; set; }

    public int CustId { get; set; }

    public string FileName { get; set; }

    public string FilePath { get; set; }

    public DateTime UploadDate { get; set; }

    public virtual Customer Cust { get; set; }

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}
