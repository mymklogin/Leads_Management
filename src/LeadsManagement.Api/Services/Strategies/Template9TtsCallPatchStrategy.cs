using System;
using System.Threading;
using System.Threading.Tasks;

using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Strategies;

public class Template9TtsCallPatchStrategy : ITemplateWebhookStrategy
{
    public int TemplateId => 9;

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

        var lead = await leadRepository.GetLeadByMobileAsync(payload.Mobile ?? string.Empty, cancellationToken);

        string effectivePressedKey = pressedKey;
        if (eventType == "HANGUP" &&
            string.IsNullOrWhiteSpace(effectivePressedKey) &&
            lead != null &&
            !string.IsNullOrWhiteSpace(lead.PressedDtmf))
        {
            effectivePressedKey = lead.PressedDtmf.Trim();
        }

        string leadStatus;

        switch (eventType)
        {
            case "CONNECTED_CALLS":
                leadStatus = "TTS Call Patch Connected";
                break;

            case "DTMF":
                if (pressedKey == "1")
                {
                    leadStatus = "Agent Connection Requested - TTS Pressed 1";
                }
                else if (!string.IsNullOrWhiteSpace(pressedKey))
                {
                    leadStatus = $"TTS Call Patch Interaction - Key {pressedKey}";
                }
                else
                {
                    leadStatus = "TTS Call Patch DTMF - No Key Captured";
                }
                break;

            case "HANGUP":
                if (effectivePressedKey == "1" && duration >= 60)
                {
                    leadStatus = "Very Hot Lead - TTS Agent Connection + Long Engagement";
                }
                else if (effectivePressedKey == "1" && duration >= 30)
                {
                    leadStatus = "Hot Lead - TTS Agent Connection + Good Engagement";
                }
                else if (effectivePressedKey == "1")
                {
                    leadStatus = "Interested Lead - TTS Agent Connection Requested";
                }
                else if (duration >= 60)
                {
                    leadStatus = "Hot Lead - Long TTS Call Patch Engagement";
                }
                else if (duration >= 30)
                {
                    leadStatus = "Warm Lead - Good TTS Call Patch Engagement";
                }
                else if (duration >= 15)
                {
                    leadStatus = "Cold Lead - Short TTS Call Patch Interaction";
                }
                else if (duration >= 10)
                {
                    leadStatus = "Quick TTS Call Patch Interaction";
                }
                else if (duration >= 5)
                {
                    leadStatus = "TTS Call Patch Intro Drop";
                }
                else
                {
                    leadStatus = "TTS Call Patch Immediate Drop";
                }
                break;

            default:
                throw new NotSupportedException($"Unsupported event type: {payload.EventType}");
        }

        if (lead == null)
        {
            lead = new LeadRecord
            {
                Mobile = payload.Mobile!,
                TemplateId = TemplateId,
                LeadStatus = leadStatus,
                CallDuration = eventType == "HANGUP" ? duration : 0,
                PressedDtmf = eventType == "DTMF" && !string.IsNullOrWhiteSpace(pressedKey) ? pressedKey : null,
                LastEventType = eventType,
                Cli = payload.Cli,
                UserId = payload.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            
        }
        else
        {
            lead.TemplateId = TemplateId;
            lead.UpdatedAt = DateTime.UtcNow;

            if (eventType == "CONNECTED_CALLS")
            {
                lead.LeadStatus = leadStatus;
                lead.LastEventType = eventType;
            }

            if (eventType == "DTMF")
            {
                lead.LeadStatus = leadStatus;
                lead.LastEventType = eventType;
                if (!string.IsNullOrWhiteSpace(pressedKey))
                {
                    lead.PressedDtmf = pressedKey;
                }
            }

            if (eventType == "HANGUP")
            {
                lead.LeadStatus = leadStatus;
                lead.LastEventType = eventType;
                lead.CallDuration = duration;
                if (!string.IsNullOrWhiteSpace(pressedKey))
                {
                    lead.PressedDtmf = pressedKey;
                }
            }

            if (!string.IsNullOrWhiteSpace(payload.Cli))
            {
                lead.Cli = payload.Cli;
            }
        }

        await leadRepository.CreateOrUpdateLeadAsync(lead, cancellationToken);

        return new WebhookResultDto
        {
            Status = "success",
            TemplateId = TemplateId,
            EventType = eventType,
            PressedKey = pressedKey,
            EffectivePressedKey = effectivePressedKey,
            Duration = duration,
            LeadStatus = leadStatus
        };
    }
}

