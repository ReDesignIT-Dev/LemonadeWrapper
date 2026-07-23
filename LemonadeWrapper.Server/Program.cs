using LemonadeWrapper.Server.Context;
using LemonadeWrapper.Server.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddLogging();

builder.Services.AddDbContext<ChatDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IChatSessionService, ChatSessionService>();
builder.Services.AddScoped<IChatMessageService, ChatMessageService>();
builder.Services.AddSingleton<ISettingsService, SettingsService>();
builder.Services.AddHttpClient();
builder.Services.AddHealthChecks();

var app = builder.Build();

// Auto-create database with current schema on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ChatDbContext>();
    db.Database.EnsureCreated();
}

app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

await app.RunAsync();