using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Implementations;

public class WebhookProcessorService : IWebhookProcessorService
{
    private readonly IWebhookLogRepository _webhookLogRepository;
    private readonly ILeadRepository _leadRepository;
    private readonly Dictionary<int, ITemplateWebhookStrategy> _strategies;
    private readonly ILogger<WebhookProcessorService> _logger;

    public WebhookProcessorService(
        IWebhookLogRepository webhookLogRepository,
        ILeadRepository leadRepository,
        IEnumerable<ITemplateWebhookStrategy> strategies,
        ILogger<WebhookProcessorService> logger)
    {
        _webhookLogRepository = webhookLogRepository;
        _leadRepository = leadRepository;
        _strategies = strategies.ToDictionary(s => s.TemplateId);
        _logger = logger;
    }

    public async Task<WebhookResultDto> ProcessWebhookAsync(
        ExpressIvrWebhookDto payload,
        int? overrideTemplateId = null,
        CancellationToken cancellationToken = default)
    {
        if (payload == null)
        {
            throw new ArgumentNullException(nameof(payload), "Webhook payload cannot be null.");
        }

        if (string.IsNullOrWhiteSpace(payload.Mobile))
        {
            throw new ArgumentException("Mobile number is required.", nameof(payload));
        }

        // Determine effective TemplateId
        int effectiveTemplateId = overrideTemplateId ?? payload.TemplateId ?? 0;

        // If template was not explicitly sent, check existing lead in DB
        if (overrideTemplateId == null && payload.TemplateId == null)
        {
            var existingLead = await _leadRepository.GetLeadByMobileAsync(payload.Mobile, cancellationToken);

            if (existingLead?.TemplateId != null && _strategies.ContainsKey(existingLead.TemplateId.Value))
            {
                effectiveTemplateId = existingLead.TemplateId.Value;
            }
        }

        if (!_strategies.TryGetValue(effectiveTemplateId, out var strategy))
        {
            // Fallback to Template 0 if unknown template ID
            if (!_strategies.TryGetValue(0, out strategy))
            {
                throw new InvalidOperationException($"No strategy registered for template ID {effectiveTemplateId}");
            }
        }

        var webhookLog = new WebhookLog
        {
            Mobile = payload.Mobile,
            TemplateId = strategy.TemplateId,
            EventType = payload.EventType,
            PressedKey = payload.PressedKey,
            Duration = payload.Duration,
            RawPayload = JsonSerializer.Serialize(payload),
            ReceivedAt = DateTime.UtcNow
        };

        try
        {
            var result = await strategy.ProcessWebhookAsync(payload, _leadRepository, cancellationToken);

            webhookLog.ComputedLeadStatus = result.LeadStatus;
            webhookLog.IsSuccess = true;
            await _webhookLogRepository.InsertWebhookLogAsync(webhookLog, cancellationToken);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook for mobile {Mobile}, template {TemplateId}", payload.Mobile, effectiveTemplateId);
            webhookLog.IsSuccess = false;
            webhookLog.ErrorMessage = ex.Message;
            await _webhookLogRepository.InsertWebhookLogAsync(webhookLog, cancellationToken);
            throw;
        }
    }
}
