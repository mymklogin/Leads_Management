using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LeadsManagement.Api.Models.Dtos;

/// <summary>
/// Simple call request: only requires TemplateId and Mobile number.
/// All other template configurations (PIds, SMS, Webhooks, Menus, TTSRows, etc.) are auto-filled by the system.
/// </summary>
public class SimpleCallRequestDto
{
    /// <summary>
    /// Template ID (0: Simple, 1: DTMF, 2: Call Patch, 3: Custom IVR, 4: Nextar, 5: OTP, 7: TTS Simple, 8: TTS DTMF, 9: TTS Patch)
    /// </summary>
    [Required]
    public int TemplateId { get; set; } = 0;

    /// <summary>
    /// Target mobile number (e.g. 8571844348 or 9065968937_Rohit,1232)
    /// </summary>
    [Required]
    public string Mobile { get; set; } = string.Empty;

    /// <summary>
    /// Optional customer name
    /// </summary>
    public string? CustomerName { get; set; }
}

public class AdvancedCallRequestDto
{
    [Required]
    public int TemplateId { get; set; }
    [Required]
    public string Mobile { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public string? Cli { get; set; }
    public int? UserId { get; set; }
    public string? Dtmf { get; set; }
    public int? WelcomePId { get; set; }
    public int? MenuPId { get; set; }
    public int? ThanksPId { get; set; }
    public int? WrongInputPId { get; set; }
    public int? NoInputPId { get; set; }
    public int? RePrompt { get; set; }
    public int? MenuWaitTime { get; set; }
    public string? Otp { get; set; }
    public string? AgentRows { get; set; }
    public int? IvrId { get; set; }
    public string? Menus { get; set; }
    public string? TtsRows { get; set; }
    public string? Gender { get; set; }
    public string? Language { get; set; }
    public string? WebhookBaseUrl { get; set; }
}

public class BulkCallRequest
{
    [Required]
    public int TemplateId { get; set; }
    [Required]
    public List<string> Mobiles { get; set; } = new();
    public string? Cli { get; set; }
    public int? UserId { get; set; }
    public string? WebhookBaseUrl { get; set; }
}

public class ExpressIvrSingleCallPayload
{
    [JsonPropertyName("userId")]
    public int UserId { get; set; }

    [JsonPropertyName("templateId")]
    public int TemplateId { get; set; }

    [JsonPropertyName("dtmf")]
    public string Dtmf { get; set; } = string.Empty;

    [JsonPropertyName("cli")]
    public string Cli { get; set; } = string.Empty;

    [JsonPropertyName("mobile")]
    public string Mobile { get; set; } = string.Empty;

    [JsonPropertyName("welcomePId")]
    public int WelcomePId { get; set; }

    [JsonPropertyName("menuPId")]
    public int MenuPId { get; set; }

    [JsonPropertyName("thanksPId")]
    public int ThanksPId { get; set; }

    [JsonPropertyName("wrongInputPId")]
    public int WrongInputPId { get; set; }

    [JsonPropertyName("noInputPId")]
    public int NoInputPId { get; set; }

    [JsonPropertyName("rePrompt")]
    public int RePrompt { get; set; }

    [JsonPropertyName("countryCode")]
    public string CountryCode { get; set; } = "91";

    [JsonPropertyName("menuWaitTime")]
    public int MenuWaitTime { get; set; }

    [JsonPropertyName("retries")]
    public int Retries { get; set; }

    [JsonPropertyName("retryInterval")]
    public int RetryInterval { get; set; }

    [JsonPropertyName("otp")]
    public object? Otp { get; set; } = 0;

    [JsonPropertyName("sms")]
    public string? Sms { get; set; }

    [JsonPropertyName("webhooks")]
    public string? Webhooks { get; set; }

    [JsonPropertyName("agentRows")]
    public string? AgentRows { get; set; }

    [JsonPropertyName("ivrId")]
    public int? IvrId { get; set; }

    [JsonPropertyName("menus")]
    public string? Menus { get; set; }

    [JsonPropertyName("ttsRows")]
    public string? TtsRows { get; set; }

    [JsonPropertyName("gender")]
    public string? Gender { get; set; }

    [JsonPropertyName("language")]
    public string? Language { get; set; }

    [JsonPropertyName("noAgentId")]
    public int? NoAgentId { get; set; }
}

public class SingleCallResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ApiResponse { get; set; }
    public ExpressIvrSingleCallPayload? PayloadSent { get; set; }
}

public class TemplateInfoDto
{
    public int TemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ExpressIvrSingleCallPayload SamplePayload { get; set; } = new();
}
