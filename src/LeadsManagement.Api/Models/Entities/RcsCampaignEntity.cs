using System;

namespace LeadsManagement.Api.Models.Entities;

public class RcsCampaignEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CampaignId { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public string BotName { get; set; } = "PBG INFO";
    public string TemplateName { get; set; } = "pbg_account_status_u";
    public string ServiceType { get; set; } = "RCS-T";
    public int TotalMobiles { get; set; } = 1;
    public string? MobileNumber { get; set; }
    public string? Operator { get; set; }
    public string? Circle { get; set; }
    public int Delivered { get; set; }
    public int ReadCount { get; set; }
    public int Failed { get; set; }
    public int Awaited { get; set; }
    public string Status { get; set; } = "Delivered";
    public decimal CreditsDeducted { get; set; } = 1;
    public string? Reason { get; set; }
    public string? IpAddress { get; set; }
    public string SentVia { get; set; } = "Web Panel";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class RcsDeliveryLogEntity
{
    public int Id { get; set; }
    public int CampaignId { get; set; }
    public string MobileNumber { get; set; } = string.Empty;
    public string? Operator { get; set; }
    public string? Circle { get; set; }
    public string Status { get; set; } = "DELIVERED";
    public DateTime? DeliveredAt { get; set; }
    public string? Reason { get; set; }
    public string? IpAddress { get; set; }
}
