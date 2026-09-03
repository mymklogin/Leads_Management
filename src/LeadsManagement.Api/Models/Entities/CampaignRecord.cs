using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LeadsManagement.Api.Models.Entities;

[Table("CampaignRecords")]
public class CampaignRecord
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string CampaignName { get; set; } = string.Empty;

    public int TemplateId { get; set; }

    [Required]
    [MaxLength(20)]
    public string TargetMobile { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Cli { get; set; }

    public int? UserId { get; set; }

    public string? RequestPayload { get; set; }

    public string? ApiResponse { get; set; }

    [MaxLength(50)]
    public string DispatchStatus { get; set; } = "Pending";

    public DateTime DispatchedAt { get; set; } = DateTime.UtcNow;
}
