using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Models.Enums;
using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Implementations;

public class LeadService : ILeadService
{
    private readonly ILeadRepository _leadRepository;
    private readonly IUserRepository _userRepository;

    public LeadService(ILeadRepository leadRepository, IUserRepository userRepository)
    {
        _leadRepository = leadRepository;
        _userRepository = userRepository;
    }

    public Task<PagedResult<LeadResponseDto>> GetLeadsAsync(LeadFilterDto filter, CancellationToken cancellationToken = default)
    {
        return GetLeadsAsync(filter, 0, cancellationToken);
    }

    public async Task<PagedResult<LeadResponseDto>> GetLeadsAsync(LeadFilterDto filter, int currentUserId, CancellationToken cancellationToken = default)
    {
        var rawLeads = await _leadRepository.GetAllLeadsRawAsync(cancellationToken);
        var query = rawLeads.AsEnumerable();

        // Data Isolation / Hierarchy Scoping
        if (currentUserId > 0)
        {
            var currentUser = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
            if (currentUser != null && currentUser.Role != UserRole.SuperAdmin)
            {
                if (currentUser.Role == UserRole.User)
                {
                    query = query.Where(x => x.UserId == currentUserId || x.AssignedToUserId == currentUserId);
                }
                else // Admin or Reseller
                {
                    var allowedUserIds = await _userRepository.GetDownlineUserIdsAsync(currentUserId, cancellationToken);
                    allowedUserIds.Add(currentUserId);
                    query = query.Where(x => (x.UserId.HasValue && allowedUserIds.Contains(x.UserId.Value)) ||
                                             (x.AssignedToUserId.HasValue && allowedUserIds.Contains(x.AssignedToUserId.Value)));
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            string search = filter.Search.Trim();
            query = query.Where(x => x.Mobile.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                                     (x.CustomerName != null && x.CustomerName.Contains(search, StringComparison.OrdinalIgnoreCase)));
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            string status = filter.Status.Trim();
            query = query.Where(x => x.LeadStatus.Contains(status, StringComparison.OrdinalIgnoreCase));
        }

        if (filter.TemplateId.HasValue)
        {
            query = query.Where(x => x.TemplateId == filter.TemplateId.Value);
        }

        if (filter.FromDate.HasValue)
        {
            var startOfDay = filter.FromDate.Value.Date;
            query = query.Where(x => x.CreatedAt >= startOfDay);
        }

        if (filter.ToDate.HasValue)
        {
            var endOfDay = filter.ToDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(x => x.CreatedAt <= endOfDay);
        }

        var filteredList = query.ToList();
        int totalCount = filteredList.Count;

        // Sorting
        filteredList = filter.SortBy?.ToLowerInvariant() switch
        {
            "mobile" => filter.SortDescending ? filteredList.OrderByDescending(x => x.Mobile).ToList() : filteredList.OrderBy(x => x.Mobile).ToList(),
            "leadstatus" => filter.SortDescending ? filteredList.OrderByDescending(x => x.LeadStatus).ToList() : filteredList.OrderBy(x => x.LeadStatus).ToList(),
            "callduration" => filter.SortDescending ? filteredList.OrderByDescending(x => x.CallDuration).ToList() : filteredList.OrderBy(x => x.CallDuration).ToList(),
            "createdat" => filter.SortDescending ? filteredList.OrderByDescending(x => x.CreatedAt).ToList() : filteredList.OrderBy(x => x.CreatedAt).ToList(),
            _ => filter.SortDescending ? filteredList.OrderByDescending(x => x.UpdatedAt).ToList() : filteredList.OrderBy(x => x.UpdatedAt).ToList()
        };

        int page = Math.Max(1, filter.Page);
        int pageSize = Math.Clamp(filter.PageSize, 1, 500);

        var items = filteredList
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => MapToDto(x))
            .ToList();

        return new PagedResult<LeadResponseDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<LeadResponseDto?> GetLeadByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var lead = await _leadRepository.GetLeadByIdAsync(id, cancellationToken);
        return lead != null ? MapToDto(lead) : null;
    }

    public async Task<LeadResponseDto?> GetLeadByMobileAsync(string mobile, CancellationToken cancellationToken = default)
    {
        var lead = await _leadRepository.GetLeadByMobileAsync(mobile, cancellationToken);
        return lead != null ? MapToDto(lead) : null;
    }

    public Task<LeadResponseDto> CreateLeadAsync(CreateLeadDto dto, CancellationToken cancellationToken = default)
    {
        return CreateLeadAsync(dto, 0, cancellationToken);
    }

    public async Task<LeadResponseDto> CreateLeadAsync(CreateLeadDto dto, int currentUserId, CancellationToken cancellationToken = default)
    {
        var lead = new LeadRecord
        {
            Mobile = dto.Mobile.Trim(),
            CustomerName = dto.CustomerName?.Trim(),
            TemplateId = dto.TemplateId,
            LeadStatus = !string.IsNullOrWhiteSpace(dto.LeadStatus) ? dto.LeadStatus.Trim() : "New Lead",
            Notes = dto.Notes,
            CustomData = dto.CustomData,
            UserId = currentUserId > 0 ? currentUserId : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        int newId = await _leadRepository.CreateOrUpdateLeadAsync(lead, cancellationToken);
        lead.Id = newId;

        return MapToDto(lead);
    }

    public async Task<LeadResponseDto?> UpdateLeadStatusAsync(int id, UpdateLeadStatusDto dto, CancellationToken cancellationToken = default)
    {
        var lead = await _leadRepository.GetLeadByIdAsync(id, cancellationToken);
        if (lead == null) return null;

        lead.LeadStatus = dto.LeadStatus;
        if (!string.IsNullOrWhiteSpace(dto.Notes))
        {
            lead.Notes = dto.Notes;
        }
        lead.UpdatedAt = DateTime.UtcNow;

        await _leadRepository.CreateOrUpdateLeadAsync(lead, cancellationToken);
        return MapToDto(lead);
    }

    public async Task<bool> DeleteLeadAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _leadRepository.DeleteLeadAsync(id, cancellationToken);
    }

    public Task<byte[]> ExportLeadsCsvAsync(LeadFilterDto filter, CancellationToken cancellationToken = default)
    {
        return ExportLeadsCsvAsync(filter, 0, cancellationToken);
    }

    public async Task<byte[]> ExportLeadsCsvAsync(LeadFilterDto filter, int currentUserId, CancellationToken cancellationToken = default)
    {
        filter.Page = 1;
        filter.PageSize = 10000;
        var pagedResult = await GetLeadsAsync(filter, currentUserId, cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("Id,Mobile,CustomerName,TemplateId,LeadStatus,CallDuration,PressedDtmf,LastEventType,Cli,CreatedAt,UpdatedAt");

        foreach (var lead in pagedResult.Items)
        {
            sb.AppendLine($"{lead.Id},\"{lead.Mobile}\",\"{lead.CustomerName ?? ""}\",{lead.TemplateId},\"{EscapeCsv(lead.LeadStatus)}\",{lead.CallDuration},\"{lead.PressedDtmf ?? ""}\",\"{lead.LastEventType ?? ""}\",\"{lead.Cli ?? ""}\",\"{lead.CreatedAt:yyyy-MM-dd HH:mm:ss}\",\"{lead.UpdatedAt:yyyy-MM-dd HH:mm:ss}\"");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string EscapeCsv(string text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;
        return text.Replace("\"", "\"\"");
    }

    private static LeadResponseDto MapToDto(LeadRecord entity) => new()
    {
        Id = entity.Id,
        Mobile = entity.Mobile,
        CustomerName = entity.CustomerName,
        TemplateId = entity.TemplateId,
        LeadStatus = entity.LeadStatus,
        CallDuration = entity.CallDuration,
        PressedDtmf = entity.PressedDtmf,
        LastEventType = entity.LastEventType,
        UserId = entity.UserId,
        Cli = entity.Cli,
        Notes = entity.Notes,
        CustomData = entity.CustomData,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };
}
