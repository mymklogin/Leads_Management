using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Caching.Memory;
using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Strategies;

public class Template4NextarStrategy : ITemplateWebhookStrategy
{
    private readonly IMemoryCache _cache;

    public int TemplateId => 4;

    public Template4NextarStrategy(IMemoryCache cache)
    {
        _cache = cache;
    }

    public async Task<WebhookResultDto> ProcessWebhookAsync(
        ExpressIvrWebhookDto payload,
        ILeadRepository leadRepository,
        CancellationToken cancellationToken)
    {
        string eventType = payload.EventType?.Trim().ToUpperInvariant() ?? string.Empty;
        string pressedKey = payload.PressedKey?.Trim() ?? string.Empty;
        int duration = Math.Max(0, payload.Duration);

        if (string.IsNullOrWhiteSpace(eventType))
        {
            throw new ArgumentException("Event type is required.");
        }

        if (string.IsNullOrWhiteSpace(payload.Mobile))
        {
            throw new ArgumentException("Mobile number is required.");
        }

        string cacheKey = $"IVR_DTMF_{payload.Mobile}";

        if (eventType == "CONNECTED_CALLS")
        {
            return new WebhookResultDto
            {
                Status = "success",
                TemplateId = TemplateId,
                EventType = eventType,
                PressedKey = pressedKey,
                Duration = duration,
                Message = "Call connected."
            };
        }

        if (eventType == "DTMF")
        {
            if (!string.IsNullOrWhiteSpace(pressedKey))
            {
                _cache.Set(cacheKey, pressedKey, TimeSpan.FromMinutes(30));
            }

            return new WebhookResultDto
            {
                Status = "success",
                TemplateId = TemplateId,
                EventType = eventType,
                PressedKey = pressedKey,
                Duration = duration,
                Message = "DTMF received and temporarily stored."
            };
        }

        if (eventType != "HANGUP")
        {
            throw new NotSupportedException($"Unsupported event type: {payload.EventType}");
        }

        // HANGUP
        string? temporaryDtmf;
        if (!string.IsNullOrWhiteSpace(pressedKey))
        {
            temporaryDtmf = pressedKey;
        }
        else
        {
            _cache.TryGetValue(cacheKey, out temporaryDtmf);
        }

        temporaryDtmf = temporaryDtmf?.Trim() ?? string.Empty;

        bool highIntentKey = temporaryDtmf is "1" or "2" or "3" or "4";
        string leadStatus;

        if (highIntentKey && duration >= 60)
        {
            leadStatus = $"Very Hot Lead - High Intent Key {temporaryDtmf} + Deep Engagement";
        }
        else if (highIntentKey && duration >= 30)
        {
            leadStatus = $"Hot Lead - High Intent Key {temporaryDtmf} + Good Engagement";
        }
        else if (highIntentKey)
        {
            leadStatus = $"Interested Lead - High Intent Key {temporaryDtmf}";
        }
        else if (!string.IsNullOrWhiteSpace(temporaryDtmf) && duration >= 60)
        {
            leadStatus = $"Hot Lead - Deep IVR Engagement - Key {temporaryDtmf}";
        }
        else if (!string.IsNullOrWhiteSpace(temporaryDtmf) && duration >= 30)
        {
            leadStatus = $"Warm Lead - IVR Exploration - Key {temporaryDtmf}";
        }
        else if (duration >= 60)
        {
            leadStatus = "Hot Lead - Long IVR Engagement";
        }
        else if (duration >= 30)
        {
            leadStatus = "Warm Lead - Good IVR Engagement";
        }
        else if (duration >= 15)
        {
            leadStatus = "Cold Lead - Short IVR Interaction";
        }
        else if (duration >= 10)
        {
            leadStatus = "Quick IVR Interaction";
        }
        else if (duration >= 5)
        {
            leadStatus = "Intro Drop";
        }
        else
        {
            leadStatus = "Immediate Drop";
        }

        var lead = await leadRepository.GetLeadByMobileAsync(payload.Mobile, cancellationToken);

        if (lead == null)
        {
            lead = new LeadRecord
            {
                Mobile = payload.Mobile!,
                TemplateId = TemplateId,
                LeadStatus = leadStatus,
                CallDuration = duration,
                PressedDtmf = string.IsNullOrWhiteSpace(temporaryDtmf) ? null : temporaryDtmf,
                LastEventType = "HANGUP",
                Cli = payload.Cli,
                UserId = payload.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            
        }
        else
        {
            lead.TemplateId = TemplateId;
            lead.LeadStatus = leadStatus;
            lead.CallDuration = duration;
            lead.LastEventType = "HANGUP";
            lead.UpdatedAt = DateTime.UtcNow;
            lead.PressedDtmf = string.IsNullOrWhiteSpace(temporaryDtmf) ? null : temporaryDtmf;

            if (!string.IsNullOrWhiteSpace(payload.Cli))
            {
                lead.Cli = payload.Cli;
            }
        }

        await leadRepository.CreateOrUpdateLeadAsync(lead, cancellationToken);

        _cache.Remove(cacheKey);

        return new WebhookResultDto
        {
            Status = "success",
            TemplateId = TemplateId,
            EventType = eventType,
            PressedKey = pressedKey,
            EffectivePressedKey = temporaryDtmf,
            Duration = duration,
            LeadStatus = leadStatus,
            Message = "HANGUP received. Final lead data saved."
        };
    }
}
