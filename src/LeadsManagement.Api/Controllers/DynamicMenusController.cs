using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DynamicMenusController : ControllerBase
{
    private readonly IDynamicMenuService _menuService;

    public DynamicMenusController(IDynamicMenuService menuService)
    {
        _menuService = menuService;
    }

    /// <summary>
    /// Returns the full hierarchical Tree of Dynamic Parent Menus and Sub-Menus for the Sidebar.
    /// </summary>
    [HttpGet("tree")]
    public async Task<IActionResult> GetMenuTree()
    {
        var tree = await _menuService.GetMenuTreeAsync();
        return Ok(new
        {
            success = true,
            menus = tree,
            totalCount = tree.Count
        });
    }

    /// <summary>
    /// Returns all dynamic menus as a flat list.
    /// </summary>
    [HttpGet("all")]
    public async Task<IActionResult> GetAllFlat()
    {
        var flat = await _menuService.GetAllMenusFlatAsync();
        return Ok(new
        {
            success = true,
            menus = flat
        });
    }

    /// <summary>
    /// Saves the full modified menu & submenu tree hierarchy from the Visual Menu Builder page.
    /// </summary>
    [HttpPost("save-tree")]
    public async Task<IActionResult> SaveMenuTree([FromBody] SaveMenuTreeRequestDto req)
    {
        if (req?.Menus == null || req.Menus.Count == 0)
        {
            return BadRequest(new { success = false, message = "Menu tree cannot be empty." });
        }

        try
        {
            await _menuService.SaveMenuTreeAsync(req.Menus);
            return Ok(new
            {
                success = true,
                message = "Dynamic Menu & Submenu hierarchy saved successfully!",
                menus = await _menuService.GetMenuTreeAsync()
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Adds a new parent menu or child submenu.
    /// </summary>
    [HttpPost("menu")]
    public async Task<IActionResult> AddMenu([FromBody] CreateDynamicMenuDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.MenuKey))
        {
            return BadRequest(new { success = false, message = "Title and MenuKey are required." });
        }

        try
        {
            var created = await _menuService.AddMenuAsync(dto);
            return Ok(new
            {
                success = true,
                message = $"Menu '{created.Title}' created successfully!",
                menu = created
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Updates an existing menu or submenu.
    /// </summary>
    [HttpPut("menu/{id}")]
    public async Task<IActionResult> UpdateMenu(string id, [FromBody] UpdateDynamicMenuDto dto)
    {
        try
        {
            var updated = await _menuService.UpdateMenuAsync(id, dto);
            if (updated == null)
            {
                return NotFound(new { success = false, message = $"Menu with ID '{id}' not found." });
            }

            return Ok(new
            {
                success = true,
                message = $"Menu '{updated.Title}' updated successfully!",
                menu = updated
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Deletes a menu or submenu.
    /// </summary>
    [HttpDelete("menu/{id}")]
    public async Task<IActionResult> DeleteMenu(string id)
    {
        try
        {
            bool deleted = await _menuService.DeleteMenuAsync(id);
            if (!deleted)
            {
                return NotFound(new { success = false, message = $"Menu with ID '{id}' not found." });
            }

            return Ok(new
            {
                success = true,
                message = "Menu deleted successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Resets menus to standard telecom defaults.
    /// </summary>
    [HttpPost("reset-defaults")]
    public async Task<IActionResult> ResetDefaults()
    {
        var defaults = await _menuService.ResetToDefaultsAsync();
        return Ok(new
        {
            success = true,
            message = "Menus restored to telecom operator standard defaults.",
            menus = defaults
        });
    }
}
