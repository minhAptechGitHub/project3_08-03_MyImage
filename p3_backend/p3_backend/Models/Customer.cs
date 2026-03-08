using System;
using System.Collections.Generic;

namespace p3_backend.Models;

public partial class Customer
{
    public int CustId { get; set; }

    public string FName { get; set; } = null!;

    public string LName { get; set; } = null!;

    public DateOnly? Dob { get; set; }

    public string? Gender { get; set; }

    public string? PNo { get; set; }

    public string? Address { get; set; }

    public string Email { get; set; } = null!;

    public string Username { get; set; } = null!;

    public string Password { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();
}
