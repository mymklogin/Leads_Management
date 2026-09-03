using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Controllers;

[ApiController]
[Route("api/v1")]
public class WebhookController : ControllerBase
{
    private readonly IWebhookProcessorService _processorService;

    public WebhookController(IWebhookProcessorService processorService)
    {
        _processorService = processorService;
    }

    /// <summary>
    /// Unified ExpressIVR webhook endpoint called on CONNECTED_CALLS, DTMF, and HANGUP.
    /// Handles all templates (0, 1, 2, 3, 4, 5, 7, 8, 9).
    /// </summary>
    [HttpPost("GetRoutingInfo")]
    public async Task<IActionResult> HandleGetRoutingInfo(
        [FromBody] ExpressIvrWebhookDto payload,
        [FromQuery] int? templateId,
        CancellationToken cancellationToken)
    {
        if (payload == null)
        {
            return BadRequest(new
            {
                status = "error",
                message = "Invalid webhook payload."
            });
        }

        if (string.IsNullOrWhiteSpace(payload.EventType))
        {
            return BadRequest(new
            {
                status = "error",
                message = "Event type is required."
            });
        }

        if (string.IsNullOrWhiteSpace(payload.Mobile))
        {
            return BadRequest(new
            {
                status = "error",
                message = "Mobile number is required."
            });
        }

        try
        {
            var result = await _processorService.ProcessWebhookAsync(payload, templateId, cancellationToken);
            return Ok(result);
        }
        catch (NotSupportedException ex)
        {
            return BadRequest(new
            {
                status = "error",
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                status = "error",
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = "error",
                message = $"Internal server error: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Explicit template webhook endpoint: /api/v1/webhook/{templateId}
    /// </summary>
    [HttpPost("webhook/{templateId:int}")]
    public async Task<IActionResult> HandleTemplateWebhook(
        [FromRoute] int templateId,
        [FromBody] ExpressIvrWebhookDto payload,
        CancellationToken cancellationToken)
    {
        return await HandleGetRoutingInfo(payload, templateId, cancellationToken);
    }
}
