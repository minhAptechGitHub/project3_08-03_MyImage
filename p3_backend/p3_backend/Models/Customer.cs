using System;
using System.Collections.Generic;

namespace p3_backend.Models;

public partial class Customer
{
    public int CustId { get; set; }

    public string FName { get; set; }

    public string LName { get; set; }

    public DateOnly? Dob { get; set; }

    public string Gender { get; set; }

    public string PNo { get; set; }

    public string Address { get; set; }

    public string Email { get; set; }

    public string Username { get; set; }

    public string Password { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();
}
