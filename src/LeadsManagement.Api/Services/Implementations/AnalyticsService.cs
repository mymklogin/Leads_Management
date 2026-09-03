using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Implementations;

public class AnalyticsService : IAnalyticsService
{
    private readonly ILeadRepository _leadRepository;

    public AnalyticsService(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync(CancellationToken cancellationToken = default)
    {
        var leads = await _leadRepository.GetAllLeadsRawAsync(cancellationToken);

        int totalLeads = leads.Count;
        int connectedCalls = leads.Count(x => x.CallDuration > 0 || x.LastEventType == "CONNECTED_CALLS" || x.LastEventType == "HANGUP" || x.LastEventType == "DTMF");

        int hotLeads = leads.Count(x => x.LeadStatus.Contains("Hot", StringComparison.OrdinalIgnoreCase));
        int warmLeads = leads.Count(x => x.LeadStatus.Contains("Warm", StringComparison.OrdinalIgnoreCase) || x.LeadStatus.Contains("Engaged", StringComparison.OrdinalIgnoreCase) || x.LeadStatus.Contains("Active", StringComparison.OrdinalIgnoreCase));
        int coldLeads = leads.Count(x => x.LeadStatus.Contains("Cold", StringComparison.OrdinalIgnoreCase) || x.LeadStatus.Contains("Quick", StringComparison.OrdinalIgnoreCase));
        int droppedCalls = leads.Count(x => x.LeadStatus.Contains("Drop", StringComparison.OrdinalIgnoreCase) || x.LeadStatus.Contains("Cut", StringComparison.OrdinalIgnoreCase) || x.LeadStatus.Contains("Ignored", StringComparison.OrdinalIgnoreCase));

        double avgDuration = totalLeads > 0 ? leads.Average(x => x.CallDuration) : 0;

        var statusBreakdown = leads
            .GroupBy(x => x.LeadStatus)
            .ToDictionary(g => g.Key, g => g.Count());

        var templateBreakdown = leads
            .GroupBy(x => x.TemplateId.HasValue ? $"Template {x.TemplateId.Value}" : "Unspecified")
            .ToDictionary(g => g.Key, g => g.Count());

        var dtmfBreakdown = leads
            .Where(x => !string.IsNullOrWhiteSpace(x.PressedDtmf))
            .GroupBy(x => x.PressedDtmf!)
            .ToDictionary(g => $"Key {g.Key}", g => g.Count());

        var recentLeads = leads
            .OrderByDescending(x => x.UpdatedAt)
            .Take(10)
            .Select(x => new LeadResponseDto
            {
                Id = x.Id,
                Mobile = x.Mobile,
                CustomerName = x.CustomerName,
                TemplateId = x.TemplateId,
                LeadStatus = x.LeadStatus,
                CallDuration = x.CallDuration,
                PressedDtmf = x.PressedDtmf,
                LastEventType = x.LastEventType,
                Cli = x.Cli,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToList();

        return new DashboardAnalyticsDto
        {
            TotalLeads = totalLeads,
            ConnectedCalls = connectedCalls,
            HotLeadsCount = hotLeads,
            WarmLeadsCount = warmLeads,
            ColdLeadsCount = coldLeads,
            DroppedCallsCount = droppedCalls,
            AverageCallDurationSeconds = Math.Round(avgDuration, 2),
            StatusBreakdown = statusBreakdown,
            TemplateBreakdown = templateBreakdown,
            DtmfKeyBreakdown = dtmfBreakdown,
            RecentLeads = recentLeads
        };
    }
}
