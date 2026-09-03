using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly IWebhookLogRepository _webhookLogRepository;

    public AnalyticsController(IAnalyticsService analyticsService, IWebhookLogRepository webhookLogRepository)
    {
        _analyticsService = analyticsService;
        _webhookLogRepository = webhookLogRepository;
    }

    /// <summary>
    /// Get real-time dashboard analytics with conversion funnel, status breakdown, and duration metrics
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var stats = await _analyticsService.GetDashboardAnalyticsAsync(cancellationToken);
        return Ok(stats);
    }

    /// <summary>
    /// Get audit logs of incoming ExpressIVR webhooks
    /// </summary>
    [HttpGet("webhook-logs")]
    public async Task<IActionResult> GetWebhookLogs(
        [FromQuery] string? mobile,
        [FromQuery] int? templateId,
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        int count = Math.Clamp(limit, 1, 200);
        var logs = await _webhookLogRepository.GetRecentLogsAsync(count, cancellationToken);
        var query = logs.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(mobile))
        {
            query = query.Where(x => x.Mobile != null && x.Mobile.Contains(mobile.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        if (templateId.HasValue)
        {
            query = query.Where(x => x.TemplateId == templateId.Value);
        }

        return Ok(query.ToList());
    }
}
