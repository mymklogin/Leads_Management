using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LeadsManagement.Api.Models.Entities;

[Table("AppMenus")]
public class AppMenu
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    /// <summary>
    /// Service category: VOICE, WHATSAPP, RCS, SMS, LEADS_CRM, USER_MANAGEMENT, REPORTS, WALLET
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string ServiceCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string MenuKey { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string RoutePath { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Icon { get; set; }

    public int? ParentMenuId { get; set; }

    [ForeignKey(nameof(ParentMenuId))]
    public AppMenu? ParentMenu { get; set; }

    public ICollection<AppMenu> SubMenus { get; set; } = new List<AppMenu>();

    public int SortOrder { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    public ICollection<UserMenuPermission> UserPermissions { get; set; } = new List<UserMenuPermission>();
}
