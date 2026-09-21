using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Entities;

namespace LeadsManagement.Api.Repositories.Interfaces;

public record RcsDashboardMetrics(
    int TotalCampaigns,
    int TotalSubmitted,
    int Delivered,
    int Read,
    int Failed,
    int Awaited,
    decimal DeliveryRate,
    decimal ReadRate
);

public interface IRcsCampaignRepository
{
    Task EnsureTablesCreatedAsync(CancellationToken ct = default);
    Task<int> InsertCampaignAsync(RcsCampaignEntity campaign, CancellationToken ct = default);
    Task InsertDeliveryLogsAsync(IEnumerable<RcsDeliveryLogEntity> logs, CancellationToken ct = default);
    Task<List<RcsCampaignEntity>> GetCampaignsByUserAsync(int userId, bool isSuperAdmin, int limit = 100, int offset = 0, CancellationToken ct = default);
    Task<List<RcsDeliveryLogEntity>> GetDeliveryLogsAsync(int campaignId, CancellationToken ct = default);
    Task<RcsDashboardMetrics> GetDashboardMetricsAsync(int userId, bool isSuperAdmin, CancellationToken ct = default);
    Task UpdateCampaignStatusAsync(int campaignId, int delivered, int read, int failed, int awaited, string status, CancellationToken ct = default);
    Task<bool> HasAnyCampaignsAsync(CancellationToken ct = default);
}
