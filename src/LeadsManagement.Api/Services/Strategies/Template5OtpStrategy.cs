using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Caching.Memory;
using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Strategies;

public class Template5OtpStrategy : ITemplateWebhookStrategy
{
    private readonly IMemoryCache _cache;

    public int TemplateId => 5;

    public Template5OtpStrategy(IMemoryCache cache)
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

        string cacheKey = $"OTP_DTMF_{payload.Mobile}";

        if (eventType == "CONNECTED_CALLS")
        {
            return new WebhookResultDto
            {
                Status = "success",
                TemplateId = TemplateId,
                EventType = eventType,
                PressedKey = pressedKey,
                Duration = duration,
                Message = "OTP call connected."
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
                Message = "OTP DTMF temporarily stored."
            };
        }

        if (eventType != "HANGUP")
        {
            throw new NotSupportedException($"Unsupported event type: {payload.EventType}");
        }

        // HANGUP
        string? temporaryOtpInput;
        if (!string.IsNullOrWhiteSpace(pressedKey))
        {
            temporaryOtpInput = pressedKey;
        }
        else
        {
            _cache.TryGetValue(cacheKey, out temporaryOtpInput);
        }

        temporaryOtpInput = temporaryOtpInput?.Trim() ?? string.Empty;

        string leadStatus;
        if (string.IsNullOrWhiteSpace(temporaryOtpInput))
        {
            if (duration < 5)
                leadStatus = "OTP Call Dropped Immediately";
            else if (duration < 10)
                leadStatus = "OTP Intro Drop";
            else if (duration < 15)
                leadStatus = "OTP Call - No OTP Input";
            else if (duration < 30)
                leadStatus = "OTP Verification Attempt - No Input";
            else
                leadStatus = "OTP Call Completed - No OTP Input";
        }
        else if (duration < 5)
        {
            leadStatus = $"OTP Input Received - Key {temporaryOtpInput} - Immediate Drop";
        }
        else if (duration < 15)
        {
            leadStatus = $"OTP Verification Attempt - Input {temporaryOtpInput}";
        }
        else if (duration < 30)
        {
            leadStatus = $"OTP Verification In Progress - Input {temporaryOtpInput}";
        }
        else if (duration < 60)
        {
            leadStatus = $"OTP Verification Completed - Input {temporaryOtpInput}";
        }
        else
        {
            leadStatus = $"OTP Verification - Long Engagement - Input {temporaryOtpInput}";
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
                PressedDtmf = string.IsNullOrWhiteSpace(temporaryOtpInput) ? null : temporaryOtpInput,
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
            lead.PressedDtmf = string.IsNullOrWhiteSpace(temporaryOtpInput) ? null : temporaryOtpInput;

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
            EffectivePressedKey = temporaryOtpInput,
            Duration = duration,
            LeadStatus = leadStatus,
            Message = "HANGUP received. Final OTP lead data saved."
        };
    }
}
