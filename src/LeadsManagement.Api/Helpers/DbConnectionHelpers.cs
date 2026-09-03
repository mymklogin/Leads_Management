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
        return _configuration.GetConnectionString("PostgreSqlConnection")
            ?? _configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=leads_management_db;Username=postgres;Password=postgres;";
    }
}

