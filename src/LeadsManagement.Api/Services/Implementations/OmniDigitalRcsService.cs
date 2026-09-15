using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Implementations;

public class OmniDigitalRcsService : IOmniDigitalRcsService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OmniDigitalRcsService> _logger;

    private readonly string _defaultBaseUrl;
    private readonly string _defaultApiKey;
    private readonly string _defaultBotId;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
    };

    public OmniDigitalRcsService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<OmniDigitalRcsService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;

        _defaultBaseUrl = _configuration["OmniDigital:BaseUrl"] ?? "https://omnidigital.co.in/api/RCSApi";
        _defaultApiKey = _configuration["OmniDigital:ApiKey"] ?? "A58463AEB7AE41CD9901D23D18BC2482883";
        _defaultBotId = _configuration["OmniDigital:DefaultBotId"] ?? "3c4fa9a066274cd2";

        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    private string GetApiKey(string? apiKey) =>
        string.IsNullOrWhiteSpace(apiKey) ? _defaultApiKey : apiKey;

    public async Task<OmniBalanceResponseDto?> CheckBalanceAsync(string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var url = $"{_defaultBaseUrl}/CheckRcsBalance?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[OmniDigital] Checking RCS balance from: {Url}", url);
            var response = await _httpClient.GetAsync(url, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("[OmniDigital] Balance check failed ({Status}): {Content}", response.StatusCode, errContent);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            var result = JsonSerializer.Deserialize<OmniApiResponse<OmniBalanceResponseDto>>(json, _jsonOptions);
            return result?.Response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[OmniDigital] Exception during CheckRcsBalance");
            return null;
        }
    }

    public async Task<List<OmniBotDto>> GetBotsAsync(string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var url = $"{_defaultBaseUrl}/GetBots?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[OmniDigital] Fetching registered bots from: {Url}", url);
            var response = await _httpClient.GetAsync(url, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("[OmniDigital] GetBots failed ({Status}): {Content}", response.StatusCode, errContent);
                return new List<OmniBotDto>();
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            var result = JsonSerializer.Deserialize<OmniApiResponse<OmniBotsResponseDto>>(json, _jsonOptions);
            return result?.Response?.Bots ?? new List<OmniBotDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[OmniDigital] Exception during GetBots");
            return new List<OmniBotDto>();
        }
    }

    public async Task<OmniApiResponse<OmniBotCreateResponseDto>> CreateBotAsync(OmniCreateBotRequestDto dto, string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var url = $"{_defaultBaseUrl}/CreateBot?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[OmniDigital] Creating new bot: {Name}", dto.Name);
            var response = await _httpClient.PostAsJsonAsync(url, dto, _jsonOptions, ct);
            var json = await response.Content.ReadAsStringAsync(ct);

            var result = JsonSerializer.Deserialize<OmniApiResponse<OmniBotCreateResponseDto>>(json, _jsonOptions);
            return result ?? new OmniApiResponse<OmniBotCreateResponseDto>
            {
                Status = response.IsSuccessStatusCode ? "OK" : "WARNING",
                Response = new OmniBotCreateResponseDto { Message = json }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[OmniDigital] Exception during CreateBot");
            return new OmniApiResponse<OmniBotCreateResponseDto>
            {
                Status = "ERROR",
                Response = new OmniBotCreateResponseDto { Message = ex.Message }
            };
        }
    }

    public async Task<List<OmniTemplateItemDto>> GetTemplatesAsync(
        string botId,
        string? apiKey = null,
        string? templateName = null,
        string? templateType = null,
        string? status = null,
        CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var resolvedBotId = string.IsNullOrWhiteSpace(botId) ? _defaultBotId : botId;

            var sb = new StringBuilder($"{_defaultBaseUrl}/GetTemplates?apiKey={Uri.EscapeDataString(key)}&botId={Uri.EscapeDataString(resolvedBotId)}");
            if (!string.IsNullOrWhiteSpace(templateName))
            {
                sb.Append($"&templateName={Uri.EscapeDataString(templateName)}");
            }
            if (!string.IsNullOrWhiteSpace(templateType))
            {
                sb.Append($"&templateType={Uri.EscapeDataString(templateType)}");
            }
            if (!string.IsNullOrWhiteSpace(status))
            {
                sb.Append($"&status={Uri.EscapeDataString(status)}");
            }

            var url = sb.ToString();
            _logger.LogInformation("[OmniDigital] Fetching templates from: {Url}", url);
            var response = await _httpClient.GetAsync(url, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("[OmniDigital] GetTemplates failed ({Status}): {Content}", response.StatusCode, errContent);
                return new List<OmniTemplateItemDto>();
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            var result = JsonSerializer.Deserialize<OmniApiResponse<OmniTemplatesResponseDto>>(json, _jsonOptions);
            return result?.Response?.Templates ?? new List<OmniTemplateItemDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[OmniDigital] Exception during GetTemplates");
            return new List<OmniTemplateItemDto>();
        }
    }

    public async Task<OmniApiResponse<OmniTemplateCreateResponseDto>> CreateTemplateAsync(OmniCreateTemplateRequestDto dto, string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var url = $"{_defaultBaseUrl}/CreateTemplate?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[OmniDigital] Creating template: {Name} ({Type})", dto.TemplateName, dto.TemplateType);
            var response = await _httpClient.PostAsJsonAsync(url, dto, _jsonOptions, ct);
            var json = await response.Content.ReadAsStringAsync(ct);

            var result = JsonSerializer.Deserialize<OmniApiResponse<OmniTemplateCreateResponseDto>>(json, _jsonOptions);
            return result ?? new OmniApiResponse<OmniTemplateCreateResponseDto>
            {
                Status = response.IsSuccessStatusCode ? "OK" : "WARNING",
                Response = new OmniTemplateCreateResponseDto { Message = json }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[OmniDigital] Exception during CreateTemplate");
            return new OmniApiResponse<OmniTemplateCreateResponseDto>
            {
                Status = "ERROR",
                Response = new OmniTemplateCreateResponseDto { Message = ex.Message }
            };
        }
    }

    public async Task<OmniCampaignResponseDto> CreateCampaignAsync(OmniCampaignRequestDto dto, string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var url = $"{_defaultBaseUrl}/CreateCampaign?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[OmniDigital] Dispatching campaign '{Name}' to {Count} numbers", dto.CampaignName, dto.MobileNumbers?.Count ?? 0);
            var response = await _httpClient.PostAsJsonAsync(url, dto, _jsonOptions, ct);
            var json = await response.Content.ReadAsStringAsync(ct);

            _logger.LogInformation("[OmniDigital] CreateCampaign raw response: {Json}", json);
            var result = JsonSerializer.Deserialize<OmniCampaignResponseDto>(json, _jsonOptions);
            return result ?? new OmniCampaignResponseDto
            {
                Status = response.IsSuccessStatusCode ? "OK" : "WARNING",
                Response = new OmniCampaignResultDetailsDto { Message = json }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[OmniDigital] Exception during CreateCampaign");
            return new OmniCampaignResponseDto
            {
                Status = "ERROR",
                Response = new OmniCampaignResultDetailsDto { Message = ex.Message }
            };
        }
    }

    public async Task<OmniChatMessageResponseDto> SendChatMessageAsync(OmniSendChatMessageDto dto, string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var url = $"{_defaultBaseUrl}/SendChatMessage?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[OmniDigital] Sending conversational chat to {Number}", dto.MobileNo);
            var response = await _httpClient.PostAsJsonAsync(url, dto, _jsonOptions, ct);
            var json = await response.Content.ReadAsStringAsync(ct);

            var result = JsonSerializer.Deserialize<OmniChatMessageResponseDto>(json, _jsonOptions);
            return result ?? new OmniChatMessageResponseDto
            {
                Status = response.IsSuccessStatusCode ? "OK" : "WARNING",
                Response = new OmniChatMessageResultDetailsDto { Message = json }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[OmniDigital] Exception during SendChatMessage");
            return new OmniChatMessageResponseDto
            {
                Status = "ERROR",
                Response = new OmniChatMessageResultDetailsDto { Message = ex.Message }
            };
        }
    }
}
