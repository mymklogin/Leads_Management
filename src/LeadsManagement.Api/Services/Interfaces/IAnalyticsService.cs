using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;

namespace LeadsManagement.Api.Services.Interfaces;

public interface IAnalyticsService
{
    Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync(CancellationToken cancellationToken = default);
}
