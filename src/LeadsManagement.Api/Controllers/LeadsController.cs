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
public class LeadsController : ControllerBase
{
    private readonly ILeadService _leadService;

    public LeadsController(ILeadService leadService)
    {
        _leadService = leadService;
    }

    /// <summary>
    /// Get paginated and filtered leads list (Automatically scoped to current user's hierarchy)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetLeads([FromQuery] LeadFilterDto filter, CancellationToken cancellationToken)
    {
        int currentUserId = GetCurrentUserId();
        var result = await _leadService.GetLeadsAsync(filter, currentUserId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get lead by database ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetLeadById(int id, CancellationToken cancellationToken)
    {
        var lead = await _leadService.GetLeadByIdAsync(id, cancellationToken);
        if (lead == null) return NotFound(new { message = $"Lead with ID {id} not found." });
        return Ok(lead);
    }

    /// <summary>
    /// Get lead by Mobile number
    /// </summary>
    [HttpGet("mobile/{mobile}")]
    public async Task<IActionResult> GetLeadByMobile(string mobile, CancellationToken cancellationToken)
    {
        var lead = await _leadService.GetLeadByMobileAsync(mobile, cancellationToken);
        if (lead == null) return NotFound(new { message = $"Lead with Mobile {mobile} not found." });
        return Ok(lead);
    }

    /// <summary>
    /// Manually create a new lead
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateLead([FromBody] CreateLeadDto dto, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dto.Mobile))
        {
            return BadRequest(new { message = "Mobile number is required." });
        }

        int currentUserId = GetCurrentUserId();
        var result = await _leadService.CreateLeadAsync(dto, currentUserId, cancellationToken);
        return CreatedAtAction(nameof(GetLeadById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update lead status or disposition notes
    /// </summary>
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateLeadStatus(
        int id,
        [FromBody] UpdateLeadStatusDto dto,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dto.LeadStatus))
        {
            return BadRequest(new { message = "Lead status is required." });
        }

        var result = await _leadService.UpdateLeadStatusAsync(id, dto, cancellationToken);
        if (result == null) return NotFound(new { message = $"Lead with ID {id} not found." });

        return Ok(result);
    }

    /// <summary>
    /// Delete a lead by ID
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteLead(int id, CancellationToken cancellationToken)
    {
        bool deleted = await _leadService.DeleteLeadAsync(id, cancellationToken);
        if (!deleted) return NotFound(new { message = $"Lead with ID {id} not found." });
        return NoContent();
    }

    /// <summary>
    /// Export leads as CSV
    /// </summary>
    [HttpGet("export")]
    public async Task<IActionResult> ExportCsv([FromQuery] LeadFilterDto filter, CancellationToken cancellationToken)
    {
        int currentUserId = GetCurrentUserId();
        byte[] csvBytes = await _leadService.ExportLeadsCsvAsync(filter, currentUserId, cancellationToken);
        return File(csvBytes, "text/csv", $"leads_export_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out int id)) return id;

        if (Request.Headers.TryGetValue("X-User-Id", out var headerId) && int.TryParse(headerId, out int hId))
        {
            return hId;
        }

        return 0; // 0 means unscoped / default
    }
}
