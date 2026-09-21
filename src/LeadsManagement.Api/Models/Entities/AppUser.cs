using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using LeadsManagement.Api.Models.Enums;

namespace LeadsManagement.Api.Models.Entities;

[Table("Users")]
public class AppUser
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [Required]
    public UserRole Role { get; set; } = UserRole.User;

    /// <summary>
    /// Who created / owns this account (Null for SuperAdmin).
    /// Admin's parent is SuperAdmin; Reseller's parent is Admin; User's parent is Reseller/Admin.
    /// </summary>
    public int? ParentUserId { get; set; }

    [ForeignKey(nameof(ParentUserId))]
    public AppUser? ParentUser { get; set; }

    public ICollection<AppUser> Subordinates { get; set; } = new List<AppUser>();

    public bool IsActive { get; set; } = true;

    [MaxLength(150)]
    public string? CompanyName { get; set; }

    [MaxLength(50)]
    public string? DltEntityId { get; set; }

    public List<string> Documents { get; set; } = new List<string>();

    // Service Balances / Credits
    public decimal VoiceCredits { get; set; } = 0;
    public decimal WhatsAppCredits { get; set; } = 0;
    public decimal RcsCredits { get; set; } = 0; // RCS Transactional
    public decimal RcsPromotionalCredits { get; set; } = 0; // RCS Promotional
    public decimal SmsCredits { get; set; } = 0;
    public decimal BulkSmsPromotionalCredits { get; set; } = 0;
    public decimal WhatsAppPromotionalCredits { get; set; } = 0;

    /// <summary>
    /// Allowed Telecom Services (e.g. "RCS-T", "RCS-P", "BULKSMS-T", "BULKSMS-P", "WHATSAPP-T", "WHATSAPP-P")
    /// </summary>
    public List<string> AllowedServices { get; set; } = new List<string> { "RCS-T", "RCS-P" };

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserMenuPermission> Permissions { get; set; } = new List<UserMenuPermission>();
}
