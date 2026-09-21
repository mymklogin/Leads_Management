using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MasterDataController : ControllerBase
{
    private readonly IMasterDataService _masterDataService;

    public MasterDataController(IMasterDataService masterDataService)
    {
        _masterDataService = masterDataService;
    }

    // --- System Roles Endpoints ---

    [HttpGet("roles")]
    [AllowAnonymous]
    public IActionResult GetRoles()
    {
        var roles = _masterDataService.GetRoles();
        return Ok(new { success = true, data = roles });
    }

    [HttpPost("roles")]
    [AllowAnonymous]
    public IActionResult SaveRole([FromBody] SystemRoleDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.RoleName))
        {
            return BadRequest(new { success = false, message = "Role Name is required." });
        }

        if (string.IsNullOrWhiteSpace(dto.RoleCode))
        {
            dto.RoleCode = dto.RoleName.Replace(" ", "");
        }

        var saved = _masterDataService.AddOrUpdateRole(dto);
        return Ok(new { success = true, message = "Role saved successfully!", data = saved });
    }

    [HttpDelete("roles/{id}")]
    [AllowAnonymous]
    public IActionResult DeleteRole(int id)
    {
        try
        {
            var success = _masterDataService.DeleteRole(id);
            if (!success)
            {
                return NotFound(new { success = false, message = "Role not found or could not be deleted." });
            }
            return Ok(new { success = true, message = "Role deleted successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // --- Template & Campaign Types Endpoints ---

    [HttpGet("template-types")]
    [AllowAnonymous]
    public IActionResult GetTemplateTypes([FromQuery] string? channel)
    {
        var types = _masterDataService.GetTemplateTypes(channel);
        return Ok(new { success = true, data = types });
    }

    [HttpPost("template-types")]
    [AllowAnonymous]
    public IActionResult SaveTemplateType([FromBody] TemplateTypeMasterDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.DisplayName))
        {
            return BadRequest(new { success = false, message = "Display Name is required." });
        }

        if (string.IsNullOrWhiteSpace(dto.TypeCode))
        {
            dto.TypeCode = dto.DisplayName.Replace(" ", "");
        }

        var saved = _masterDataService.AddOrUpdateTemplateType(dto);
        return Ok(new { success = true, message = "Template type saved successfully!", data = saved });
    }

    [HttpDelete("template-types/{id}")]
    [AllowAnonymous]
    public IActionResult DeleteTemplateType(int id)
    {
        var success = _masterDataService.DeleteTemplateType(id);
        if (!success)
        {
            return NotFound(new { success = false, message = "Template type not found." });
        }
        return Ok(new { success = true, message = "Template type deleted successfully." });
    }
}
