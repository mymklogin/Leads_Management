using System;
using System.Threading;
using System.Threading.Tasks;

using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Strategies;

public class Template0SimpleStrategy : ITemplateWebhookStrategy
{
    public int TemplateId => 0;

    public async Task<WebhookResultDto> ProcessWebhookAsync(
        ExpressIvrWebhookDto payload,
        ILeadRepository leadRepository,
        CancellationToken cancellationToken)
    {
        string eventType = payload.EventType?.Trim().ToUpperInvariant() ?? string.Empty;
        string webhookPressedKey = payload.PressedKey?.Trim() ?? string.Empty;
        int duration = Math.Max(0, payload.Duration);

        if (string.IsNullOrWhiteSpace(eventType))
        {
            throw new ArgumentException("Event type is required.");
        }

        var lead = await leadRepository.GetLeadByMobileAsync(payload.Mobile ?? string.Empty, cancellationToken);

        // Key preservation logic: If hangup doesn't have key but DTMF event captured earlier
        string effectivePressedKey = webhookPressedKey;
        if (string.IsNullOrWhiteSpace(effectivePressedKey) && lead != null && !string.IsNullOrWhiteSpace(lead.PressedDtmf))
        {
            effectivePressedKey = lead.PressedDtmf;
        }

        string leadStatus;

        switch (eventType)
        {
            case "CONNECTED_CALLS":
                leadStatus = "DTMF Call Connected";
                break;

            case "DTMF":
                if (webhookPressedKey == "2")
                    leadStatus = "Not Interested (Pressed 2)";
                else if (webhookPressedKey == "9")
                    leadStatus = "DND / Opt-Out (Pressed 9)";
                else if (!string.IsNullOrWhiteSpace(webhookPressedKey))
                    leadStatus = $"Interactive Lead (Pressed {webhookPressedKey})";
                else
                    leadStatus = "DTMF Event - No Key Captured";
                break;

            case "HANGUP":
                if (effectivePressedKey == "2")
                {
                    leadStatus = "Not Interested (Pressed 2)";
                }
                else if (effectivePressedKey == "9")
                {
                    leadStatus = "DND / Opt-Out (Pressed 9)";
                }
                else
                {
                    string keyDesc = string.IsNullOrWhiteSpace(effectivePressedKey) ? "No Key" : $"Pressed {effectivePressedKey}";

                    if (duration >= 45)
                        leadStatus = $"Super Hot Interaction ({keyDesc} | 45-60+ sec)";
                    else if (duration >= 30)
                        leadStatus = $"Hot Interaction ({keyDesc} | 30-45 sec)";
                    else if (duration >= 15)
                        leadStatus = $"Engaged Interaction ({keyDesc} | 15-30 sec)";
                    else if (duration >= 10)
                        leadStatus = $"Active Interaction ({keyDesc} | 10-15 sec)";
                    else if (duration >= 5)
                        leadStatus = $"Quick Interaction ({keyDesc} | 5-10 sec)";
                    else
                        leadStatus = $"Call Cut / Dropped ({keyDesc} | <5 sec)";
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
                CallDuration = duration,
                PressedDtmf = !string.IsNullOrWhiteSpace(effectivePressedKey) ? effectivePressedKey : null,
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
            lead.LeadStatus = leadStatus;
            lead.LastEventType = eventType;
            lead.UpdatedAt = DateTime.UtcNow;
            lead.CallDuration = Math.Max(lead.CallDuration, duration);

            if (!string.IsNullOrWhiteSpace(effectivePressedKey))
            {
                lead.PressedDtmf = effectivePressedKey;
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
            PressedKey = effectivePressedKey,
            EffectivePressedKey = effectivePressedKey,
            Duration = duration,
            LeadStatus = leadStatus
        };
    }
}

