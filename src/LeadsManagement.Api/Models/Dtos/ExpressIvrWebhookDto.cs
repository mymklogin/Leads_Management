using System.Text.Json.Serialization;

namespace LeadsManagement.Api.Models.Dtos;

public class ExpressIvrWebhookDto
{
    [JsonPropertyName("mobile")]
    public string? Mobile { get; set; }

    [JsonPropertyName("eventType")]
    public string? EventType { get; set; }

    [JsonPropertyName("pressedKey")]
    public string? PressedKey { get; set; }

    [JsonPropertyName("duration")]
    public int Duration { get; set; }

    [JsonPropertyName("templateId")]
    public int? TemplateId { get; set; }

    [JsonPropertyName("userId")]
    public int? UserId { get; set; }

    [JsonPropertyName("cli")]
    public string? Cli { get; set; }

    [JsonPropertyName("callId")]
    public string? CallId { get; set; }

    [JsonPropertyName("ivrId")]
    public int? IvrId { get; set; }

    [JsonPropertyName("customData")]
    public string? CustomData { get; set; }
}

public class WebhookResultDto
{
    public string Status { get; set; } = "success";
    public int? TemplateId { get; set; }
    public string? EventType { get; set; }
    public string? PressedKey { get; set; }
    public string? EffectivePressedKey { get; set; }
    public int Duration { get; set; }
    public string? LeadStatus { get; set; }
    public string? Message { get; set; }
    public int? IvrId { get; set; }
}
