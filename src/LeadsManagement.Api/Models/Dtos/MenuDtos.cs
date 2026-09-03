using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LeadsManagement.Api.Models.Dtos;

public class AppMenuDto
{
    public int Id { get; set; }
    public string ServiceCode { get; set; } = string.Empty;
    public string MenuKey { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string RoutePath { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int? ParentMenuId { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class MenuTreeNodeDto
{
    public int Id { get; set; }
    public string ServiceCode { get; set; } = string.Empty;
    public string MenuKey { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string RoutePath { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int SortOrder { get; set; }

    // Granular permissions
    public bool CanView { get; set; } = true;
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanExport { get; set; }

    public List<MenuTreeNodeDto> SubMenus { get; set; } = new();
}

/// <summary>
/// Used to populate the Checkbox Matrix UI for granting/revoking permissions
/// </summary>
public class AssignableMenuDto
{
    public int MenuId { get; set; }
    public string ServiceCode { get; set; } = string.Empty;
    public string MenuKey { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string RoutePath { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int? ParentMenuId { get; set; }
    public string? ParentMenuTitle { get; set; }

    // Checkbox status for the target subordinate user
    public bool IsAssigned { get; set; }
    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanExport { get; set; }
}

/// <summary>
/// Payload submitted when saving the Checkbox Matrix Modal
/// </summary>
public class AssignMenuPermissionsDto
{
    [Required]
    public int TargetUserId { get; set; }

    [Required]
    public List<MenuPermissionItemDto> Permissions { get; set; } = new();
}

public class MenuPermissionItemDto
{
    [Required]
    public int MenuId { get; set; }

    public bool CanView { get; set; } = true;
    public bool CanCreate { get; set; } = false;
    public bool CanEdit { get; set; } = false;
    public bool CanDelete { get; set; } = false;
    public bool CanExport { get; set; } = false;
}

public class CreateMenuDto
{
    [Required]
    public string ServiceCode { get; set; } = string.Empty;

    [Required]
    public string MenuKey { get; set; } = string.Empty;

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string RoutePath { get; set; } = string.Empty;

    public string? Icon { get; set; }
    public int? ParentMenuId { get; set; }
    public int SortOrder { get; set; } = 0;
}

public class UpdateMenuDto
{
    [Required]
    public string ServiceCode { get; set; } = string.Empty;

    public string? MenuKey { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string RoutePath { get; set; } = string.Empty;

    public string? Icon { get; set; }
    public int? ParentMenuId { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
