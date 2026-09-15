using System.Collections.Generic;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace LeadsManagement.Api.Services.Interfaces;

public class OmniApiResponse<T>
{
    [JsonPropertyName("Status")]
    public string Status { get; set; } = "OK";

    [JsonPropertyName("Response")]
    public T? Response { get; set; }
}

public class OmniBalanceResponseDto
{
    [JsonPropertyName("RcsBalance")]
    public int RcsBalance { get; set; }

    [JsonPropertyName("RcsPromotionalBalance")]
    public decimal? RcsPromotionalBalance { get; set; }

    [JsonPropertyName("RcsTransactionalBalance")]
    public decimal? RcsTransactionalBalance { get; set; }

    [JsonPropertyName("SmsBalance")]
    public decimal? SmsBalance { get; set; }
}

public class OmniBotDto
{
    [JsonPropertyName("BotId")]
    public string BotId { get; set; } = string.Empty;

    [JsonPropertyName("BotName")]
    public string BotName { get; set; } = string.Empty;
}

public class OmniBotsResponseDto
{
    [JsonPropertyName("Bots")]
    public List<OmniBotDto> Bots { get; set; } = new();
}

public class OmniBotExtraDetailsDto
{
    [JsonPropertyName("fullname")]
    public string Fullname { get; set; } = string.Empty;

    [JsonPropertyName("designation")]
    public string Designation { get; set; } = string.Empty;

    [JsonPropertyName("emailid")]
    public string Emailid { get; set; } = string.Empty;

    [JsonPropertyName("mobile")]
    public string Mobile { get; set; } = string.Empty;

    [JsonPropertyName("gst")]
    public string? Gst { get; set; }

    [JsonPropertyName("pan")]
    public string? Pan { get; set; }

    [JsonPropertyName("logo")]
    public string? Logo { get; set; }

    [JsonPropertyName("subaggregator")]
    public string? Subaggregator { get; set; }
}

public class OmniCreateBotRequestDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("bot_type")]
    public string BotType { get; set; } = "A2P";

    [JsonPropertyName("brandname")]
    public string BrandName { get; set; } = string.Empty;

    [JsonPropertyName("desc")]
    public string Desc { get; set; } = string.Empty;

    [JsonPropertyName("number")]
    public List<string> Number { get; set; } = new();

    [JsonPropertyName("plab")]
    public List<string>? Plab { get; set; }

    [JsonPropertyName("email")]
    public List<string> Email { get; set; } = new();

    [JsonPropertyName("elab")]
    public List<string>? Elab { get; set; }

    [JsonPropertyName("website")]
    public List<string>? Website { get; set; }

    [JsonPropertyName("wlab")]
    public List<string>? Wlab { get; set; }

    [JsonPropertyName("terms_url")]
    public string? TermsUrl { get; set; }

    [JsonPropertyName("privacy_url")]
    public string? PrivacyUrl { get; set; }

    [JsonPropertyName("message_type")]
    public string MessageType { get; set; } = "Transactional";

    [JsonPropertyName("logoimageurlrcs")]
    public string LogoImageUrlRcs { get; set; } = string.Empty;

    [JsonPropertyName("bannerimageurlrcs")]
    public string? BannerImageUrlRcs { get; set; }

    [JsonPropertyName("colorCode")]
    public string? ColorCode { get; set; } = "#0a66c2";

    [JsonPropertyName("development_platform")]
    public string? DevelopmentPlatform { get; set; } = "Web";

    [JsonPropertyName("languages_supported")]
    public string? LanguagesSupported { get; set; } = "English,Hindi";

    [JsonPropertyName("otherCarriercheck")]
    public string? OtherCarrierCheck { get; set; } = "false";

    [JsonPropertyName("extra_details")]
    public OmniBotExtraDetailsDto ExtraDetails { get; set; } = new();
}

