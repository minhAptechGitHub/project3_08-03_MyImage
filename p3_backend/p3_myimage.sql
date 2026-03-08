CREATE DATABASE p3_MyImage_2;
GO

USE p3_MyImage_2;
GO

SELECT *
FROM dbo.Customers AS c
WHERE c.username = 'annguyen';

-- TABLE: Customers
IF OBJECT_ID('dbo.Customers', 'U') IS NOT NULL DROP TABLE dbo.Customers;

CREATE TABLE dbo.Customers (
    cust_id      INT             NOT NULL IDENTITY(1,1) PRIMARY KEY,
    f_name      VARCHAR(50)     NOT NULL,
    l_name      VARCHAR(50)     NOT NULL,
    dob         DATE            NULL,
    gender      CHAR(1)         NULL CHECK (Gender IN ('M', 'F')),
    p_no        VARCHAR(20)     NULL,
    address     VARCHAR(255)    NULL,
    email       VARCHAR(100)    NOT NULL UNIQUE,
    username    VARCHAR(50)     NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,   -- Store hashed password
    is_active    BIT             NOT NULL DEFAULT 1,
    created_at   DATETIME        NOT NULL DEFAULT GETDATE()
);
GO



-- TABLE: Admins
IF OBJECT_ID('dbo.Admins', 'U') IS NOT NULL DROP TABLE dbo.Admins;

CREATE TABLE dbo.Admins (
    admin_id     INT             NOT NULL IDENTITY(1,1) PRIMARY KEY,
    username    VARCHAR(50)     NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,   -- Store hashed password
    created_at   DATETIME        NOT NULL DEFAULT GETDATE()
);
GO


-- TABLE: PrintSizes
IF OBJECT_ID('dbo.PrintSizes', 'U') IS NOT NULL DROP TABLE dbo.PrintSizes;

CREATE TABLE dbo.PrintSizes (
    size_id         INT             NOT NULL IDENTITY(1,1) PRIMARY KEY,
    size_name       VARCHAR(20)     NOT NULL UNIQUE,
    price           DECIMAL(10,2)   NOT NULL,
    is_available    BIT             NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT GETDATE(),
);
GO

-- Seed default print sizes
INSERT INTO dbo.PrintSizes (size_name, price) VALUES
    ('4x6',   0.99),
    ('5x7',   1.99),
    ('8x10',  3.99),
    ('10x12', 5.99),
    ('11x14', 7.99);
GO


-- TABLE: Orders
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;

CREATE TABLE dbo.Orders (
    order_id                INT             NOT NULL IDENTITY(1,1) PRIMARY KEY
                            CHECK (order_id BETWEEN 1 AND 1000),              -- FIX 2: spec range

    cust_id                 INT             NOT NULL REFERENCES dbo.Customers(cust_id),

    -- FIX 3: folder name must follow format folder_0001, folder_0042, etc.
    folder_name             AS ('folder_' + RIGHT('0000' + CAST(order_id AS VARCHAR(4)), 4)) PERSISTED UNIQUE,

    order_date              DATETIME        NOT NULL DEFAULT GETDATE(),
    total_price             DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    shipping_address        VARCHAR(500)    NOT NULL,

    -- FIX 8: email removed; use JOIN to Customers.email when needed

    status                  VARCHAR(30)     NOT NULL DEFAULT 'Pending'
                            CHECK (status IN (
                                'Pending', 'Payment Verified', 'Processing',
                                'Printed', 'Shipped', 'Completed', 'Cancelled'
                            )),

    processed_by_admin_id   INT             NULL REFERENCES dbo.Admins(admin_id)
);
GO


-- TABLE: Photos
IF OBJECT_ID('dbo.Photos', 'U') IS NOT NULL DROP TABLE dbo.Photos;

CREATE TABLE dbo.Photos (
    photo_id        INT             NOT NULL IDENTITY(1,1) PRIMARY KEY,
    order_id        INT             NOT NULL REFERENCES dbo.Orders(order_id),
    cust_id         INT             NOT NULL REFERENCES dbo.Customers(cust_id),
    file_name       VARCHAR(255)    NOT NULL,           -- original JPEG filename
    file_path       VARCHAR(500)    NOT NULL,           -- server path inside folder_name
    upload_date     DATETIME        NOT NULL DEFAULT GETDATE()
);
GO


-- TABLE: OrderDetails
IF OBJECT_ID('dbo.OrderDetails', 'U') IS NOT NULL DROP TABLE dbo.OrderDetails;

CREATE TABLE dbo.OrderDetails (
    order_detail_id INT             NOT NULL IDENTITY(1,1) PRIMARY KEY,
    order_id        INT             NOT NULL REFERENCES dbo.Orders(order_id),
    photo_id        INT             NOT NULL REFERENCES dbo.Photos(photo_id),
    size_id         INT             NOT NULL REFERENCES dbo.PrintSizes(size_id),
    quantity        INT             NOT NULL CHECK (quantity >= 1),
    price_per_copy  DECIMAL(10,2)   NOT NULL,
    line_total      AS (quantity * price_per_copy) PERSISTED,

    -- FIX 9: prevent duplicate line items for same photo + size in same order
    CONSTRAINT UQ_OrderDetails_Photo_Size UNIQUE (order_id, photo_id, size_id)
);
GO


-- TABLE: Payments
IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL DROP TABLE dbo.Payments;

CREATE TABLE dbo.Payments (
    payment_id              INT             NOT NULL IDENTITY(1,1) PRIMARY KEY,
    order_id                INT             NOT NULL UNIQUE REFERENCES dbo.Orders(order_id),

    payment_method          VARCHAR(20)     NOT NULL
                            CHECK (payment_method IN ('CreditCard', 'DirectPayment')),

    credit_card_encrypted   VARCHAR(500)    NULL,       -- NULL if DirectPayment
    encryption_method       VARCHAR(50)     NULL,       -- FIX 6: e.g. 'AES-256', 'RSA-2048'

    payment_date            DATETIME        NOT NULL DEFAULT GETDATE(),

    payment_status          VARCHAR(20)     NOT NULL DEFAULT 'Pending'
                            CHECK (payment_status IN ('Pending', 'Verified', 'Failed', 'Refunded'))
);
GO

