using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Enums;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserManagementService _userService;

    public UsersController(IUserManagementService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Get subordinate users under the current logged-in user.
    /// SuperAdmin sees all; Admin sees their Resellers & Users; Reseller sees only their Users.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetSubordinates([FromQuery] UserRole? role, CancellationToken cancellationToken)
    {
        int currentUserId = GetCurrentUserId();
        var users = await _userService.GetSubordinateUsersAsync(currentUserId, role, cancellationToken);
        return Ok(users);
    }

    /// <summary>
    /// Get user details by ID (must be within current user's hierarchy)
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetUserById(int id, CancellationToken cancellationToken)
    {
        int currentUserId = GetCurrentUserId();
        try
        {
            var user = await _userService.GetUserByIdAsync(currentUserId, id, cancellationToken);
            if (user == null) return NotFound(new { message = $"User with ID {id} not found." });
            return Ok(user);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create a subordinate user or reseller.
    /// Admin can create Reseller & User; Reseller can only create User.
    /// Optionally pass initialMenuIds from Checkbox UI.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto, CancellationToken cancellationToken)
    {
        int currentUserId = GetCurrentUserId();

        try
        {
            var user = await _userService.CreateUserAsync(currentUserId, dto, cancellationToken);
            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
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
    /// Update user information (FullName, Email, Phone)
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto, CancellationToken cancellationToken)
    {
        int currentUserId = GetCurrentUserId();
        try
        {
            var user = await _userService.UpdateUserAsync(currentUserId, id, dto, cancellationToken);
            if (user == null) return NotFound(new { message = $"User with ID {id} not found." });
            return Ok(user);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Activate or Deactivate a user account
    /// </summary>
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> ToggleStatus(int id, [FromBody] UserStatusUpdateDto dto, CancellationToken cancellationToken)
    {
        int currentUserId = GetCurrentUserId();
        try
        {
            bool updated = await _userService.ToggleUserStatusAsync(currentUserId, id, dto.IsActive, cancellationToken);
            if (!updated) return NotFound(new { message = $"User with ID {id} not found." });
            return Ok(new { success = true, isActive = dto.IsActive });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update service balances/credits for a user (Voice, WhatsApp, RCS, SMS)
    /// </summary>
    [HttpPut("{id:int}/credits")]
    public async Task<IActionResult> UpdateCredits(int id, [FromBody] UserCreditsUpdateDto dto, CancellationToken cancellationToken)
    {
        int currentUserId = GetCurrentUserId();
        try
        {
            var user = await _userService.UpdateUserCreditsAsync(currentUserId, id, dto, cancellationToken);
            if (user == null) return NotFound(new { message = $"User with ID {id} not found." });
            return Ok(user);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete user account and cascade delete their downline
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUser(int id, CancellationToken cancellationToken)
    {
        int currentUserId = GetCurrentUserId();
        try
        {
            bool deleted = await _userService.DeleteUserAsync(currentUserId, id, cancellationToken);
            if (!deleted) return NotFound(new { message = $"User with ID {id} not found." });
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
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
