using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace p3_backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Admins",
                columns: table => new
                {
                    admin_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    username = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    password = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Admins__43AA4141082751F8", x => x.admin_id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    cust_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    f_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    l_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    dob = table.Column<DateOnly>(type: "date", nullable: true),
                    gender = table.Column<string>(type: "char(1)", unicode: false, fixedLength: true, maxLength: 1, nullable: true),
                    p_no = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    username = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    password = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Customer__A1B71F9008AF352D", x => x.cust_id);
                });

            migrationBuilder.CreateTable(
                name: "ProductTemplates",
                columns: table => new
                {
                    template_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    template_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    image_url = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: false),
                    details = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    lead_time = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true, defaultValue: "2-3 ngày"),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ProductT__BE44E079598D3B26", x => x.template_id);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    order_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    cust_id = table.Column<int>(type: "int", nullable: false),
                    folder_name = table.Column<string>(type: "varchar(11)", unicode: false, maxLength: 11, nullable: true, computedColumnSql: "('folder_'+right('0000'+CONVERT([varchar](4),[order_id]),(4)))", stored: true),
                    order_date = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    total_price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    shipping_address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    status = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false, defaultValue: "Pending"),
                    processed_by_admin_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Orders__465962292ED791DD", x => x.order_id);
                    table.ForeignKey(
                        name: "FK_Orders_Admins",
                        column: x => x.processed_by_admin_id,
                        principalTable: "Admins",
                        principalColumn: "admin_id");
                    table.ForeignKey(
                        name: "FK_Orders_Customers",
                        column: x => x.cust_id,
                        principalTable: "Customers",
                        principalColumn: "cust_id");
                });

            migrationBuilder.CreateTable(
                name: "Photos",
                columns: table => new
                {
                    photo_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    cust_id = table.Column<int>(type: "int", nullable: false),
                    file_name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    file_path = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: false),
                    upload_date = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Photos__CB48C83D07463E73", x => x.photo_id);
                    table.ForeignKey(
                        name: "FK_Photos_Customers",
                        column: x => x.cust_id,
                        principalTable: "Customers",
                        principalColumn: "cust_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PrintSizes",
                columns: table => new
                {
                    size_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    template_id = table.Column<int>(type: "int", nullable: false),
                    size_name = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    is_available = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PrintSiz__0DCACE319866020C", x => x.size_id);
                    table.ForeignKey(
                        name: "FK_PrintSizes_ProductTemplates",
                        column: x => x.template_id,
                        principalTable: "ProductTemplates",
                        principalColumn: "template_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductGallery",
                columns: table => new
                {
                    gallery_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    template_id = table.Column<int>(type: "int", nullable: false),
                    image_url = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: false),
                    caption = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ProductG__43D54A71596AAEB7", x => x.gallery_id);
                    table.ForeignKey(
                        name: "FK_ProductGallery_ProductTemplates",
                        column: x => x.template_id,
                        principalTable: "ProductTemplates",
                        principalColumn: "template_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    payment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<int>(type: "int", nullable: false),
                    payment_method = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    credit_card_encrypted = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    encryption_method = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    payment_date = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    payment_status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false, defaultValue: "Pending")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Payments__ED1FC9EA0798E46A", x => x.payment_id);
                    table.ForeignKey(
                        name: "FK_Payments_Orders",
                        column: x => x.order_id,
                        principalTable: "Orders",
                        principalColumn: "order_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderDetails",
                columns: table => new
                {
                    order_detail_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<int>(type: "int", nullable: false),
                    photo_id = table.Column<int>(type: "int", nullable: false),
                    size_id = table.Column<int>(type: "int", nullable: true),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    price_per_copy = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    note_to_admin = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    line_total = table.Column<decimal>(type: "decimal(21,2)", nullable: true, computedColumnSql: "([quantity]*[price_per_copy])", stored: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OrderDet__3C5A4080731C6E7C", x => x.order_detail_id);
                    table.ForeignKey(
                        name: "FK_OrderDetails_Orders",
                        column: x => x.order_id,
                        principalTable: "Orders",
                        principalColumn: "order_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderDetails_Photos",
                        column: x => x.photo_id,
                        principalTable: "Photos",
                        principalColumn: "photo_id");
                    table.ForeignKey(
                        name: "FK_OrderDetails_PrintSizes",
                        column: x => x.size_id,
                        principalTable: "PrintSizes",
                        principalColumn: "size_id");
                });

            migrationBuilder.CreateIndex(
                name: "UQ__Admins__F3DBC57220EB5890",
                table: "Admins",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Customer__AB6E6164346F7110",
                table: "Customers",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Customer__F3DBC5724C68D63C",
                table: "Customers",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_order_id",
                table: "OrderDetails",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_photo_id",
                table: "OrderDetails",
                column: "photo_id");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_size_id",
                table: "OrderDetails",
                column: "size_id");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_cust_id",
                table: "Orders",
                column: "cust_id");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_processed_by_admin_id",
                table: "Orders",
                column: "processed_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Orders__3AFC5A9105B1ACE4",
                table: "Orders",
                column: "folder_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Payments__465962282B0C99B1",
                table: "Payments",
                column: "order_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Photos_cust_id",
                table: "Photos",
                column: "cust_id");

            migrationBuilder.CreateIndex(
                name: "IX_PrintSizes_template_id",
                table: "PrintSizes",
                column: "template_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProductGallery_template_id",
                table: "ProductGallery",
                column: "template_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderDetails");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "ProductGallery");

            migrationBuilder.DropTable(
                name: "Photos");

            migrationBuilder.DropTable(
                name: "PrintSizes");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "ProductTemplates");

            migrationBuilder.DropTable(
                name: "Admins");

            migrationBuilder.DropTable(
                name: "Customers");
        }
    }
}
