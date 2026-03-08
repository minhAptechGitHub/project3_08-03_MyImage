using Microsoft.CodeAnalysis.Scripting;
using Microsoft.EntityFrameworkCore;
using p3_backend.Models;
using System;

namespace p3_backend.Data
{
    public static class DbSeeder
    {
        public static void SeedData(P3MyImage2Context context)
        {
            context.Database.EnsureCreated();

            // ============================================================
            // ADMINS (2)
            // ============================================================
            if (!context.Admins.Any())
            {
                var admins = new Admin[]
                {
                    new Admin
                    {
                        Username = "admin01",
                        Password  = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        CreatedAt = DateTime.Now
                    },
                    new Admin
                    {
                        Username = "admin02",
                        Password  = BCrypt.Net.BCrypt.HashPassword("Admin@456"),
                        CreatedAt = DateTime.Now
                    }
                };
                context.Admins.AddRange(admins);
                context.SaveChanges();
            }

            // ============================================================
            // CuSTOMERS (5)
            // ============================================================
            if (!context.Customers.Any())
            {
                var customers = new Customer[]
                {
                    new Customer
                    {
                        FName    = "Nguyen Van",
                        LName    = "An",
                        Dob       = new DateOnly(2000, 3, 15),
                        Gender    = "M",
                        PNo      = "0912345678",
                        Address   = "12 Ly Thuong Kiet, Ha Noi",
                        Email     = "an.nguyen@gmail.com",
                        Username  = "annguyen",
                        Password  = BCrypt.Net.BCrypt.HashPassword("Cust@123"),
                        IsActive  = true,
                        CreatedAt = DateTime.Now
                    },
                    new Customer
                    {
                        FName    = "Tran Thi",
                        LName    = "Bình",
                        Dob       = new DateOnly(1998, 7, 22),
                        Gender    = "F",
                        PNo      = "0923456789",
                        Address   = "45 Nguyen Hue, TP. Ho Chi Minh",
                        Email     = "binh.tran@gmail.com",
                        Username  = "binhtran",
                        Password  = BCrypt.Net.BCrypt.HashPassword("Cust@123"),
                        IsActive  = true,
                        CreatedAt = DateTime.Now
                    },
                    new Customer
                    {
                        FName    = "Le Minh",
                        LName    = "Châu",
                        Dob       = new DateOnly(2001, 11, 5),
                        Gender    = "M",
                        PNo      = "0934567890",
                        Address   = "78 Tran Phu, Da Nang",
                        Email     = "chau.le@gmail.com",
                        Username  = "chaule",
                        Password  = BCrypt.Net.BCrypt.HashPassword("Cust@123"),
                        IsActive  = true,
                        CreatedAt = DateTime.Now
                    },
                    new Customer
                    {
                        FName    = "Pham Thi",
                        LName    = "Dung",
                        Dob       = new DateOnly(1999, 4, 18),
                        Gender    = "F",
                        PNo      = "0945678901",
                        Address   = "33 Hung Vuong, Hue",
                        Email     = "dung.pham@gmail.com",
                        Username  = "dungpham",
                        Password  = BCrypt.Net.BCrypt.HashPassword("Cust@123"),
                        IsActive  = true,
                        CreatedAt = DateTime.Now
                    },
                    new Customer
                    {
                        FName    = "Hoang Van",
                        LName    = "Em",
                        Dob       = new DateOnly(2002, 9, 30),
                        Gender    = "M",
                        PNo      = "0956789012",
                        Address   = "21 Dien Bien Phu, Hai Phong",
                        Email     = "em.hoang@gmail.com",
                        Username  = "emhoang",
                        Password  = BCrypt.Net.BCrypt.HashPassword("Cust@123"),
                        IsActive  = true,
                        CreatedAt = DateTime.Now
                    }
                };
                context.Customers.AddRange(customers);
                context.SaveChanges();
            }

            // ============================================================
            // PRINT SIZES (4)
            // Skip if already seeded from SQL script
            // ============================================================
            if (!context.PrintSizes.Any())
            {
                var printSizes = new PrintSize[]
                {
                    new PrintSize { SizeName = "4x6",   Price = 0.99m,  IsAvailable = true, CreatedAt = DateTime.Now },
                    new PrintSize { SizeName = "5x7",   Price = 1.99m,  IsAvailable = true, CreatedAt = DateTime.Now },
                    new PrintSize { SizeName = "8x10",  Price = 3.99m,  IsAvailable = true, CreatedAt = DateTime.Now },
                    new PrintSize { SizeName = "10x12", Price = 5.99m,  IsAvailable = true, CreatedAt = DateTime.Now },
                };
                context.PrintSizes.AddRange(printSizes);
                context.SaveChanges();
            }

            // ============================================================
            // ORDERS + PHOTOS + ORDER DETAILS + PAYMENTS (5 orders)
            // Each order gets photos, line items, and a payment record
            // ============================================================
            if (!context.Orders.Any())
            {
                // Fetch seeded data to get real IDs
                var customers = context.Customers.ToList();
                var printSizes = context.PrintSizes.ToList();
                var admins = context.Admins.ToList();

                var size4x6 = printSizes.First(p => p.SizeName == "4x6");
                var size5x7 = printSizes.First(p => p.SizeName == "5x7");
                var size8x10 = printSizes.First(p => p.SizeName == "8x10");
                var size10x12 = printSizes.First(p => p.SizeName == "10x12");

                var cust1 = customers[0]; // Nguyen Van An
                var cust2 = customers[1]; // Tran Thi Bình
                var cust3 = customers[2]; // Le Minh Châu
                var cust4 = customers[3]; // Pham Thi Dung
                var cust5 = customers[4]; // Hoang Van Em

                // ----------------------------------------------------------
                // ORDER 1 — Completed (credit card, processed by admin)
                // ----------------------------------------------------------
                var order1 = new Order
                {
                    CustId = cust1.CustId,
                    OrderDate = DateTime.Now.AddDays(-10),
                    TotalPrice = 0,
                    ShippingAddress = "12 Ly Thường Kiet, Ha Noi",
                    Status = "Completed",
                    ProcessedByAdminId = admins[0].AdminId
                };
                context.Orders.Add(order1);
                context.SaveChanges();

                var photo1a = new Photo { OrderId = order1.OrderId, CustId = cust1.CustId, FileName = "family_trip.jpg", FilePath = $"uploads/{order1.OrderId}/family_trip.jpg" };
                var photo1b = new Photo { OrderId = order1.OrderId, CustId = cust1.CustId, FileName = "birthday_party.jpg", FilePath = $"uploads/{order1.OrderId}/birthday_party.jpg" };
                context.Photos.AddRange(photo1a, photo1b);
                context.SaveChanges();

                var od1 = new List<OrderDetail>
                {
                    new OrderDetail { OrderId = order1.OrderId, PhotoId = photo1a.PhotoId, SizeId = size4x6.SizeId,  Quantity = 3, PricePerCopy = size4x6.Price  },
                    new OrderDetail { OrderId = order1.OrderId, PhotoId = photo1a.PhotoId, SizeId = size5x7.SizeId,  Quantity = 1, PricePerCopy = size5x7.Price  },
                    new OrderDetail { OrderId = order1.OrderId, PhotoId = photo1b.PhotoId, SizeId = size4x6.SizeId,  Quantity = 2, PricePerCopy = size4x6.Price  },
                };
                context.OrderDetails.AddRange(od1);
                context.SaveChanges();

                order1.TotalPrice = od1.Sum(d => d.Quantity * d.PricePerCopy);
                context.SaveChanges();

                context.Payments.Add(new Payment
                {
                    OrderId = order1.OrderId,
                    PaymentMethod = "CreditCard",
                    CreditCardEncrypted = "ENC:AES256:4111111111111111",
                    EncryptionMethod = "AES-256",
                    PaymentDate = order1.OrderDate.AddMinutes(5),
                    PaymentStatus = "Verified"
                });
                context.SaveChanges();

                // ----------------------------------------------------------
                // ORDER 2 — Shipped (credit card)
                // ----------------------------------------------------------
                var order2 = new Order
                {
                    CustId = cust2.CustId,
                    OrderDate = DateTime.Now.AddDays(-5),
                    TotalPrice = 0,
                    ShippingAddress = "45 Nguyen Hue, TP. Ho Chi Minh",
                    Status = "Shipped",
                    ProcessedByAdminId = admins[1].AdminId
                };
                context.Orders.Add(order2);
                context.SaveChanges();

                var photo2a = new Photo { OrderId = order2.OrderId, CustId = cust2.CustId, FileName = "graduation.jpg", FilePath = $"uploads/{order2.OrderId}/graduation.jpg" };
                var photo2b = new Photo { OrderId = order2.OrderId, CustId = cust2.CustId, FileName = "wedding.jpg", FilePath = $"uploads/{order2.OrderId}/wedding.jpg" };
                var photo2c = new Photo { OrderId = order2.OrderId, CustId = cust2.CustId, FileName = "portrait.jpg", FilePath = $"uploads/{order2.OrderId}/portrait.jpg" };
                context.Photos.AddRange(photo2a, photo2b, photo2c);
                context.SaveChanges();

                var od2 = new List<OrderDetail>
                {
                    new OrderDetail { OrderId = order2.OrderId, PhotoId = photo2a.PhotoId, SizeId = size8x10.SizeId,  Quantity = 2, PricePerCopy = size8x10.Price  },
                    new OrderDetail { OrderId = order2.OrderId, PhotoId = photo2b.PhotoId, SizeId = size10x12.SizeId, Quantity = 1, PricePerCopy = size10x12.Price },
                    new OrderDetail { OrderId = order2.OrderId, PhotoId = photo2c.PhotoId, SizeId = size5x7.SizeId,   Quantity = 4, PricePerCopy = size5x7.Price   },
                };
                context.OrderDetails.AddRange(od2);
                context.SaveChanges();

                order2.TotalPrice = od2.Sum(d => d.Quantity * d.PricePerCopy);
                context.SaveChanges();

                context.Payments.Add(new Payment
                {
                    OrderId = order2.OrderId,
                    PaymentMethod = "CreditCard",
                    CreditCardEncrypted = "ENC:AES256:5500005555555559",
                    EncryptionMethod = "AES-256",
                    PaymentDate = order2.OrderDate.AddMinutes(3),
                    PaymentStatus = "Verified"
                });
                context.SaveChanges();

                // ----------------------------------------------------------
                // ORDER 3 — Processing (direct payment at branch)
                // ----------------------------------------------------------
                var order3 = new Order
                {
                    CustId = cust3.CustId,
                    OrderDate = DateTime.Now.AddDays(-3),
                    TotalPrice = 0,
                    ShippingAddress = "78 Tran Phu, Da Nang",
                    Status = "Processing",
                    ProcessedByAdminId = admins[0].AdminId
                };
                context.Orders.Add(order3);
                context.SaveChanges();

                var photo3a = new Photo { OrderId = order3.OrderId, CustId = cust3.CustId, FileName = "vacation_beach.jpg", FilePath = $"uploads/{order3.OrderId}/vacation_beach.jpg" };
                var photo3b = new Photo { OrderId = order3.OrderId, CustId = cust3.CustId, FileName = "friends.jpg", FilePath = $"uploads/{order3.OrderId}/friends.jpg" };
                context.Photos.AddRange(photo3a, photo3b);
                context.SaveChanges();

                var od3 = new List<OrderDetail>
                {
                    new OrderDetail { OrderId = order3.OrderId, PhotoId = photo3a.PhotoId, SizeId = size4x6.SizeId,  Quantity = 5, PricePerCopy = size4x6.Price },
                    new OrderDetail { OrderId = order3.OrderId, PhotoId = photo3b.PhotoId, SizeId = size4x6.SizeId,  Quantity = 3, PricePerCopy = size4x6.Price },
                    new OrderDetail { OrderId = order3.OrderId, PhotoId = photo3b.PhotoId, SizeId = size8x10.SizeId, Quantity = 1, PricePerCopy = size8x10.Price },
                };
                context.OrderDetails.AddRange(od3);
                context.SaveChanges();

                order3.TotalPrice = od3.Sum(d => d.Quantity * d.PricePerCopy);
                context.SaveChanges();

                context.Payments.Add(new Payment
                {
                    OrderId = order3.OrderId,
                    PaymentMethod = "DirectPayment",
                    CreditCardEncrypted = null,
                    EncryptionMethod = null,
                    PaymentDate = order3.OrderDate.AddHours(2),
                    PaymentStatus = "Verified"
                });
                context.SaveChanges();

                // ----------------------------------------------------------
                // ORDER 4 — Payment Verified (credit card, awaiting processing)
                // ----------------------------------------------------------
                var order4 = new Order
                {
                    CustId = cust4.CustId,
                    OrderDate = DateTime.Now.AddDays(-1),
                    TotalPrice = 0,
                    ShippingAddress = "33 Hung Vuong, Hue",
                    Status = "Payment Verified",
                    ProcessedByAdminId = null
                };
                context.Orders.Add(order4);
                context.SaveChanges();

                var photo4a = new Photo { OrderId = order4.OrderId, CustId = cust4.CustId, FileName = "new_year.jpg", FilePath = $"uploads/{order4.OrderId}/new_year.jpg" };
                context.Photos.Add(photo4a);
                context.SaveChanges();

                var od4 = new List<OrderDetail>
                {
                    new OrderDetail { OrderId = order4.OrderId, PhotoId = photo4a.PhotoId, SizeId = size5x7.SizeId,   Quantity = 2, PricePerCopy = size5x7.Price   },
                    new OrderDetail { OrderId = order4.OrderId, PhotoId = photo4a.PhotoId, SizeId = size10x12.SizeId, Quantity = 1, PricePerCopy = size10x12.Price },
                };
                context.OrderDetails.AddRange(od4);
                context.SaveChanges();

                order4.TotalPrice = od4.Sum(d => d.Quantity * d.PricePerCopy);
                context.SaveChanges();

                context.Payments.Add(new Payment
                {
                    OrderId = order4.OrderId,
                    PaymentMethod = "CreditCard",
                    CreditCardEncrypted = "ENC:AES256:4012888888881881",
                    EncryptionMethod = "AES-256",
                    PaymentDate = order4.OrderDate.AddMinutes(8),
                    PaymentStatus = "Verified"
                });
                context.SaveChanges();

                // ----------------------------------------------------------
                // ORDER 5 — Pending (just placed, payment not yet submitted)
                // ----------------------------------------------------------
                var order5 = new Order
                {
                    CustId = cust5.CustId,
                    OrderDate = DateTime.Now,
                    TotalPrice = 0,
                    ShippingAddress = "21 Dien Bien Phu, Hai Phong",
                    Status = "Pending",
                    ProcessedByAdminId = null
                };
                context.Orders.Add(order5);
                context.SaveChanges();

                var photo5a = new Photo { OrderId = order5.OrderId, CustId = cust5.CustId, FileName = "selfie.jpg", FilePath = $"uploads/{order5.OrderId}/selfie.jpg" };
                var photo5b = new Photo { OrderId = order5.OrderId, CustId = cust5.CustId, FileName = "landscape.jpg", FilePath = $"uploads/{order5.OrderId}/landscape.jpg" };
                context.Photos.AddRange(photo5a, photo5b);
                context.SaveChanges();

                var od5 = new List<OrderDetail>
                {
                    new OrderDetail { OrderId = order5.OrderId, PhotoId = photo5a.PhotoId, SizeId = size4x6.SizeId,  Quantity = 4, PricePerCopy = size4x6.Price  },
                    new OrderDetail { OrderId = order5.OrderId, PhotoId = photo5b.PhotoId, SizeId = size8x10.SizeId, Quantity = 2, PricePerCopy = size8x10.Price },
                };
                context.OrderDetails.AddRange(od5);
                context.SaveChanges();

                order5.TotalPrice = od5.Sum(d => d.Quantity * d.PricePerCopy);
                context.SaveChanges();

                context.Payments.Add(new Payment
                {
                    OrderId = order5.OrderId,
                    PaymentMethod = "DirectPayment",
                    CreditCardEncrypted = null,
                    EncryptionMethod = null,
                    PaymentDate = DateTime.Now,
                    PaymentStatus = "Pending"
                });
                context.SaveChanges();

            }
        }
    }
}