public class OmniBotCreateResponseDto
{
    [JsonPropertyName("Message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("BotId")]
    public object? BotId { get; set; }
}

public class OmniSuggestionDto
{
    [JsonPropertyName("Label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("Type")]
    public string Type { get; set; } = "REPLY"; // OPEN_URL, REPLY, DIAL

    [JsonPropertyName("Url")]
    public string? Url { get; set; }

    [JsonPropertyName("PostbackData")]
    public string? PostbackData { get; set; }

    [JsonPropertyName("PhoneNumber")]
    public string? PhoneNumber { get; set; }
}

public class OmniPlainTextDto
{
    [JsonPropertyName("MessageText")]
    public string MessageText { get; set; } = string.Empty;

    [JsonPropertyName("Suggestions")]
    public List<OmniSuggestionDto>? Suggestions { get; set; }
}

public class OmniRichCardDto
{
    [JsonPropertyName("Title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("Description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("MediaType")]
    public string MediaType { get; set; } = "IMAGE"; // IMAGE, VIDEO, PDF

    [JsonPropertyName("MediaHeight")]
    public string MediaHeight { get; set; } = "MEDIUM"; // SHORT, MEDIUM

    [JsonPropertyName("Orientation")]
    public string Orientation { get; set; } = "VERTICAL"; // VERTICAL, HORIZONTAL

    [JsonPropertyName("ImageUrl")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("VideoUrl")]
    public string? VideoUrl { get; set; }

    [JsonPropertyName("ThumbnailUrl")]
    public string? ThumbnailUrl { get; set; }

    [JsonPropertyName("ThumbUrl")]
    public string? ThumbUrl { get; set; }

    [JsonPropertyName("PdfUrl")]
    public string? PdfUrl { get; set; }

    [JsonPropertyName("Suggestions")]
    public List<OmniSuggestionDto>? Suggestions { get; set; }
}

public class OmniCarouselCardDto
{
    [JsonPropertyName("Title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("Description")]
    public string? Description { get; set; }

    [JsonPropertyName("MediaHeight")]
    public string MediaHeight { get; set; } = "MEDIUM";

    [JsonPropertyName("Orientation")]
    public string Orientation { get; set; } = "VERTICAL";

    [JsonPropertyName("ImageUrl")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("VideoUrl")]
    public string? VideoUrl { get; set; }

    [JsonPropertyName("ThumbnailUrl")]
    public string? ThumbnailUrl { get; set; }

    [JsonPropertyName("Suggestions")]
    public List<OmniSuggestionDto>? Suggestions { get; set; }
}

public class OmniCarouselDto
{
    [JsonPropertyName("Cards")]
    public List<OmniCarouselCardDto> Cards { get; set; } = new();
}

public class OmniTemplateItemDto
{
    [JsonPropertyName("BotId")]
    public string BotId { get; set; } = string.Empty;

    [JsonPropertyName("BotName")]
    public string BotName { get; set; } = string.Empty;

    [JsonPropertyName("TemplateName")]
    public string TemplateName { get; set; } = string.Empty;

    [JsonPropertyName("TemplateType")]
    public string TemplateType { get; set; } = "PlainText";

    [JsonPropertyName("TemplateStatus")]
    public string TemplateStatus { get; set; } = "Active";

    [JsonPropertyName("TemplateId")]
    public string TemplateId { get; set; } = string.Empty;

    [JsonPropertyName("LocalTemplateId")]
    public object? LocalTemplateId { get; set; }

    [JsonPropertyName("CreatedDate")]
    public string? CreatedDate { get; set; }

    [JsonPropertyName("FailedDescription")]
    public string? FailedDescription { get; set; }

    [JsonPropertyName("PlainText")]
    public OmniPlainTextDto? PlainText { get; set; }

    [JsonPropertyName("RichCard")]
    public OmniRichCardDto? RichCard { get; set; }

    [JsonPropertyName("Carousel")]
    public OmniCarouselDto? Carousel { get; set; }
}

public class OmniTemplatesResponseDto
{
    [JsonPropertyName("Templates")]
    public List<OmniTemplateItemDto> Templates { get; set; } = new();

    [JsonPropertyName("TotalCount")]
    public int TotalCount { get; set; }
}

public class OmniCreateTemplateRequestDto
{
    [JsonPropertyName("TemplateType")]
    public string TemplateType { get; set; } = "PlainText";

    [JsonPropertyName("BotId")]
    public string BotId { get; set; } = string.Empty;

    [JsonPropertyName("TemplateName")]
    public string TemplateName { get; set; } = string.Empty;

    [JsonPropertyName("PlainText")]
    public OmniPlainTextDto? PlainText { get; set; }

    [JsonPropertyName("RichCard")]
    public OmniRichCardDto? RichCard { get; set; }

    [JsonPropertyName("Cards")]
    public List<OmniCarouselCardDto>? Cards { get; set; }

    [JsonPropertyName("Suggestions")]
    public List<OmniSuggestionDto>? Suggestions { get; set; }
}

public class OmniTemplateCreateResponseDto
{
    [JsonPropertyName("Message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("TemplateId")]
    public string? TemplateId { get; set; }

    [JsonPropertyName("TemplateName")]
    public string? TemplateName { get; set; }

    [JsonPropertyName("TemplateType")]
    public string? TemplateType { get; set; }
}

public class OmniCampaignRequestDto
{
    [JsonPropertyName("TemplateId")]
    public string TemplateId { get; set; } = string.Empty;

    [JsonPropertyName("CampaignName")]
    public string CampaignName { get; set; } = string.Empty;

    [JsonPropertyName("MobileNumbers")]
    public List<string> MobileNumbers { get; set; } = new();

    [JsonPropertyName("EnableFallback")]
    public bool EnableFallback { get; set; } = false;

    [JsonPropertyName("EntityId")]
    public string? EntityId { get; set; }

    [JsonPropertyName("SenderId")]
    public string? SenderId { get; set; }

    [JsonPropertyName("SmsTemplateId")]
    public string? SmsTemplateId { get; set; }

    [JsonPropertyName("SmsText")]
    public string? SmsText { get; set; }

    [JsonPropertyName("CustomParam1")]
    public string? CustomParam1 { get; set; }

    [JsonPropertyName("CustomParam2")]
    public string? CustomParam2 { get; set; }

    [JsonPropertyName("CustomParam3")]
    public string? CustomParam3 { get; set; }

    [JsonPropertyName("CustomParam4")]
    public string? CustomParam4 { get; set; }
}

public class OmniCampaignResultDetailsDto
{
    [JsonPropertyName("Message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("CampaignId")]
    public object? CampaignId { get; set; }

    [JsonPropertyName("TotalMobiles")]
    public int? TotalMobiles { get; set; }
}

public class OmniCampaignResponseDto
{
    [JsonPropertyName("Status")]
    public string Status { get; set; } = "OK";

    [JsonPropertyName("Response")]
    public OmniCampaignResultDetailsDto? Response { get; set; }
}

public class OmniSendChatMessageDto
{
    [JsonPropertyName("BotId")]
    public string BotId { get; set; } = string.Empty;

    [JsonPropertyName("MobileNo")]
    public string MobileNo { get; set; } = string.Empty;

    [JsonPropertyName("MessageText")]
    public string MessageText { get; set; } = string.Empty;
}

public class OmniChatMessageResultDetailsDto
{
    [JsonPropertyName("Message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("ChatMessageId")]
    public object? ChatMessageId { get; set; }

    [JsonPropertyName("VendorMessageId")]
    public string? VendorMessageId { get; set; }

    [JsonPropertyName("Status")]
    public string Status { get; set; } = "SENT";
}

public class OmniChatMessageResponseDto
{
    [JsonPropertyName("Status")]
    public string Status { get; set; } = "OK";

    [JsonPropertyName("Response")]
    public OmniChatMessageResultDetailsDto? Response { get; set; }
}

public interface IOmniDigitalRcsService
{
    Task<OmniBalanceResponseDto?> CheckBalanceAsync(string? apiKey = null, CancellationToken ct = default);
    Task<List<OmniBotDto>> GetBotsAsync(string? apiKey = null, CancellationToken ct = default);
    Task<OmniApiResponse<OmniBotCreateResponseDto>> CreateBotAsync(OmniCreateBotRequestDto dto, string? apiKey = null, CancellationToken ct = default);
    Task<List<OmniTemplateItemDto>> GetTemplatesAsync(string botId, string? apiKey = null, string? templateName = null, string? templateType = null, string? status = null, CancellationToken ct = default);
    Task<OmniApiResponse<OmniTemplateCreateResponseDto>> CreateTemplateAsync(OmniCreateTemplateRequestDto dto, string? apiKey = null, CancellationToken ct = default);
    Task<OmniCampaignResponseDto> CreateCampaignAsync(OmniCampaignRequestDto dto, string? apiKey = null, CancellationToken ct = default);
    Task<OmniChatMessageResponseDto> SendChatMessageAsync(OmniSendChatMessageDto dto, string? apiKey = null, CancellationToken ct = default);
}
