using System;

namespace LeadsManagement.Api.Models.Entities;

public class RcsBotRecord
{
    public int Id { get; set; }
    public string BotId { get; set; } = string.Empty;
    public string BotName { get; set; } = string.Empty;
    public string MessageType { get; set; } = "Transactional"; // Transactional or Promotional
    public string? BrandName { get; set; }
    public string? LogoUrl { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Verified"; // Verified, Pending, On Hold, Rejected, Suspended
    public string WebhookUrl { get; set; } = string.Empty;
    public string Color { get; set; } = "#0a66c2";
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? TermsUrl { get; set; }
    public string? PrivacyUrl { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactDesignation { get; set; }
    public string? DltEntityId { get; set; }
    public string? GstUrl { get; set; }
    public string? PanUrl { get; set; }
    public string? BannerUrl { get; set; }
    public int UserId { get; set; } = 1;
    public string CreatedDate { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
