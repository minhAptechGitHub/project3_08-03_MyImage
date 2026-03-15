using Microsoft.EntityFrameworkCore;
using p3_backend.Data;
using p3_backend.Models;
using System;

var builder = WebApplication.CreateBuilder(args);

//dang ky DbConnect voi connection String
builder.Services.AddDbContext<P3MyImage3Context>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add this before var app = builder.Build();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins("http://localhost:5173", "http://localhost:3000") // React dev server ports
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

//them du lieu mau
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<P3MyImage3Context>();
    await DbSeeder.SeedData(context);
}
// Add this after var app = builder.Build();
app.UseCors("AllowReactApp");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
//app.UseStaticFiles(); // serves wwwroot/uploads/ as public URLs

app.UseAuthorization();

app.MapControllers();

app.Run();