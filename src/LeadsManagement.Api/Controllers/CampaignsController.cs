using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampaignsController : ControllerBase
{
    private readonly IExpressIvrClient _ivrClient;
    private readonly ICampaignRepository _campaignRepository;

    public CampaignsController(IExpressIvrClient ivrClient, ICampaignRepository campaignRepository)
    {
        _ivrClient = ivrClient;
        _campaignRepository = campaignRepository;
    }

    /// <summary>
    /// Trigger an OBD Call by only specifying Template ID and Mobile Number.
    /// All PIds, SMS, Webhooks, Menus, TTSRows, etc. are automatically auto-filled based on the Template.
    /// </summary>
    [HttpPost("singlecall")]
    public async Task<IActionResult> InitiateSingleCall(
        [FromBody] SimpleCallRequestDto request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Mobile))
        {
            return BadRequest(new { message = "Mobile number is required." });
        }

        var result = await _ivrClient.SendSingleCallAsync(request, cancellationToken);
        if (result.Success)
        {
            return Ok(result);
        }

        return StatusCode(502, result);
    }

    /// <summary>
    /// Advanced: Initiate OBD call with custom overrides for PIds, CLI, SMS, or Menus
    /// </summary>
    [HttpPost("advanced-singlecall")]
    public async Task<IActionResult> InitiateAdvancedSingleCall(
        [FromBody] AdvancedCallRequestDto request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Mobile))
        {
            return BadRequest(new { message = "Mobile number is required." });
        }

        var result = await _ivrClient.SendAdvancedSingleCallAsync(request, cancellationToken);
        if (result.Success)
        {
            return Ok(result);
        }

        return StatusCode(502, result);
    }

    /// <summary>
    /// Initiate bulk OBD calls for multiple mobile numbers using a specific Template ID
    /// </summary>
    [HttpPost("bulk-call")]
    public async Task<IActionResult> InitiateBulkCall(
        [FromBody] BulkCallRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Mobiles == null || request.Mobiles.Count == 0)
        {
            return BadRequest(new { message = "At least one mobile number is required." });
        }

        var results = new List<SingleCallResponseDto>();

        foreach (var mobile in request.Mobiles)
        {
            if (string.IsNullOrWhiteSpace(mobile)) continue;

            var singleRequest = new SimpleCallRequestDto
            {
                TemplateId = request.TemplateId,
                Mobile = mobile.Trim()
            };

            var res = await _ivrClient.SendSingleCallAsync(singleRequest, cancellationToken);
            results.Add(res);
        }

        return Ok(new
        {
            totalRequested = request.Mobiles.Count,
            successful = results.Count(x => x.Success),
            failed = results.Count(x => !x.Success),
            details = results
        });
    }

    /// <summary>
    /// Get all 9 pre-configured template JSON definitions (Templates 0, 1, 2, 3, 4, 5, 7, 8, 9)
    /// </summary>
    [HttpGet("templates")]
    public IActionResult GetTemplates([FromQuery] string? webhookBaseUrl)
    {
        var templates = _ivrClient.GetAllTemplateDefinitions(webhookBaseUrl);
        return Ok(templates);
    }

    /// <summary>
    /// Get specific template JSON definition by Template ID (0, 1, 2, 3, 4, 5, 7, 8, 9)
    /// </summary>
    [HttpGet("templates/{templateId:int}")]
    public IActionResult GetTemplateById(int templateId, [FromQuery] string? webhookBaseUrl)
    {
        var template = _ivrClient.GetTemplateDefinition(templateId, webhookBaseUrl);
        if (template == null)
        {
            return NotFound(new { message = $"Template ID {templateId} not found. Available templates: 0, 1, 2, 3, 4, 5, 7, 8, 9" });
        }
        return Ok(template);
    }

    /// <summary>
    /// Get recent OBD campaign dispatch logs
    /// </summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetCampaignHistory(
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        int count = Math.Clamp(limit, 1, 200);
        var logs = await _campaignRepository.GetCampaignsAsync(count, cancellationToken);
        return Ok(logs);
    }
}
