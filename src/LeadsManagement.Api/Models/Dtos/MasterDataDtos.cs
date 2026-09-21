using System;
using System.Collections.Generic;

namespace LeadsManagement.Api.Models.Dtos;

public class SystemRoleDto
{
    public int Id { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string RoleCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; } = false;
    public List<string> Permissions { get; set; } = new();
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
}

public class TemplateTypeMasterDto
{
    public int Id { get; set; }
    public string TypeCode { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string ChannelType { get; set; } = "RCS"; // RCS, SMS, WHATSAPP, VOICE
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
}
