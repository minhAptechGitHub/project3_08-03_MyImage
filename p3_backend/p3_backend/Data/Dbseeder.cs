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
            // PRINT SIZES (4)
            // ============================================================
            if (!context.PrintSizes.Any())
            {
                var sizes = new PrintSize[]
                {
                new PrintSize { SizeName = "3x4",   Price = 5000.00m,  IsAvailable = true,  CreatedAt = DateTime.Now },
                new PrintSize { SizeName = "4x6",   Price = 8000.00m,  IsAvailable = true,  CreatedAt = DateTime.Now },
                new PrintSize { SizeName = "5x7",   Price = 15000.00m, IsAvailable = true,  CreatedAt = DateTime.Now },
                new PrintSize { SizeName = "8x10",  Price = 30000.00m, IsAvailable = false, CreatedAt = DateTime.Now },
                };

                await context.PrintSizes.AddRangeAsync(sizes);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // ORDERS (3)
            // ============================================================
            if (!context.Orders.Any())
            {
                var customer1 = await context.Customers.FirstAsync(c => c.Username == "annguyen");
                var customer2 = await context.Customers.FirstAsync(c => c.Username == "binhtran");
                var admin = await context.Admins.FirstAsync(a => a.Username == "staff01");

                var orders = new Order[]
                {
                new Order
                {
                    CustId          = customer1.CustId,
                    OrderDate       = DateTime.Now.AddDays(-5),
                    TotalPrice      = 46000.00m,
                    ShippingAddress = "12 Ly Thuong Kiet, Ha Noi",
                    Status          = "Completed",
                    ProcessedByAdminId = admin.AdminId
                },
                new Order
                {
                    CustId          = customer2.CustId,
                    OrderDate       = DateTime.Now.AddDays(-2),
                    TotalPrice      = 23000.00m,
                    ShippingAddress = "45 Tran Hung Dao, Ho Chi Minh",
                    Status          = "Payment Verified",
                    ProcessedByAdminId = admin.AdminId
                },
                new Order
                {
                    CustId          = customer1.CustId,
                    OrderDate       = DateTime.Now,
                    TotalPrice      = 0.00m,
                    ShippingAddress = "12 Ly Thuong Kiet, Ha Noi",
                    Status          = "Pending",
                    ProcessedByAdminId = null
                },
                };

                await context.Orders.AddRangeAsync(orders);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // PHOTOS (4)
            // ============================================================
            if (!context.Photos.Any())
            {
                var customer1 = await context.Customers.FirstAsync(c => c.Username == "annguyen");
                var customer2 = await context.Customers.FirstAsync(c => c.Username == "binhtran");
                var order1 = await context.Orders.FirstAsync(o => o.Status == "Completed");

                var photos = new Photo[]
                {
                new Photo
                {
                    CustId     = customer1.CustId,
                    FileName   = "photo_001.jpg",
                    FilePath   = $"uploads/{order1.FolderName}/photo_001.jpg",
                    UploadDate = DateTime.Now.AddDays(-5)
                },
                new Photo
                {
                    CustId     = customer1.CustId,
                    FileName   = "photo_002.jpg",
                    FilePath   = $"uploads/{order1.FolderName}/photo_002.jpg",
                    UploadDate = DateTime.Now.AddDays(-5)
                },
                new Photo
                {
                    CustId     = customer2.CustId,
                    FileName   = "portrait_01.jpg",
                    FilePath   = "uploads/folder_0002/portrait_01.jpg",
                    UploadDate = DateTime.Now.AddDays(-2)
                },
                new Photo
                {
                    CustId     = customer2.CustId,
                    FileName   = "family_shot.jpg",
                    FilePath   = "uploads/folder_0002/family_shot.jpg",
                    UploadDate = DateTime.Now.AddDays(-2)
                },
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
                var photo1 = await context.Photos.FirstAsync(p => p.FileName == "photo_001.jpg");
                var photo2 = await context.Photos.FirstAsync(p => p.FileName == "photo_002.jpg");
                var photo3 = await context.Photos.FirstAsync(p => p.FileName == "portrait_01.jpg");
                var size4x6 = await context.PrintSizes.FirstAsync(s => s.SizeName == "4x6");
                var size5x7 = await context.PrintSizes.FirstAsync(s => s.SizeName == "5x7");

                var details = new OrderDetail[]
                {
                new OrderDetail
                {
                    OrderId      = order1.OrderId,
                    PhotoId      = photo1.PhotoId,
                    SizeId       = size4x6.SizeId,
                    Quantity     = 2,
                    PricePerCopy = size4x6.Price
                },
                new OrderDetail
                {
                    OrderId      = order1.OrderId,
                    PhotoId      = photo2.PhotoId,
                    SizeId       = size5x7.SizeId,
                    Quantity     = 2,
                    PricePerCopy = size5x7.Price
                },
                new OrderDetail
                {
                    OrderId      = order2.OrderId,
                    PhotoId      = photo3.PhotoId,
                    SizeId       = size4x6.SizeId,
                    Quantity     = 1,
                    PricePerCopy = size4x6.Price
                },
                };

                await context.OrderDetails.AddRangeAsync(details);
                await context.SaveChangesAsync();
            }

            // ============================================================
            // PAYMENTS (2)
            // ============================================================
            if (!context.Payments.Any())
            {
                var order1 = await context.Orders.FirstAsync(o => o.Status == "Completed");
                var order2 = await context.Orders.FirstAsync(o => o.Status == "Payment Verified");

                var payments = new Payment[]
                {
                new Payment
                {
                    OrderId               = order1.OrderId,
                    PaymentMethod         = "CreditCard",
                    CreditCardEncrypted   = "AES256:encryptedCardDataHere==",
                    EncryptionMethod      = "AES-256",
                    PaymentDate           = DateTime.Now.AddDays(-5),
                    PaymentStatus         = "Verified"
                },
                new Payment
                {
                    OrderId               = order2.OrderId,
                    PaymentMethod         = "DirectPayment",
                    CreditCardEncrypted   = null,
                    EncryptionMethod      = null,
                    PaymentDate           = DateTime.Now.AddDays(-2),
                    PaymentStatus         = "Verified"
                },
                };

                await context.Payments.AddRangeAsync(payments);
                await context.SaveChangesAsync();
            }
        }
    }
}
