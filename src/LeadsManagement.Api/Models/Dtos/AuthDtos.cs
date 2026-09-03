using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using LeadsManagement.Api.Models.Enums;

namespace LeadsManagement.Api.Models.Dtos;

public class LoginRequestDto
{
    [Required]
    public string UsernameOrEmail { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserProfileDto User { get; set; } = new();
    public List<MenuTreeNodeDto> AllowedMenus { get; set; } = new();
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; }
    public string RoleName => Role.ToString();
    public int? ParentUserId { get; set; }
    public string? ParentUserName { get; set; }
    public decimal VoiceCredits { get; set; }
    public decimal WhatsAppCredits { get; set; }
    public decimal RcsCredits { get; set; }
    public decimal SmsCredits { get; set; }
}

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}
