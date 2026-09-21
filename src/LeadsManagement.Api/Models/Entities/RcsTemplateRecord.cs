using System;

namespace LeadsManagement.Api.Models.Entities;

public class RcsTemplateRecord
{
    public int Id { get; set; }
    public string TemplateId { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public string TemplateType { get; set; } = "PlainText"; // PlainText, RichCard, Carousel
    public string BotId { get; set; } = string.Empty;
    public string BotName { get; set; } = string.Empty;
    public string VendorTemplateId { get; set; } = string.Empty;
    public string TemplateStatus { get; set; } = "Active"; // Active, Inactive, Pending, Rejected, SUBMITTED
    public string? EntityId { get; set; }
    public string? SenderId { get; set; }
    public string? SmsTemplateId { get; set; }
    public string? SmsText { get; set; }
    public string? CardTitle { get; set; }
    public string? CardDescription { get; set; }
    public string? MediaUrl { get; set; }
    public string? ButtonLabel { get; set; }
    public string? ButtonUrl { get; set; }
    public string? ButtonsJson { get; set; }
    public string? CardsJson { get; set; }
    public int UserId { get; set; } = 1;
    public string CreatedDate { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
