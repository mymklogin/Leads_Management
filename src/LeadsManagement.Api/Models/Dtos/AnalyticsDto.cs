using System.Collections.Generic;

namespace LeadsManagement.Api.Models.Dtos;

public class DashboardAnalyticsDto
{
    public int TotalLeads { get; set; }
    public int ConnectedCalls { get; set; }
    public int HotLeadsCount { get; set; }
    public int WarmLeadsCount { get; set; }
    public int ColdLeadsCount { get; set; }
    public int DroppedCallsCount { get; set; }
    public double AverageCallDurationSeconds { get; set; }

    public Dictionary<string, int> StatusBreakdown { get; set; } = new();
    public Dictionary<string, int> TemplateBreakdown { get; set; } = new();
    public Dictionary<string, int> DtmfKeyBreakdown { get; set; } = new();
    public List<LeadResponseDto> RecentLeads { get; set; } = new();
}
