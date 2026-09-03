using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Entities;

namespace LeadsManagement.Api.Repositories.Interfaces;

public interface ILeadRepository
{
    Task<List<LeadRecord>> GetLeadsAsync(string? status, int? templateId, string? mobile, int pageNumber = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<int> CreateOrUpdateLeadAsync(LeadRecord lead, CancellationToken cancellationToken = default);
    Task<LeadRecord?> GetLeadByMobileAsync(string mobile, CancellationToken cancellationToken = default);
    Task<LeadRecord?> GetLeadByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> DeleteLeadAsync(int id, CancellationToken cancellationToken = default);
    Task<List<LeadRecord>> GetAllLeadsRawAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<string, int>> GetLeadCountByStatusAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<int, int>> GetLeadCountByTemplateAsync(CancellationToken cancellationToken = default);
}

