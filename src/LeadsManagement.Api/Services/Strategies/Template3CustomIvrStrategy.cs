using System;
using System.Threading;
using System.Threading.Tasks;

using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Strategies;

public class Template3CustomIvrStrategy : ITemplateWebhookStrategy
{
    public int TemplateId => 3;

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
                leadStatus = "Custom IVR Call Connected";
                break;

            case "DTMF":
                if (string.IsNullOrWhiteSpace(pressedKey))
                {
                    leadStatus = "Custom IVR - DTMF Event - No Key Captured";
                }
                else
                {
                    leadStatus = $"Custom IVR - Key {pressedKey} Pressed";
                }
                break;

            case "HANGUP":
                if (!string.IsNullOrWhiteSpace(effectivePressedKey))
                {
                    if (duration >= 60)
                        leadStatus = $"Hot Lead - Custom IVR Deep Engagement - Key {effectivePressedKey}";
                    else if (duration >= 30)
                        leadStatus = $"Warm Lead - Custom IVR Engagement - Key {effectivePressedKey}";
                    else if (duration >= 15)
                        leadStatus = $"Custom IVR Interaction - Key {effectivePressedKey}";
                    else if (duration >= 5)
                        leadStatus = $"Custom IVR Short Interaction - Key {effectivePressedKey}";
                    else
                        leadStatus = $"Custom IVR - Key {effectivePressedKey} - Immediate Drop";
                }
                else if (duration >= 60)
                {
                    leadStatus = "Hot Lead - Custom IVR Deep Engagement";
                }
                else if (duration >= 30)
                {
                    leadStatus = "Warm Lead - Custom IVR Engagement";
                }
                else if (duration >= 15)
                {
                    leadStatus = "Custom IVR - Short Interaction";
                }
                else if (duration >= 5)
                {
                    leadStatus = "Custom IVR - Intro Drop";
                }
                else
                {
                    leadStatus = "Custom IVR - Immediate Drop";
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
                PressedDtmf = !string.IsNullOrWhiteSpace(pressedKey) ? pressedKey : null,
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

            if (eventType == "DTMF" && !string.IsNullOrWhiteSpace(pressedKey))
            {
                lead.PressedDtmf = pressedKey;
            }

            if (eventType == "HANGUP")
            {
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
            IvrId = payload.IvrId ?? 18,
            EventType = eventType,
            PressedKey = pressedKey,
            EffectivePressedKey = effectivePressedKey,
            Duration = duration,
            LeadStatus = leadStatus
        };
    }
}

