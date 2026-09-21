using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LeadsManagement.Api.Models.Entities;

[Table("LeadRecords")]
public class LeadRecord
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string Mobile { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? CustomerName { get; set; }

    public int? TemplateId { get; set; }

    [Required]
    [MaxLength(200)]
    public string LeadStatus { get; set; } = "New";

    public int CallDuration { get; set; } = 0;

    [MaxLength(50)]
    public string? PressedDtmf { get; set; }

    [MaxLength(50)]
    public string? LastEventType { get; set; }

    public int? UserId { get; set; }

    public int? AssignedToUserId { get; set; }

    [MaxLength(20)]
    public string? Cli { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [MaxLength(120)]
    public string? Email { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? State { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    [MaxLength(60)]
    public string? IpAddress { get; set; }

    [MaxLength(100)]
    public string? ServiceRequired { get; set; }

    [MaxLength(100)]
    public string? LeadSource { get; set; } = "AI Chat Assistant";

    [MaxLength(50)]
    public string? InquiryType { get; set; } = "Sales";

    [MaxLength(4000)]
    public string? ChatTranscript { get; set; }

    [MaxLength(500)]
    public string? CustomData { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
