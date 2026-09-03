using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Entities;

namespace LeadsManagement.Api.Repositories.Interfaces;

public interface ICampaignRepository
{
    Task<int> CreateCampaignAsync(CampaignRecord campaign, CancellationToken cancellationToken = default);
    Task<List<CampaignRecord>> GetCampaignsAsync(int limit = 100, CancellationToken cancellationToken = default);
    Task<CampaignRecord?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> UpdateStatusAsync(int id, string status, string? responseData = null, CancellationToken cancellationToken = default);
}

