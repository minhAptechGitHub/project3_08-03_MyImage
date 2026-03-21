using System;
using System.Collections.Generic;

namespace p3_backend.Models;

public partial class ProductTemplate
{
    public int TemplateId { get; set; }

    public string TemplateName { get; set; }

    public string ImageUrl { get; set; }

    public string Details { get; set; }

    public string LeadTime { get; set; }

    public bool IsActive { get; set; }

    public virtual ICollection<PrintSize> PrintSizes { get; set; } = new List<PrintSize>();

    public virtual ICollection<ProductGallery> ProductGalleries { get; set; } = new List<ProductGallery>();
}
