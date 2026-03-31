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
                        ImageUrl = "templates/standard_print.jpg",
                        Details = "In ảnh Lab Fujifilm chính hãng. Tùy chọn mặt Bóng/Lụa.",
                        LeadTime = "1 ngày", IsActive = true
                    },
                    new ProductTemplate {
                        TemplateName = "Ảnh Polaroid Retro",
                        ImageUrl = "templates/polaroid_main.jpg",
                        Details = "Phong cách vintage có viền trắng tinh tế.",
                        LeadTime = "1-2 ngày", IsActive = true
                    },
                    new ProductTemplate {
                        TemplateName = "In Ảnh Khổ Lớn (Ép Gỗ)",
                        ImageUrl = "templates/large_wood.jpg",
                        Details = "Ép gỗ MDF cao cấp, bền màu theo thời gian.",
                        LeadTime = "3-5 ngày", IsActive = true
                    },
                    new ProductTemplate {
                        TemplateName = "Tranh Canvas Nghệ Thuật",
                        ImageUrl = "templates/canvas_print.webp",
                        Details = "In vải Canvas sần căng khung gỗ sồi sang trọng.",
                        LeadTime = "4-6 ngày", IsActive = true
                    },
                    new ProductTemplate {
                        TemplateName = "Dải Ảnh Photostrip",
                        ImageUrl = "templates/photostrip.webp",
                        Details = "Dải ảnh dọc style Hàn Quốc cho giới trẻ.",
                        LeadTime = "1 ngày", IsActive = true
                    }
                };
                await context.ProductTemplates.AddRangeAsync(templates);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // 4. PRINT SIZES
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
                    // Rửa ảnh
                    new PrintSize { TemplateId = tRuaAnh.TemplateId, SizeName = "10x15 cm", Price = 3000.00m, IsAvailable = true, CreatedAt = DateTime.Now },
                    new PrintSize { TemplateId = tRuaAnh.TemplateId, SizeName = "13x18 cm", Price = 6000.00m, IsAvailable = true, CreatedAt = DateTime.Now },

                    // Polaroid
                    new PrintSize { TemplateId = tPolaroid.TemplateId, SizeName = "6x9 cm",  Price = 5000.00m, IsAvailable = true, CreatedAt = DateTime.Now },
                    new PrintSize { TemplateId = tPolaroid.TemplateId, SizeName = "9x12 cm", Price = 9000.00m, IsAvailable = true, CreatedAt = DateTime.Now },

                    // Ảnh gỗ khổ lớn
                    new PrintSize { TemplateId = tLarge.TemplateId, SizeName = "40x60 cm", Price = 180000.00m, IsAvailable = true, CreatedAt = DateTime.Now },
                    new PrintSize { TemplateId = tLarge.TemplateId, SizeName = "60x90 cm", Price = 420000.00m, IsAvailable = true, CreatedAt = DateTime.Now },

                    // Canvas
                    new PrintSize { TemplateId = tCanvas.TemplateId, SizeName = "30x30 cm", Price = 250000.00m, IsAvailable = true, CreatedAt = DateTime.Now },
                    new PrintSize { TemplateId = tCanvas.TemplateId, SizeName = "50x70 cm", Price = 550000.00m, IsAvailable = true, CreatedAt = DateTime.Now },

                    // Photostrip
                    new PrintSize { TemplateId = tStrip.TemplateId, SizeName = "5x15 cm", Price = 12000.00m, IsAvailable = true, CreatedAt = DateTime.Now }
                };
                await context.PrintSizes.AddRangeAsync(sizes);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // 5. PRODUCT GALLERY  ← NEW
            // ============================================================
            if (!context.ProductGalleries.Any())
            {
                var tRuaAnh = await context.ProductTemplates.FirstAsync(t => t.TemplateName.Contains("Rửa Ảnh"));
                var tPolaroid = await context.ProductTemplates.FirstAsync(t => t.TemplateName.Contains("Polaroid"));
                var tLarge = await context.ProductTemplates.FirstAsync(t => t.TemplateName.Contains("Khổ Lớn"));
                var tCanvas = await context.ProductTemplates.FirstAsync(t => t.TemplateName.Contains("Canvas"));
                var tStrip = await context.ProductTemplates.FirstAsync(t => t.TemplateName.Contains("Photostrip"));

                var galleries = new ProductGallery[]
                {
                    // Rửa Ảnh Truyền Thống
                    new ProductGallery { TemplateId = tRuaAnh.TemplateId,  ImageUrl = "galleries/rua_anh_1.jpg", Caption = "Ảnh gia đình in Lab Fujifilm mặt bóng" },
                    new ProductGallery { TemplateId = tRuaAnh.TemplateId,  ImageUrl = "galleries/rua_anh_2.webp", Caption = "Ảnh chân dung in mặt lụa mịn" },
                    new ProductGallery { TemplateId = tRuaAnh.TemplateId,  ImageUrl = "galleries/rua_anh_3.webp", Caption = "Ảnh phong cảnh khổ 13x18" },

                    // Polaroid Retro
                    new ProductGallery { TemplateId = tPolaroid.TemplateId, ImageUrl = "galleries/polaroid_1.jpg", Caption = "Polaroid couple shot phong cách vintage" },
                    new ProductGallery { TemplateId = tPolaroid.TemplateId, ImageUrl = "galleries/polaroid_2.png", Caption = "Bộ ảnh du lịch Hà Nội phong cách retro" },

                    // In Ảnh Khổ Lớn (Ép Gỗ)
                    new ProductGallery { TemplateId = tLarge.TemplateId, ImageUrl = "galleries/wood_1.webp", Caption = "Ảnh ép gỗ 40x60 treo phòng khách" },
                    new ProductGallery { TemplateId = tLarge.TemplateId, ImageUrl = "galleries/wood_2.webp", Caption = "Ảnh cưới ép gỗ MDF khổ 60x90" },
                    new ProductGallery { TemplateId = tLarge.TemplateId, ImageUrl = "galleries/wood_3.webp", Caption = "Tranh phong cảnh ép gỗ treo văn phòng" },

                    // Tranh Canvas
                    new ProductGallery { TemplateId = tCanvas.TemplateId, ImageUrl = "galleries/canvas_1.jpg", Caption = "Canvas 30x30 phòng ngủ phong cách Bắc Âu" },
                    new ProductGallery { TemplateId = tCanvas.TemplateId, ImageUrl = "galleries/canvas_2.jpg", Caption = "Canvas 50x70 ảnh gia đình căng khung gỗ sồi" },

                    // Photostrip
                    new ProductGallery { TemplateId = tStrip.TemplateId, ImageUrl = "galleries/strip_1.jpeg", Caption = "Dải ảnh 4 khung phong cách Seoul" },
                    new ProductGallery { TemplateId = tStrip.TemplateId, ImageUrl = "galleries/strip_2.jpg", Caption = "Photostrip hội bạn thân kỷ niệm sinh nhật" },
                };

                await context.ProductGalleries.AddRangeAsync(galleries);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // ORDERS
            // ============================================================
            if (!context.Orders.Any())
            {
                var customer1 = await context.Customers.FirstAsync(c => c.Username == "annguyen");
                var customer2 = await context.Customers.FirstAsync(c => c.Username == "binhtran");
                var admin = await context.Admins.FirstAsync(a => a.Username == "staff01");

                var orders = new Order[]
                {
                    new Order { CustId = customer1.CustId, OrderDate = DateTime.Now.AddDays(-5), TotalPrice = 46000.00m,  ShippingAddress = "12 Ly Thuong Kiet, Ha Noi",        Status = "Completed",        PaymentMethod = "VNPay",  ProcessedByAdminId = admin.AdminId },
                    new Order { CustId = customer2.CustId, OrderDate = DateTime.Now.AddDays(-2), TotalPrice = 23000.00m,  ShippingAddress = "45 Tran Hung Dao, Ho Chi Minh",    Status = "Payment Verified", PaymentMethod = "VNPay",  ProcessedByAdminId = admin.AdminId },
                    new Order { CustId = customer1.CustId, OrderDate = DateTime.Now,             TotalPrice = 0.00m,      ShippingAddress = "12 Ly Thuong Kiet, Ha Noi",        Status = "Pending",          PaymentMethod = null,     ProcessedByAdminId = null },
                    new Order { CustId = customer2.CustId, OrderDate = DateTime.Now.AddHours(-1),TotalPrice = 30000.00m,  ShippingAddress = "45 Tran Hung Dao, Ho Chi Minh",    Status = "Processing",       PaymentMethod = "VNPay",  ProcessedByAdminId = admin.AdminId }
                };

                await context.Orders.AddRangeAsync(orders);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // PHOTOS
            // ============================================================
            if (!context.Photos.Any())
            {
                var customer1 = await context.Customers.FirstAsync(c => c.Username == "annguyen");
                var customer2 = await context.Customers.FirstAsync(c => c.Username == "binhtran");
                var order1 = await context.Orders.FirstAsync(o => o.Status == "Completed");
                var order4 = await context.Orders.FirstAsync(o => o.Status == "Processing");

                var photos = new Photo[]
                {
                    new Photo { CustId = customer1.CustId, FileName = "photo_001.jpg",     FilePath = $"uploads/{order1.FolderName}/photo_001.jpg",  UploadDate = DateTime.Now.AddDays(-5) },
                    new Photo { CustId = customer1.CustId, FileName = "photo_002.jpg",     FilePath = $"uploads/{order1.FolderName}/photo_002.jpg",  UploadDate = DateTime.Now.AddDays(-5) },
                    new Photo { CustId = customer2.CustId, FileName = "portrait_01.jpg",   FilePath = "uploads/folder_0002/portrait_01.jpg",         UploadDate = DateTime.Now.AddDays(-2) },
                    new Photo { CustId = customer2.CustId, FileName = "family_shot.jpg",   FilePath = "uploads/folder_0002/family_shot.jpg",         UploadDate = DateTime.Now.AddDays(-2) },
                    new Photo { CustId = customer2.CustId, FileName = "rua_anh_test.jpg",  FilePath = $"uploads/{order4.FolderName}/rua_anh_test.jpg", UploadDate = DateTime.Now }
                };

                await context.Photos.AddRangeAsync(photos);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // ORDER DETAILS
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

                var size10x15 = await context.PrintSizes.FirstAsync(s => s.SizeName == "10x15 cm");
                var size13x18 = await context.PrintSizes.FirstAsync(s => s.SizeName == "13x18 cm");

                var details = new OrderDetail[]
                {
                    new OrderDetail { OrderId = order1.OrderId, PhotoId = photo1.PhotoId, SizeId = size10x15.SizeId, Quantity = 2,  PricePerCopy = size10x15.Price },
                    new OrderDetail { OrderId = order1.OrderId, PhotoId = photo2.PhotoId, SizeId = size13x18.SizeId, Quantity = 2,  PricePerCopy = size13x18.Price },
                    new OrderDetail { OrderId = order2.OrderId, PhotoId = photo3.PhotoId, SizeId = size10x15.SizeId, Quantity = 1,  PricePerCopy = size10x15.Price },
                    // 10 tấm 10x15 mặt lụa cho đơn Processing
                    new OrderDetail { OrderId = order4.OrderId, PhotoId = photoRua.PhotoId, SizeId = size10x15.SizeId, Quantity = 10, PricePerCopy = size10x15.Price, NoteToAdmin = "Rửa mặt lụa giúp shop." }
                };

                await context.OrderDetails.AddRangeAsync(details);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // PAYMENT TRANSACTIONS  ← NEW
            // ============================================================
            if (!context.PaymentTransactions.Any())
            {
                var orderCompleted = await context.Orders.FirstAsync(o => o.Status == "Completed");
                var orderVerified = await context.Orders.FirstAsync(o => o.Status == "Payment Verified");
                var orderPending = await context.Orders.FirstAsync(o => o.Status == "Pending");
                var orderProc = await context.Orders.FirstAsync(o => o.Status == "Processing");

                var transactions = new PaymentTransaction[]
                {
                    // Đơn Completed — thanh toán thành công
                    new PaymentTransaction
                    {
                        OrderId          = orderCompleted.OrderId,
                        TxnRef           = $"TXN{orderCompleted.OrderId:D8}A",
                        Amount           = (long)orderCompleted.TotalPrice,
                        VnpTransactionNo = "14078302",
                        ResponseCode     = "00",
                        Message          = "Giao dịch thành công",
                        Status           = "Success",
                        CreatedAt        = DateTime.Now.AddDays(-5)
                    },
                    // Đơn Payment Verified — thanh toán thành công, chờ xử lý
                    new PaymentTransaction
                    {
                        OrderId          = orderVerified.OrderId,
                        TxnRef           = $"TXN{orderVerified.OrderId:D8}A",
                        Amount           = (long)orderVerified.TotalPrice,
                        VnpTransactionNo = "14078415",
                        ResponseCode     = "00",
                        Message          = "Giao dịch thành công",
                        Status           = "Success",
                        CreatedAt        = DateTime.Now.AddDays(-2)
                    },
                    // Đơn Pending — chưa thanh toán (bản ghi Pending tạo lúc tạo đơn)
                    new PaymentTransaction
                    {
                        OrderId          = orderPending.OrderId,
                        TxnRef           = $"TXN{orderPending.OrderId:D8}A",
                        Amount           = 0,
                        VnpTransactionNo = null,
                        ResponseCode     = null,
                        Message          = "Chờ thanh toán",
                        Status           = "Pending",
                        CreatedAt        = DateTime.Now
                    },
                    // Đơn Processing — thanh toán thành công, đang in
                    new PaymentTransaction
                    {
                        OrderId          = orderProc.OrderId,
                        TxnRef           = $"TXN{orderProc.OrderId:D8}A",
                        Amount           = (long)orderProc.TotalPrice,
                        VnpTransactionNo = "14078521",
                        ResponseCode     = "00",
                        Message          = "Giao dịch thành công",
                        Status           = "Success",
                        CreatedAt        = DateTime.Now.AddHours(-1)
                    },
                };

                await context.PaymentTransactions.AddRangeAsync(transactions);
                await context.SaveChangesAsync();
            }
        }
    }
}