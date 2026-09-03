using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LeadsManagement.Api.Models.Entities;

[Table("WebhookLogs")]
public class WebhookLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [MaxLength(20)]
    public string? Mobile { get; set; }

    public int? TemplateId { get; set; }

    [MaxLength(50)]
    public string? EventType { get; set; }

    [MaxLength(50)]
    public string? PressedKey { get; set; }

    public int Duration { get; set; }

    [MaxLength(200)]
    public string? ComputedLeadStatus { get; set; }

    public string? RawPayload { get; set; }

    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;

    public bool IsSuccess { get; set; } = true;

    [MaxLength(500)]
    public string? ErrorMessage { get; set; }
}
