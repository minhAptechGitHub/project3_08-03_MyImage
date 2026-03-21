using Microsoft.CodeAnalysis.Scripting;
using Microsoft.EntityFrameworkCore;
using p3_backend.Models;
using System;

namespace p3_backend.Data
{

    public static class DbSeeder
    {
        public static async Task SeedData(P3MyImage3Context context)
        {
            // ============================================================
            // CUSTOMERS (5)
            // ============================================================
            if (!context.Customers.Any())
            {
                var customers = new Customer[]
                {
                new Customer
                {
                    FName     = "Van",
                    LName     = "An",
                    Dob       = new DateOnly(2000, 3, 15),
                    Gender    = "M",
                    PNo       = "0912345678",
                    Address   = "12 Ly Thuong Kiet, Ha Noi",
                    Email     = "an.nguyen@gmail.com",
                    Username  = "annguyen",
                    Password  = BCrypt.Net.BCrypt.HashPassword("Cust@123"),
                    IsActive  = true,
                    CreatedAt = DateTime.Now
                },
                new Customer
                {
                    FName     = "Thi",
                    LName     = "Binh",
                    Dob       = new DateOnly(1998, 7, 22),
                    Gender    = "F",
                    PNo       = "0987654321",
                    Address   = "45 Tran Hung Dao, Ho Chi Minh",
                    Email     = "binh.tran@gmail.com",
                    Username  = "binhtran",
                    Password  = BCrypt.Net.BCrypt.HashPassword("Cust@123"),
                    IsActive  = true,
                    CreatedAt = DateTime.Now
                },
                new Customer
                {
                    FName     = "Minh",
                    LName     = "Cuong",
                    Dob       = new DateOnly(1995, 11, 5),
                    Gender    = "M",
                    PNo       = "0901112233",
                    Address   = "88 Nguyen Hue, Da Nang",
                    Email     = "cuong.minh@yahoo.com",
                    Username  = "cuongminh",
                    Password  = BCrypt.Net.BCrypt.HashPassword("Cust@123"),
                    IsActive  = true,
                    CreatedAt = DateTime.Now
                },
                new Customer
                {
                    FName     = "Thi",
                    LName     = "Dung",
                    Dob       = new DateOnly(2001, 1, 30),
                    Gender    = "F",
                    PNo       = "0933445566",
                    Address   = "3 Phan Chu Trinh, Hue",
                    Email     = "dung.le@gmail.com",
                    Username  = "dungle",
                    Password  = BCrypt.Net.BCrypt.HashPassword("Cust@123"),
                    IsActive  = true,
                    CreatedAt = DateTime.Now
                },
                new Customer
                {
                    FName     = "Quoc",
                    LName     = "Em",
                    Dob       = new DateOnly(1993, 5, 18),
                    Gender    = "M",
                    PNo       = "0977889900",
                    Address   = "21 Le Loi, Can Tho",
                    Email     = "em.pham@outlook.com",
                    Username  = "empham",
                    Password  = BCrypt.Net.BCrypt.HashPassword("Cust@123"),
                    IsActive  = false,
                    CreatedAt = DateTime.Now
                },
                };

                await context.Customers.AddRangeAsync(customers);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // ADMINS (2)
            // ============================================================
            if (!context.Admins.Any())
            {
                var admins = new Admin[]
                {
                new Admin
                {
                    Username  = "admin",
                    Password  = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    CreatedAt = DateTime.Now
                },
                new Admin
                {
                    Username  = "staff01",
                    Password  = BCrypt.Net.BCrypt.HashPassword("Staff@123"),
                    CreatedAt = DateTime.Now
                },
                };

                await context.Admins.AddRangeAsync(admins);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // 3. PRODUCT TEMPLATES
            // ============================================================
            if (!context.ProductTemplates.Any())
            {
                var templates = new ProductTemplate[]
                {
                    new ProductTemplate {
                        TemplateName = "Rửa Ảnh Truyền Thống",
                        ImageUrl = "standard_print.jpg",
                        Details = "In ảnh Lab Fujifilm chính hãng. Tùy chọn mặt Bóng/Lụa.",
                        LeadTime = "1 ngày", IsActive = true
                    },
                    new ProductTemplate {
                        TemplateName = "Ảnh Polaroid Retro",
                        ImageUrl = "polaroid_main.jpg",
                        Details = "Phong cách vintage có viền trắng tinh tế.",
                        LeadTime = "1-2 ngày", IsActive = true
                    },
                    new ProductTemplate {
                        TemplateName = "In Ảnh Khổ Lớn (Ép Gỗ)",
                        ImageUrl = "large_wood.jpg",
                        Details = "Ép gỗ MDF cao cấp, bền màu theo thời gian.",
                        LeadTime = "3-5 ngày", IsActive = true
                    },
                    new ProductTemplate {
                        TemplateName = "Tranh Canvas Nghệ Thuật",
                        ImageUrl = "canvas_print.jpg",
                        Details = "In vải Canvas sần căng khung gỗ sồi sang trọng.",
                        LeadTime = "4-6 ngày", IsActive = true
                    },
                    new ProductTemplate {
                        TemplateName = "Dải Ảnh Photostrip",
                        ImageUrl = "photostrip.jpg",
                        Details = "Dải ảnh dọc style Hàn Quốc cho giới trẻ.",
                        LeadTime = "1 ngày", IsActive = true
                    }
                };
                await context.ProductTemplates.AddRangeAsync(templates);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // 4. PRINT SIZES (Giữ nguyên toàn bộ Sizes + Thêm Size Rửa ảnh)
            // ============================================================
            if (!context.PrintSizes.Any())
            {
                var tRuaAnh = await context.ProductTemplates.FirstAsync(t => t.TemplateName.Contains("Rửa Ảnh"));
                var tPolaroid = await context.ProductTemplates.FirstAsync(t => t.TemplateName.Contains("Polaroid"));
                var tLarge = await context.ProductTemplates.FirstAsync(t => t.TemplateName.Contains("Khổ Lớn"));
                var tCanvas = await context.ProductTemplates.FirstAsync(t => t.TemplateName.Contains("Canvas"));
                var tStrip = await context.ProductTemplates.FirstAsync(t => t.TemplateName.Contains("Photostrip"));

                var sizes = new List<PrintSize>
                {
                    // Size Rửa ảnh mới thêm
                    new PrintSize { TemplateId = tRuaAnh.TemplateId, SizeName = "10x15 cm", Price = 3000.00m, IsAvailable = true, CreatedAt = DateTime.Now },
                    new PrintSize { TemplateId = tRuaAnh.TemplateId, SizeName = "13x18 cm", Price = 6000.00m, IsAvailable = true, CreatedAt = DateTime.Now },

                    // Polaroid (Giữ nguyên)
                    new PrintSize { TemplateId = tPolaroid.TemplateId, SizeName = "6x9 cm", Price = 5000.00m, IsAvailable = true, CreatedAt = DateTime.Now },
                    new PrintSize { TemplateId = tPolaroid.TemplateId, SizeName = "9x12 cm", Price = 9000.00m, IsAvailable = true, CreatedAt = DateTime.Now },
                    
                    // Ảnh gỗ khổ lớn (Giữ nguyên)
                    new PrintSize { TemplateId = tLarge.TemplateId, SizeName = "40x60 cm", Price = 180000.00m, IsAvailable = true, CreatedAt = DateTime.Now },
                    new PrintSize { TemplateId = tLarge.TemplateId, SizeName = "60x90 cm", Price = 420000.00m, IsAvailable = true, CreatedAt = DateTime.Now },

                    // Canvas (Giữ nguyên)
                    new PrintSize { TemplateId = tCanvas.TemplateId, SizeName = "30x30 cm", Price = 250000.00m, IsAvailable = true, CreatedAt = DateTime.Now },
                    new PrintSize { TemplateId = tCanvas.TemplateId, SizeName = "50x70 cm", Price = 550000.00m, IsAvailable = true, CreatedAt = DateTime.Now },

                    // Photostrip (Giữ nguyên)
                    new PrintSize { TemplateId = tStrip.TemplateId, SizeName = "5x15 cm", Price = 12000.00m, IsAvailable = true, CreatedAt = DateTime.Now }
                };
                await context.PrintSizes.AddRangeAsync(sizes);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // ORDERS (Giữ 3 đơn của bạn + Thêm 1 đơn Rửa ảnh mẫu)
            // ============================================================
            if (!context.Orders.Any())
            {
                var customer1 = await context.Customers.FirstAsync(c => c.Username == "annguyen");
                var customer2 = await context.Customers.FirstAsync(c => c.Username == "binhtran");
                var admin = await context.Admins.FirstAsync(a => a.Username == "staff01");

                var orders = new Order[]
                {
        new Order { CustId = customer1.CustId, OrderDate = DateTime.Now.AddDays(-5), TotalPrice = 46000.00m, ShippingAddress = "12 Ly Thuong Kiet, Ha Noi", Status = "Completed", ProcessedByAdminId = admin.AdminId },
        new Order { CustId = customer2.CustId, OrderDate = DateTime.Now.AddDays(-2), TotalPrice = 23000.00m, ShippingAddress = "45 Tran Hung Dao, Ho Chi Minh", Status = "Payment Verified", ProcessedByAdminId = admin.AdminId },
        new Order { CustId = customer1.CustId, OrderDate = DateTime.Now, TotalPrice = 0.00m, ShippingAddress = "12 Ly Thuong Kiet, Ha Noi", Status = "Pending", ProcessedByAdminId = null },
        new Order { CustId = customer2.CustId, OrderDate = DateTime.Now.AddHours(-1), TotalPrice = 30000.00m, ShippingAddress = "45 Tran Hung Dao, Ho Chi Minh", Status = "Processing", ProcessedByAdminId = admin.AdminId }
                };

                await context.Orders.AddRangeAsync(orders);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // PHOTOS (Giữ 4 ảnh của bạn + Thêm 1 ảnh để Rửa)
            // ============================================================
            if (!context.Photos.Any())
            {
                var customer1 = await context.Customers.FirstAsync(c => c.Username == "annguyen");
                var customer2 = await context.Customers.FirstAsync(c => c.Username == "binhtran");
                var order1 = await context.Orders.FirstAsync(o => o.Status == "Completed");
                var order4 = await context.Orders.OrderByDescending(o => o.OrderId).FirstAsync(); // Lấy đơn mới nhất vừa thêm

                var photos = new Photo[]
                {
        new Photo { CustId = customer1.CustId, FileName = "photo_001.jpg", FilePath = $"uploads/{order1.FolderName}/photo_001.jpg", UploadDate = DateTime.Now.AddDays(-5) },
        new Photo { CustId = customer1.CustId, FileName = "photo_002.jpg", FilePath = $"uploads/{order1.FolderName}/photo_002.jpg", UploadDate = DateTime.Now.AddDays(-5) },
        new Photo { CustId = customer2.CustId, FileName = "portrait_01.jpg", FilePath = "uploads/folder_0002/portrait_01.jpg", UploadDate = DateTime.Now.AddDays(-2) },
        new Photo { CustId = customer2.CustId, FileName = "family_shot.jpg", FilePath = "uploads/folder_0002/family_shot.jpg", UploadDate = DateTime.Now.AddDays(-2) },
        new Photo { CustId = customer2.CustId, FileName = "rua_anh_test.jpg", FilePath = $"uploads/{order4.FolderName}/rua_anh_test.jpg", UploadDate = DateTime.Now }
                };

                await context.Photos.AddRangeAsync(photos);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // ORDER DETAILS (Gắn kết các size mới vào)
            // ============================================================
            if (!context.OrderDetails.Any())
            {
                var order1 = await context.Orders.FirstAsync(o => o.Status == "Completed");
                var order2 = await context.Orders.FirstAsync(o => o.Status == "Payment Verified");
                var order4 = await context.Orders.FirstAsync(o => o.Status == "Processing");

                var photo1 = await context.Photos.FirstAsync(p => p.FileName == "photo_001.jpg");
                var photo2 = await context.Photos.FirstAsync(p => p.FileName == "photo_002.jpg");
                var photo3 = await context.Photos.FirstAsync(p => p.FileName == "portrait_01.jpg");
                var photoRua = await context.Photos.FirstAsync(p => p.FileName == "rua_anh_test.jpg");

                var size4x6 = await context.PrintSizes.FirstAsync(s => s.SizeName == "4x6" || s.SizeName == "10x15 cm");
                var size5x7 = await context.PrintSizes.FirstAsync(s => s.SizeName == "5x7" || s.SizeName == "13x18 cm");

                var details = new OrderDetail[]
                {
        new OrderDetail { OrderId = order1.OrderId, PhotoId = photo1.PhotoId, SizeId = size4x6.SizeId, Quantity = 2, PricePerCopy = size4x6.Price },
        new OrderDetail { OrderId = order1.OrderId, PhotoId = photo2.PhotoId, SizeId = size5x7.SizeId, Quantity = 2, PricePerCopy = size5x7.Price },
        new OrderDetail { OrderId = order2.OrderId, PhotoId = photo3.PhotoId, SizeId = size4x6.SizeId, Quantity = 1, PricePerCopy = size4x6.Price },
        // Dòng dữ liệu cho dịch vụ Rửa ảnh: Rửa 10 tấm 10x15cm
        new OrderDetail { OrderId = order4.OrderId, PhotoId = photoRua.PhotoId, SizeId = size4x6.SizeId, Quantity = 10, PricePerCopy = size4x6.Price, NoteToAdmin = "Rửa mặt lụa giúp shop." }
                };

                await context.OrderDetails.AddRangeAsync(details);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // PAYMENTS
            // ============================================================
            if (!context.Payments.Any())
            {
                var order1 = await context.Orders.FirstAsync(o => o.Status == "Completed");
                var order2 = await context.Orders.FirstAsync(o => o.Status == "Payment Verified");

                var payments = new Payment[]
                {
        new Payment { OrderId = order1.OrderId, PaymentMethod = "VNPay", PaymentDate = DateTime.Now.AddDays(-5), PaymentStatus = "Verified" },
        new Payment { OrderId = order2.OrderId, PaymentMethod = "COD",   PaymentDate = DateTime.Now.AddDays(-2), PaymentStatus = "Verified" }
                };

                await context.Payments.AddRangeAsync(payments);
                await context.SaveChangesAsync();
            }
        }
    }
}
