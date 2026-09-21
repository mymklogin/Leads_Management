using System;
using System.Collections.Generic;

namespace LeadsManagement.Api.Models.Dtos;

public class LeadFilterDto
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? ServiceRequired { get; set; }
    public string? InquiryType { get; set; }
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
    public string? Email { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? IpAddress { get; set; }
    public string? ServiceRequired { get; set; }
    public string? LeadSource { get; set; } = "AI Chat Assistant";
    public string? InquiryType { get; set; } = "Sales";
    public string? ChatTranscript { get; set; }
    public int? TemplateId { get; set; }
    public string? LeadStatus { get; set; } = "New";
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
    public string? Email { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? IpAddress { get; set; }
    public string? ServiceRequired { get; set; }
    public string? LeadSource { get; set; }
    public string? InquiryType { get; set; }
    public string? ChatTranscript { get; set; }
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

public class AiChatMessageDto
{
    public string Sender { get; set; } = "user"; // "user" or "assistant"
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class AiChatRequestDto
{
    public string Message { get; set; } = string.Empty;
    public List<AiChatMessageDto> History { get; set; } = new();
    public string? AssistantName { get; set; }
    public string? CustomerName { get; set; }
    public string? Mobile { get; set; }
    public string? Email { get; set; }
    public string? ServiceRequired { get; set; }
    public string? InquiryType { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? IpAddress { get; set; }
    public string? Language { get; set; }
}

public class AiChatResponseDto
{
    public string Reply { get; set; } = string.Empty;
    public bool LeadCaptured { get; set; } = false;
    public int? LeadId { get; set; }
    public string? AssistantName { get; set; }
    public string? ExtractedName { get; set; }
    public string? ExtractedMobile { get; set; }
    public string? ExtractedEmail { get; set; }
    public string? ExtractedService { get; set; }
    public string? ExtractedInquiryType { get; set; }
    public string? DetectedLanguage { get; set; }
    public List<string> SuggestedChips { get; set; } = new();
}
