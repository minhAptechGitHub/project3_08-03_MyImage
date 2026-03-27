using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace p3_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddVnPayAndPaymentTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "credit_card_encrypted",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "encryption_method",
                table: "Payments");

            migrationBuilder.AddColumn<string>(
                name: "payment_method",
                table: "Orders",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PaymentTransactions",
                columns: table => new
                {
                    transaction_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<int>(type: "int", nullable: false),
                    txn_ref = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    amount = table.Column<decimal>(type: "decimal(18,0)", nullable: false),
                    vnp_transaction_no = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    response_code = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false, defaultValue: "Pending"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTransactions", x => x.transaction_id);
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_Orders",
                        column: x => x.order_id,
                        principalTable: "Orders",
                        principalColumn: "order_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_order_id",
                table: "PaymentTransactions",
                column: "order_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentTransactions");

            migrationBuilder.DropColumn(
                name: "payment_method",
                table: "Orders");

            migrationBuilder.AddColumn<string>(
                name: "credit_card_encrypted",
                table: "Payments",
                type: "varchar(500)",
                unicode: false,
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "encryption_method",
                table: "Payments",
                type: "varchar(50)",
                unicode: false,
                maxLength: 50,
                nullable: true);
        }
    }
}
