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

    public virtual DbSet<ProductGallery> ProductGalleries { get; set; }

    public virtual DbSet<ProductTemplate> ProductTemplates { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.AdminId).HasName("PK__Admins__43AA4141082751F8");

            entity.HasIndex(e => e.Username, "UQ__Admins__F3DBC57220EB5890").IsUnique();

            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Password)
                .IsRequired()
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("password");
            entity.Property(e => e.Username)
                .IsRequired()
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("username");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustId).HasName("PK__Customer__A1B71F9008AF352D");

            entity.HasIndex(e => e.Email, "UQ__Customer__AB6E6164346F7110").IsUnique();

            entity.HasIndex(e => e.Username, "UQ__Customer__F3DBC5724C68D63C").IsUnique();

            entity.Property(e => e.CustId).HasColumnName("cust_id");
            entity.Property(e => e.Address)
                .HasMaxLength(255)
                .HasColumnName("address");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Dob).HasColumnName("dob");
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.FName)
                .IsRequired()
                .HasMaxLength(50)
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
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnName("l_name");
            entity.Property(e => e.PNo)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("p_no");
            entity.Property(e => e.Password)
                .IsRequired()
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("password");
            entity.Property(e => e.Username)
                .IsRequired()
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("username");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__465962292ED791DD");

            entity.HasIndex(e => e.FolderName, "UQ__Orders__3AFC5A9105B1ACE4").IsUnique();

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
                .IsRequired()
                .HasMaxLength(500)
                .HasColumnName("shipping_address");
            entity.Property(e => e.Status)
                .IsRequired()
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
                .HasConstraintName("FK_Orders_Customers");

            entity.HasOne(d => d.ProcessedByAdmin).WithMany(p => p.Orders)
                .HasForeignKey(d => d.ProcessedByAdminId)
                .HasConstraintName("FK_Orders_Admins");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__OrderDet__3C5A4080731C6E7C");

            entity.Property(e => e.OrderDetailId).HasColumnName("order_detail_id");
            entity.Property(e => e.LineTotal)
                .HasComputedColumnSql("([quantity]*[price_per_copy])", true)
                .HasColumnType("decimal(21, 2)")
                .HasColumnName("line_total");
            entity.Property(e => e.NoteToAdmin)
                .HasMaxLength(500)
                .HasColumnName("note_to_admin");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PhotoId).HasColumnName("photo_id");
            entity.Property(e => e.PricePerCopy)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price_per_copy");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.SizeId).HasColumnName("size_id");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_OrderDetails_Orders");

            entity.HasOne(d => d.Photo).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.PhotoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderDetails_Photos");

            entity.HasOne(d => d.Size).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.SizeId)
                .HasConstraintName("FK_OrderDetails_PrintSizes");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__ED1FC9EA0798E46A");

            entity.HasIndex(e => e.OrderId, "UQ__Payments__465962282B0C99B1").IsUnique();

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
                .IsRequired()
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("payment_method");
            entity.Property(e => e.PaymentStatus)
                .IsRequired()
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("Pending")
                .HasColumnName("payment_status");

            entity.HasOne(d => d.Order).WithOne(p => p.Payment)
                .HasForeignKey<Payment>(d => d.OrderId)
                .HasConstraintName("FK_Payments_Orders");
        });

        modelBuilder.Entity<Photo>(entity =>
        {
            entity.HasKey(e => e.PhotoId).HasName("PK__Photos__CB48C83D07463E73");

            entity.Property(e => e.PhotoId).HasColumnName("photo_id");
            entity.Property(e => e.CustId).HasColumnName("cust_id");
            entity.Property(e => e.FileName)
                .IsRequired()
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("file_name");
            entity.Property(e => e.FilePath)
                .IsRequired()
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("file_path");
            entity.Property(e => e.UploadDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("upload_date");

            entity.HasOne(d => d.Cust).WithMany(p => p.Photos)
                .HasForeignKey(d => d.CustId)
                .HasConstraintName("FK_Photos_Customers");
        });

        modelBuilder.Entity<PrintSize>(entity =>
        {
            entity.HasKey(e => e.SizeId).HasName("PK__PrintSiz__0DCACE319866020C");

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
                .IsRequired()
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("size_name");
            entity.Property(e => e.TemplateId).HasColumnName("template_id");

            entity.HasOne(d => d.Template).WithMany(p => p.PrintSizes)
                .HasForeignKey(d => d.TemplateId)
                .HasConstraintName("FK_PrintSizes_ProductTemplates");
        });

        modelBuilder.Entity<ProductGallery>(entity =>
        {
            entity.HasKey(e => e.GalleryId).HasName("PK__ProductG__43D54A71596AAEB7");

            entity.ToTable("ProductGallery");

            entity.Property(e => e.GalleryId).HasColumnName("gallery_id");
            entity.Property(e => e.Caption)
                .HasMaxLength(255)
                .HasColumnName("caption");
            entity.Property(e => e.ImageUrl)
                .IsRequired()
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("image_url");
            entity.Property(e => e.TemplateId).HasColumnName("template_id");

            entity.HasOne(d => d.Template).WithMany(p => p.ProductGalleries)
                .HasForeignKey(d => d.TemplateId)
                .HasConstraintName("FK_ProductGallery_ProductTemplates");
        });

        modelBuilder.Entity<ProductTemplate>(entity =>
        {
            entity.HasKey(e => e.TemplateId).HasName("PK__ProductT__BE44E079598D3B26");

            entity.Property(e => e.TemplateId).HasColumnName("template_id");
            entity.Property(e => e.Details).HasColumnName("details");
            entity.Property(e => e.ImageUrl)
                .IsRequired()
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("image_url");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LeadTime)
                .HasMaxLength(100)
                .HasDefaultValue("2-3 ngày")
                .HasColumnName("lead_time");
            entity.Property(e => e.TemplateName)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnName("template_name");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
