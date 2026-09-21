using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using LeadsManagement.Api.Models.Enums;

namespace LeadsManagement.Api.Models.Dtos;

public class CreateUserDto
{
    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [MaxLength(150)]
    public string? CompanyName { get; set; }

    [MaxLength(50)]
    public string? DltEntityId { get; set; }

    public List<string>? Documents { get; set; }

    /// <summary>
    /// Role to assign: Admin (2), Reseller (3), User (4).
    /// Enforced: Admin can create Reseller/User; Reseller can only create User.
    /// </summary>
    [Required]
    public UserRole Role { get; set; }

    /// <summary>
    /// Initial menu IDs selected in Checkbox UI
    /// </summary>
    public List<int>? InitialMenuIds { get; set; }

    /// <summary>
    /// Allowed Telecom Services (e.g. "RCS-T", "RCS-P", "BULKSMS-T", "BULKSMS-P", "WHATSAPP-T", "WHATSAPP-P")
    /// </summary>
    public List<string>? AllowedServices { get; set; }
}

public class RoleOptionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class ServicePlatformDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}

public class ServiceRouteDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class ServiceDefinitionsResponseDto
{
    public List<ServicePlatformDto> Platforms { get; set; } = new();
    public List<ServiceRouteDto> Routes { get; set; } = new();
}

public class UpdateUserDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [MaxLength(150)]
    public string? CompanyName { get; set; }

    [MaxLength(50)]
    public string? DltEntityId { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    public UserRole? Role { get; set; }

    public bool? IsActive { get; set; }

    public List<string>? AllowedServices { get; set; }

    public List<string>? Documents { get; set; }
}

public class UserStatusUpdateDto
{
    public bool IsActive { get; set; }
}

public class UserCreditsUpdateDto
{
    public decimal? VoiceCredits { get; set; }
    public decimal? WhatsAppCredits { get; set; }
    public decimal? WhatsAppPromotionalCredits { get; set; }
    public decimal? RcsCredits { get; set; }
    public decimal? RcsPromotionalCredits { get; set; }
    public decimal? SmsCredits { get; set; }
    public decimal? BulkSmsPromotionalCredits { get; set; }
}

public class UserResponseDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? DltEntityId { get; set; }
    public List<string> Documents { get; set; } = new List<string>();
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; }
    public string RoleName => Role.ToString();
    public int? ParentUserId { get; set; }
    public string? ParentUserName { get; set; }
    public bool IsActive { get; set; }
    public decimal VoiceCredits { get; set; }
    public decimal WhatsAppCredits { get; set; }
    public decimal WhatsAppPromotionalCredits { get; set; }
    public decimal RcsCredits { get; set; } // RCS Transactional
    public decimal RcsPromotionalCredits { get; set; } // RCS Promotional
    public decimal SmsCredits { get; set; } // DLT SMS Transactional
    public decimal BulkSmsPromotionalCredits { get; set; } // DLT SMS Promotional
    public List<string> AllowedServices { get; set; } = new List<string>();
    public int AllowedMenusCount { get; set; }
    public int SubordinatesCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

