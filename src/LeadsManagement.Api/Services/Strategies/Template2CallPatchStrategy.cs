using System;
using System.Threading;
using System.Threading.Tasks;

using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Strategies;

public class Template2CallPatchStrategy : ITemplateWebhookStrategy
{
    public int TemplateId => 2;

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

        string leadStatus;

        switch (eventType)
        {
            case "CONNECTED_CALLS":
                leadStatus = "Call Patch Campaign Connected";
                break;

            case "DTMF":
                if (pressedKey == "1")
                {
                    leadStatus = "Agent Connection Requested - Pressed 1";
                }
                else if (!string.IsNullOrWhiteSpace(pressedKey))
                {
                    leadStatus = $"Call Patch Interaction - Other Key Pressed ({pressedKey})";
                }
                else
                {
                    leadStatus = "DTMF Event - No Key Captured";
                }
                break;

            case "HANGUP":
                if (pressedKey == "1" && duration > 60)
                {
                    leadStatus = "Very Hot Lead - Agent Connection & Long Conversation";
                }
                else if (pressedKey == "1" && duration >= 30)
                {
                    leadStatus = "Hot Lead - Agent Connection & Good Conversation";
                }
                else if (pressedKey == "1")
                {
                    leadStatus = "Interested Lead - Requested Agent Connection";
                }
                else if (duration >= 60)
                {
                    leadStatus = "Hot Lead - Long Conversation Without Agent Request";
                }
                else if (duration >= 30)
                {
                    leadStatus = "Warm Lead - Good Call Engagement";
                }
                else if (duration >= 15)
                {
                    leadStatus = "Cold Lead - Short Call Engagement";
                }
                else if (duration >= 10)
                {
                    leadStatus = "Quick Interaction";
                }
                else if (duration >= 5)
                {
                    leadStatus = "Intro Drop";
                }
                else
                {
                    leadStatus = "Immediate Drop";
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
            EventType = eventType,
            PressedKey = pressedKey,
            EffectivePressedKey = lead.PressedDtmf,
            Duration = duration,
            LeadStatus = leadStatus
        };
    }
}

