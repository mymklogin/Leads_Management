using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenusController : ControllerBase
{
    private readonly IMenuService _menuService;

    public MenusController(IMenuService menuService)
    {
        _menuService = menuService;
    }

    /// <summary>
    /// Returns the 100% Dynamic Sidebar Menu Tree allowed for the currently logged-in user.
    /// Frontend uses this endpoint to render only the allowed services (Voice, WhatsApp, RCS, SMS, Leads, etc.).
    /// </summary>
    [HttpGet("my-menus")]
    public async Task<IActionResult> GetMyMenus(CancellationToken cancellationToken)
    {
        int userId = GetCurrentUserId();
        var menus = await _menuService.GetMyMenusAsync(userId, cancellationToken);
        return Ok(menus);
    }

    /// <summary>
    /// Checkbox Matrix API: Returns the list of menus available to the parent user,
    /// with isAssigned = true/false indicating current permissions of the target subordinate user.
    /// </summary>
    [HttpGet("assignable-menus")]
    public async Task<IActionResult> GetAssignableMenus([FromQuery] int targetUserId, CancellationToken cancellationToken)
    {
        int currentUserId = GetCurrentUserId();
        var menus = await _menuService.GetAssignableMenusAsync(currentUserId, targetUserId, cancellationToken);
        return Ok(menus);
    }

    /// <summary>
    /// Save Checkbox Matrix: Grants/Revokes menu permissions for a subordinate user.
    /// Automatically cascades revocation to all downline users if any menu is unchecked!
    /// </summary>
    [HttpPost("assign-permissions")]
    public async Task<IActionResult> AssignPermissions(
        [FromBody] AssignMenuPermissionsDto dto,
        CancellationToken cancellationToken)
    {
        int currentUserId = GetCurrentUserId();

        try
        {
            bool success = await _menuService.AssignPermissionsAsync(currentUserId, dto, cancellationToken);
            return Ok(new
            {
                success = true,
                message = "Permissions updated successfully with automatic downline cascading synchronization."
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// SuperAdmin: Get all master dynamic menus in the system
    /// </summary>
    [HttpGet("all")]
    public async Task<IActionResult> GetAllMasterMenus(CancellationToken cancellationToken)
    {
        var menus = await _menuService.GetAllMasterMenusAsync(cancellationToken);
        return Ok(menus);
    }

    /// <summary>
    /// SuperAdmin: Create a new service or master menu
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateMasterMenu([FromBody] CreateMenuDto dto, CancellationToken cancellationToken)
    {
        var menu = await _menuService.CreateMasterMenuAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetAllMasterMenus), new { id = menu.Id }, menu);
    }

    /// <summary>
    /// SuperAdmin: Update master menu details
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateMasterMenu(int id, [FromBody] UpdateMenuDto dto, CancellationToken cancellationToken)
    {
        var menu = await _menuService.UpdateMasterMenuAsync(id, dto, cancellationToken);
        if (menu == null) return NotFound(new { message = $"Menu with ID {id} not found." });
        return Ok(menu);
    }

    /// <summary>
    /// SuperAdmin: Delete a master menu
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteMasterMenu(int id, CancellationToken cancellationToken)
    {
        bool deleted = await _menuService.DeleteMasterMenuAsync(id, cancellationToken);
        if (!deleted) return NotFound(new { message = $"Menu with ID {id} not found." });
        return NoContent();
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out int id)) return id;

        if (Request.Headers.TryGetValue("X-User-Id", out var headerId) && int.TryParse(headerId, out int hId))
        {
            return hId;
        }

        return 1; // Default to SuperAdmin
    }
}
