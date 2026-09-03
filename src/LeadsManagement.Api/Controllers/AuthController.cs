using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// User Login: Authenticates and returns JWT Token along with User's Allowed Dynamic Sidebar Menus
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username/Email and Password are required." });
        }

        try
        {
            var response = await _authService.LoginAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get current logged-in user profile, role, and service balances
    /// </summary>
    [HttpGet("my-profile")]
    public async Task<IActionResult> GetMyProfile(CancellationToken cancellationToken)
    {
        int userId = GetCurrentUserId();
        if (userId <= 0) return Unauthorized();

        try
        {
            var profile = await _authService.GetMyProfileAsync(userId, cancellationToken);
            return Ok(profile);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "User not found." });
        }
    }

    /// <summary>
    /// Change password for current logged-in user
    /// </summary>
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto, CancellationToken cancellationToken)
    {
        int userId = GetCurrentUserId();
        if (userId <= 0) return Unauthorized();

        try
        {
            await _authService.ChangePasswordAsync(userId, dto, cancellationToken);
            return Ok(new { message = "Password updated successfully." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out int id)) return id;

        // Fallback: If header X-User-Id is passed (for development / API testing)
        if (Request.Headers.TryGetValue("X-User-Id", out var headerId) && int.TryParse(headerId, out int hId))
        {
            return hId;
        }

        return 1; // Default to SuperAdmin for easy testing if no auth header passed
    }
}
