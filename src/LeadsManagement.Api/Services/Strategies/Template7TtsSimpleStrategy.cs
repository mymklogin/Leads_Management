using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Caching.Memory;
using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Strategies;

public class Template7TtsSimpleStrategy : ITemplateWebhookStrategy
{
    private readonly IMemoryCache _cache;

    public int TemplateId => 7;

    public Template7TtsSimpleStrategy(IMemoryCache cache)
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

        string cacheKey = $"TTS_SIMPLE_DTMF_{payload.Mobile}";

        if (eventType == "CONNECTED_CALLS")
        {
            return new WebhookResultDto
            {
                Status = "success",
                TemplateId = TemplateId,
                EventType = eventType,
                PressedKey = pressedKey,
                Duration = duration,
                Message = "TTS Simple IVR call connected."
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
                Message = "TTS DTMF temporarily stored."
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

        string leadStatus;
        if (temporaryDtmf == "1" && duration >= 60)
        {
            leadStatus = "Very Hot Lead - TTS Target Key 1 + Deep Engagement";
        }
        else if (temporaryDtmf == "1" && duration >= 30)
        {
            leadStatus = "Hot Lead - TTS Target Key 1 + Good Engagement";
        }
        else if (temporaryDtmf == "1")
        {
            leadStatus = "Interested Lead - TTS Target Key 1 Pressed";
        }
        else if (!string.IsNullOrWhiteSpace(temporaryDtmf) && duration >= 60)
        {
            leadStatus = $"Hot Lead - Long TTS Engagement - Key {temporaryDtmf}";
        }
        else if (!string.IsNullOrWhiteSpace(temporaryDtmf) && duration >= 30)
        {
            leadStatus = $"Warm Lead - TTS Engagement - Key {temporaryDtmf}";
        }
        else if (duration >= 60)
        {
            leadStatus = "Hot Lead - Long TTS Engagement";
        }
        else if (duration >= 30)
        {
            leadStatus = "Warm Lead - Good TTS Engagement";
        }
        else if (duration >= 15)
        {
            leadStatus = "Cold Lead - Short TTS Engagement";
        }
        else if (duration >= 10)
        {
            leadStatus = "Quick TTS Interaction";
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
            Message = "HANGUP received. Final TTS lead data saved."
        };
    }
}
