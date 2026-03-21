using System;
using System.Collections.Generic;

namespace p3_backend.Models;

public partial class ProductGallery
{
    public int GalleryId { get; set; }

    public int TemplateId { get; set; }

    public string ImageUrl { get; set; }

    public virtual ProductTemplate Template { get; set; }
}
