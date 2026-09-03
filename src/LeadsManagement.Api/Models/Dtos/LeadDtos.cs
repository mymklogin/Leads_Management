using System;
using System.Collections.Generic;

namespace LeadsManagement.Api.Models.Dtos;

public class LeadFilterDto
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public int? TemplateId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; } = "UpdatedAt";
    public bool SortDescending { get; set; } = true;
}

public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = new List<T>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

public class CreateLeadDto
{
    public string Mobile { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public int? TemplateId { get; set; }
    public string? LeadStatus { get; set; }
    public string? Notes { get; set; }
    public string? CustomData { get; set; }
}

public class UpdateLeadStatusDto
{
    public string LeadStatus { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class LeadResponseDto
{
    public int Id { get; set; }
    public string Mobile { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public int? TemplateId { get; set; }
    public string LeadStatus { get; set; } = string.Empty;
    public int CallDuration { get; set; }
    public string? PressedDtmf { get; set; }
    public string? LastEventType { get; set; }
    public int? UserId { get; set; }
    public string? Cli { get; set; }
    public string? Notes { get; set; }
    public string? CustomData { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
