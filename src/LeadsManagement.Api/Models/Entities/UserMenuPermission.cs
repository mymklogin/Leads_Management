using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LeadsManagement.Api.Models.Entities;

[Table("UserMenuPermissions")]
public class UserMenuPermission
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public AppUser? User { get; set; }

    [Required]
    public int MenuId { get; set; }

    [ForeignKey(nameof(MenuId))]
    public AppMenu? Menu { get; set; }

    public bool CanView { get; set; } = true;
    public bool CanCreate { get; set; } = false;
    public bool CanEdit { get; set; } = false;
    public bool CanDelete { get; set; } = false;
    public bool CanExport { get; set; } = false;

    public int? AssignedByUserId { get; set; }

    [ForeignKey(nameof(AssignedByUserId))]
    public AppUser? AssignedByUser { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}
