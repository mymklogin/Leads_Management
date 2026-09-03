using Microsoft.Extensions.Configuration;

namespace LeadsManagement.Api.Helpers;

public class DbConnectionHelpers
{
    private readonly IConfiguration _configuration;

    public DbConnectionHelpers(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string Getdbconnection()
    {
        return _configuration.GetConnectionString("SqlServerConnection")
            ?? _configuration.GetConnectionString("DefaultConnection")
            ?? "Server=localhost;Database=LeadsManagementDb;Trusted_Connection=True;TrustServerCertificate=True;";
    }
}

