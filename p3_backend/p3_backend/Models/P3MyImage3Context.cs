using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace p3_backend.Models;

public partial class P3MyImage3Context : DbContext
{
    public P3MyImage3Context()
    {
    }

    public P3MyImage3Context(DbContextOptions<P3MyImage3Context> options)
        : base(options)
    {
    }

    public virtual DbSet<Admin> Admins { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Photo> Photos { get; set; }

    public virtual DbSet<PrintSize> PrintSizes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.AdminId).HasName("PK__Admins__43AA4141C4B89A0D");

            entity.HasIndex(e => e.Username, "UQ__Admins__F3DBC5726F318138").IsUnique();

            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("password");
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("username");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustId).HasName("PK__Customer__A1B71F90DD4692AB");

            entity.HasIndex(e => e.Email, "UQ__Customer__AB6E616402A89FDD").IsUnique();

            entity.HasIndex(e => e.Username, "UQ__Customer__F3DBC572D4BF0306").IsUnique();

            entity.Property(e => e.CustId).HasColumnName("cust_id");
            entity.Property(e => e.Address)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("address");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Dob).HasColumnName("dob");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.FName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("f_name");
            entity.Property(e => e.Gender)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("gender");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("l_name");
            entity.Property(e => e.PNo)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("p_no");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("password");
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("username");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__46596229692C0FFA");

            entity.HasIndex(e => e.FolderName, "UQ__Orders__3AFC5A91D4D3CB57").IsUnique();

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.CustId).HasColumnName("cust_id");
            entity.Property(e => e.FolderName)
                .HasMaxLength(11)
                .IsUnicode(false)
                .HasComputedColumnSql("('folder_'+right('0000'+CONVERT([varchar](4),[order_id]),(4)))", true)
                .HasColumnName("folder_name");
            entity.Property(e => e.OrderDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("order_date");
            entity.Property(e => e.ProcessedByAdminId).HasColumnName("processed_by_admin_id");
            entity.Property(e => e.ShippingAddress)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("shipping_address");
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("Pending")
                .HasColumnName("status");
            entity.Property(e => e.TotalPrice)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("total_price");

            entity.HasOne(d => d.Cust).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Orders__cust_id__48CFD27E");

            entity.HasOne(d => d.ProcessedByAdmin).WithMany(p => p.Orders)
                .HasForeignKey(d => d.ProcessedByAdminId)
                .HasConstraintName("FK__Orders__processe__4D94879B");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__OrderDet__3C5A40808D4A7FE4");

            entity.HasIndex(e => new { e.OrderId, e.PhotoId, e.SizeId }, "UQ_OrderDetails_Photo_Size").IsUnique();

            entity.Property(e => e.OrderDetailId).HasColumnName("order_detail_id");
            entity.Property(e => e.LineTotal)
                .HasComputedColumnSql("([quantity]*[price_per_copy])", true)
                .HasColumnType("decimal(21, 2)")
                .HasColumnName("line_total");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PhotoId).HasColumnName("photo_id");
            entity.Property(e => e.PricePerCopy)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price_per_copy");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.SizeId).HasColumnName("size_id");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderDeta__order__68487DD7");

            entity.HasOne(d => d.Photo).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.PhotoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderDeta__photo__693CA210");

            entity.HasOne(d => d.Size).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.SizeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderDeta__size___6A30C649");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__ED1FC9EAF1E202B2");

            entity.HasIndex(e => e.OrderId, "UQ__Payments__46596228C519FB8A").IsUnique();

            entity.Property(e => e.PaymentId).HasColumnName("payment_id");
            entity.Property(e => e.CreditCardEncrypted)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("credit_card_encrypted");
            entity.Property(e => e.EncryptionMethod)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("encryption_method");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PaymentDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("payment_date");
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("payment_method");
            entity.Property(e => e.PaymentStatus)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("Pending")
                .HasColumnName("payment_status");

            entity.HasOne(d => d.Order).WithOne(p => p.Payment)
                .HasForeignKey<Payment>(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payments__order___6EF57B66");
        });

        modelBuilder.Entity<Photo>(entity =>
        {
            entity.HasKey(e => e.PhotoId).HasName("PK__Photos__CB48C83DCCFDE9AF");

            entity.Property(e => e.PhotoId).HasColumnName("photo_id");
            entity.Property(e => e.CustId).HasColumnName("cust_id");
            entity.Property(e => e.FileName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("file_name");
            entity.Property(e => e.FilePath)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("file_path");
            entity.Property(e => e.UploadDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("upload_date");

            entity.HasOne(d => d.Cust).WithMany(p => p.Photos)
                .HasForeignKey(d => d.CustId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Photos__cust_id__5070F446");
        });

        modelBuilder.Entity<PrintSize>(entity =>
        {
            entity.HasKey(e => e.SizeId).HasName("PK__PrintSiz__0DCACE3197135B68");

            entity.HasIndex(e => e.SizeName, "UQ__PrintSiz__75FCE5562422D4B7").IsUnique();

            entity.Property(e => e.SizeId).HasColumnName("size_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.IsAvailable)
                .HasDefaultValue(true)
                .HasColumnName("is_available");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price");
            entity.Property(e => e.SizeName)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("size_name");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
