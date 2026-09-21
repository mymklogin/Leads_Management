using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LeadsManagement.Api.Models.Dtos;

public class DynamicMenuTreeNodeDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string MenuKey { get; set; } = string.Empty;
    public string RoutePath { get; set; } = string.Empty;
    public string Icon { get; set; } = "Layers";
    public int SortOrder { get; set; } = 1;
    public bool IsActive { get; set; } = true;
    public string? ParentId { get; set; }
    public string? BadgeText { get; set; }
    public string? BadgeColor { get; set; }
    public List<DynamicMenuTreeNodeDto> SubMenus { get; set; } = new();
}

public class CreateDynamicMenuDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string MenuKey { get; set; } = string.Empty;

    public string RoutePath { get; set; } = string.Empty;
    public string Icon { get; set; } = "Layers";
    public string? ParentId { get; set; }
    public int SortOrder { get; set; } = 1;
    public bool IsActive { get; set; } = true;
    public string? BadgeText { get; set; }
    public string? BadgeColor { get; set; }
}

public class UpdateDynamicMenuDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string MenuKey { get; set; } = string.Empty;

    public string RoutePath { get; set; } = string.Empty;
    public string Icon { get; set; } = "Layers";
    public string? ParentId { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public string? BadgeText { get; set; }
    public string? BadgeColor { get; set; }
}

public class SaveMenuTreeRequestDto
{
    [Required]
    public List<DynamicMenuTreeNodeDto> Menus { get; set; } = new();
}
