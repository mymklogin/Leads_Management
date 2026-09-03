using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LeadsManagement.Api.Models.Entities;

[Table("RcsTransactionLogs")]
public class RcsTransactionLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string TransactionCode { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    public int? PerformedByUserId { get; set; }

    [MaxLength(100)]
    public string? PerformedByUsername { get; set; }

    [Required]
    [MaxLength(20)]
    public string ServiceType { get; set; } = "RCS"; // "RCS" or "SMS"

    [Required]
    [MaxLength(50)]
    public string ActionType { get; set; } = "Credit"; // "Credit", "Revoke", "CampaignUsage"

    [Column(TypeName = "decimal(18,2)")]
    public decimal Credits { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal PricePerCredit { get; set; } = 0.0000m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; } = 0.00m;

    [MaxLength(500)]
    public string? Notes { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal BalanceAfter { get; set; }
}
