using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;

namespace LeadsManagement.Api.Services.Interfaces;

public interface ILeadService
{
    Task<PagedResult<LeadResponseDto>> GetLeadsAsync(LeadFilterDto filter, CancellationToken cancellationToken = default);
    Task<PagedResult<LeadResponseDto>> GetLeadsAsync(LeadFilterDto filter, int currentUserId, CancellationToken cancellationToken = default);
    Task<LeadResponseDto?> GetLeadByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<LeadResponseDto?> GetLeadByMobileAsync(string mobile, CancellationToken cancellationToken = default);
    Task<LeadResponseDto> CreateLeadAsync(CreateLeadDto dto, CancellationToken cancellationToken = default);
    Task<LeadResponseDto> CreateLeadAsync(CreateLeadDto dto, int currentUserId, CancellationToken cancellationToken = default);
    Task<LeadResponseDto?> UpdateLeadStatusAsync(int id, UpdateLeadStatusDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteLeadAsync(int id, CancellationToken cancellationToken = default);
    Task<byte[]> ExportLeadsCsvAsync(LeadFilterDto filter, CancellationToken cancellationToken = default);
    Task<byte[]> ExportLeadsCsvAsync(LeadFilterDto filter, int currentUserId, CancellationToken cancellationToken = default);
}
