using System;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using LeadsManagement.Api.Helpers;
using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Repositories.Implementations;
using LeadsManagement.Api.Services.Implementations;
using LeadsManagement.Api.Services.Interfaces;
using LeadsManagement.Api.Services.Strategies;

try
{
    // Disable inotify in container environments to prevent limit (128) IOException crash
    Environment.SetEnvironmentVariable("DOTNET_USE_POLLING_FILE_WATCHER", "1");

    Console.WriteLine("[STARTUP] Initializing Leads Management Backend API...");
    var builder = WebApplication.CreateBuilder(args);

    // Replace default reloadOnChange: true file watchers with static reloadOnChange: false
    builder.Configuration.Sources.Clear();
    builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: false);
    builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: false);
    builder.Configuration.AddEnvironmentVariables();

    // Configure port for Render.com (Render supplies PORT env var)
    var renderPort = Environment.GetEnvironmentVariable("PORT");
    if (!string.IsNullOrWhiteSpace(renderPort))
    {
        builder.WebHost.UseUrls($"http://+:{renderPort}");
    }

// 1. Add Controllers with flexible JSON formatting
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// 2. Add Memory Cache (used by templates 4, 5, 7)
builder.Services.AddMemoryCache();

// 3. Register Database Connection Helper & ADO.NET Repositories (Matching empsdemo3 architecture)
builder.Services.AddSingleton<DbConnectionHelpers>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IMenuRepository, MenuRepository>();
builder.Services.AddScoped<ILeadRepository, LeadRepository>();
builder.Services.AddScoped<ICampaignRepository, CampaignRepository>();
builder.Services.AddScoped<IWebhookLogRepository, WebhookLogRepository>();
builder.Services.AddScoped<IRcsTransactionRepository, RcsTransactionRepository>();
builder.Services.AddSingleton<IRcsAssetRepository, RcsAssetRepository>();

// 4. Register Template Strategies (Strategy Pattern for 0, 1, 2, 3, 4, 5, 7, 8, 9)
builder.Services.AddScoped<ITemplateWebhookStrategy, Template0SimpleStrategy>();
builder.Services.AddScoped<ITemplateWebhookStrategy, Template1DtmfStrategy>();
builder.Services.AddScoped<ITemplateWebhookStrategy, Template2CallPatchStrategy>();
builder.Services.AddScoped<ITemplateWebhookStrategy, Template3CustomIvrStrategy>();
builder.Services.AddScoped<ITemplateWebhookStrategy, Template4NextarStrategy>();
builder.Services.AddScoped<ITemplateWebhookStrategy, Template5OtpStrategy>();
builder.Services.AddScoped<ITemplateWebhookStrategy, Template7TtsSimpleStrategy>();
builder.Services.AddScoped<ITemplateWebhookStrategy, Template8TtsDtmfStrategy>();
builder.Services.AddScoped<ITemplateWebhookStrategy, Template9TtsCallPatchStrategy>();

// 5. Register Application Services
builder.Services.AddSingleton<IGatewayConfigService, GatewayConfigService>();
builder.Services.AddSingleton<IResellerConnectivityService, ResellerConnectivityService>();
builder.Services.AddSingleton<IDynamicMenuService, DynamicMenuService>();
builder.Services.AddSingleton<IMasterDataService, MasterDataService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<IWebhookProcessorService, WebhookProcessorService>();
builder.Services.AddScoped<ILeadService, LeadService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddHttpClient<IExpressIvrClient, ExpressIvrClient>();
builder.Services.AddHttpClient<IRcsGatewayService, RcsGatewayService>(client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    client.DefaultRequestHeaders.Add("Accept", "application/json, text/plain, */*");
})
.ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    ServerCertificateCustomValidationCallback = (message, cert, chain, sslPolicyErrors) => true
});

// 6. Configure JWT Authentication
string jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? "SUPER_SECRET_LEADS_MANAGEMENT_KEY_9999900000_VERY_SECURE";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 7. Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 8. Configure Swagger with JWT Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Multi-Service SaaS & Leads Management API",
        Version = "v1",
        Description = "Enterprise Multi-Tenant Platform with SuperAdmin -> Admin -> Reseller -> User Hierarchy, 100% Dynamic Menus, Cascading Checkbox Permissions, ExpressIVR OBD Templates (0-9), and Real-Time Reporting."
    });

    // Add JWT Bearer definition
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT Token obtained from /api/auth/login. Example: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Idempotent schema upgrade with resilience against remote DB handshake delays
try
{
    using var scope = app.Services.CreateScope();
    var connection = scope.ServiceProvider.GetRequiredService<LeadsManagement.Api.Helpers.DbConnectionHelpers>();
    await using var db = new Npgsql.NpgsqlConnection(connection.Getdbconnection());
    await db.OpenAsync();
    var stream = typeof(LeadsManagement.Api.Helpers.DbConnectionHelpers).Assembly
        .GetManifestResourceStream("LeadsManagement.Api.Migrations.20260917_balance_audit.sql");
    if (stream != null)
    {
        using var reader = new StreamReader(stream);
        await using var command = new Npgsql.NpgsqlCommand(await reader.ReadToEndAsync(), db);
        await command.ExecuteNonQueryAsync();
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[STARTUP DB WARNING]: {ex.Message}");
}

// 9. Middleware pipeline
app.UseStaticFiles();
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Leads Management API v1");
        c.RoutePrefix = "swagger"; // Available at /swagger
    });
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("[STARTUP] Pipeline configured. Starting HTTP listener...");
app.Run();
}
catch (Exception ex)
{
    Console.Error.WriteLine($"[FATAL CRASH AT STARTUP]: {ex}");
    throw;
}
