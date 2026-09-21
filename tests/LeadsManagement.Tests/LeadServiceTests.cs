using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Services.Implementations;
using Xunit;

namespace LeadsManagement.Tests;

public class LeadServiceTests
{
    [Fact]
    public async Task CreateLead_SuccessfullyAddsLeadToDatabase()
    {
        var leadRepo = new FakeLeadRepository();
        var userRepo = new FakeUserRepository();
        var service = new LeadService(leadRepo, userRepo);

        var dto = new CreateLeadDto
        {
            Mobile = "9876543210",
            CustomerName = "Rajesh Kumar",
            TemplateId = 0,
            LeadStatus = "New",
            Notes = "Test lead creation"
        };

        var result = await service.CreateLeadAsync(dto, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("9876543210", result.Mobile);
        Assert.Equal("Rajesh Kumar", result.CustomerName);
        Assert.Equal("New", result.LeadStatus);

        var dbLead = await leadRepo.GetLeadByMobileAsync("9876543210");
        Assert.NotNull(dbLead);
    }

    [Fact]
    public async Task GetLeads_WithFilteringAndPagination_ReturnsMatchingLeads()
    {
        var leadRepo = new FakeLeadRepository();
        var userRepo = new FakeUserRepository();
        var service = new LeadService(leadRepo, userRepo);

        await leadRepo.CreateOrUpdateLeadAsync(new LeadRecord { Mobile = "9111111111", CustomerName = "Amit", LeadStatus = "Hot Lead", TemplateId = 1, CallDuration = 40 });
        await leadRepo.CreateOrUpdateLeadAsync(new LeadRecord { Mobile = "9222222222", CustomerName = "Sumit", LeadStatus = "Cold Lead", TemplateId = 1, CallDuration = 5 });
        await leadRepo.CreateOrUpdateLeadAsync(new LeadRecord { Mobile = "9333333333", CustomerName = "Rahul", LeadStatus = "Hot Lead", TemplateId = 2, CallDuration = 55 });

        var filter = new LeadFilterDto
        {
            Status = "Hot",
            TemplateId = 1,
            Page = 1,
            PageSize = 10
        };

        var pagedResult = await service.GetLeadsAsync(filter, CancellationToken.None);

        Assert.Single(pagedResult.Items);
        Assert.Equal(1, pagedResult.TotalCount);
        Assert.Equal("9111111111", pagedResult.Items.First().Mobile);
    }

    [Fact]
    public async Task UpdateLeadStatus_UpdatesStatusAndNotes()
    {
        var leadRepo = new FakeLeadRepository();
        var userRepo = new FakeUserRepository();
        var service = new LeadService(leadRepo, userRepo);

        var leadId = await leadRepo.CreateOrUpdateLeadAsync(new LeadRecord { Mobile = "9999999999", LeadStatus = "New" });

        var updateDto = new UpdateLeadStatusDto
        {
            LeadStatus = "Converted to Sale",
            Notes = "Customer purchased premium plan"
        };

        var updated = await service.UpdateLeadStatusAsync(leadId, updateDto, CancellationToken.None);

        Assert.NotNull(updated);
        Assert.Equal("Converted to Sale", updated.LeadStatus);
        Assert.Equal("Customer purchased premium plan", updated.Notes);
    }

    [Fact]
    public async Task ExportCsv_ReturnsValidCsvBytes()
    {
        var leadRepo = new FakeLeadRepository();
        var userRepo = new FakeUserRepository();
        var service = new LeadService(leadRepo, userRepo);

        await leadRepo.CreateOrUpdateLeadAsync(new LeadRecord
        {
            Mobile = "9876500000",
            CustomerName = "Priya Sharma",
            LeadStatus = "Interested Lead",
            CallDuration = 30
        });

        var csvBytes = await service.ExportLeadsCsvAsync(new LeadFilterDto(), CancellationToken.None);

        Assert.NotNull(csvBytes);
        Assert.NotEmpty(csvBytes);
        string csvString = System.Text.Encoding.UTF8.GetString(csvBytes);
        Assert.Contains("Mobile", csvString);
        Assert.Contains("9876500000", csvString);
        Assert.Contains("Priya Sharma", csvString);
    }
}
