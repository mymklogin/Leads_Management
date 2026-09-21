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

public class RcsGatewayService : IRcsGatewayService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly IGatewayConfigService _gatewayConfigService;
    private readonly ILogger<RcsGatewayService> _logger;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
    };

    public RcsGatewayService(
        HttpClient httpClient,
        IConfiguration configuration,
        IGatewayConfigService gatewayConfigService,
        ILogger<RcsGatewayService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _gatewayConfigService = gatewayConfigService;
        _logger = logger;

        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    private string GetBaseUrl() => _gatewayConfigService.GetGatewayConfig().BaseUrl;
    
    private string GetApiKey(string? apiKey) =>
        string.IsNullOrWhiteSpace(apiKey) ? _gatewayConfigService.GetGatewayConfig().ApiKey : apiKey;

    private string GetDefaultBotId() => _gatewayConfigService.GetGatewayConfig().DefaultBotId;

    public async Task<RcsBalanceResponseDto?> CheckBalanceAsync(string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var baseUrl = GetBaseUrl();
            var url = $"{baseUrl}/CheckRcsBalance?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[RCS Gateway] Checking RCS balance from: {Url}", url);
            var response = await _httpClient.GetAsync(url, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("[RCS Gateway] Balance check failed ({Status}): {Content}", response.StatusCode, errContent);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            _logger.LogInformation("[RCS Gateway] CheckBalance raw response: {Json}", json);
            var result = JsonSerializer.Deserialize<RcsApiResponse<RcsBalanceResponseDto>>(json, _jsonOptions);
            return result?.Response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RCS Gateway] Exception during CheckRcsBalance");
            return null;
        }
    }

    public async Task<List<RcsBotDto>> GetBotsAsync(string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var baseUrl = GetBaseUrl();
            var url = $"{baseUrl}/GetBots?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[RCS Gateway] Fetching registered bots from: {Url}", url);
            var response = await _httpClient.GetAsync(url, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("[RCS Gateway] GetBots failed ({Status}): {Content}", response.StatusCode, errContent);
                return new List<RcsBotDto>();
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            _logger.LogInformation("[RCS Gateway] GetBots raw response: {Json}", json);
            var result = JsonSerializer.Deserialize<RcsApiResponse<RcsBotsResponseDto>>(json, _jsonOptions);
            return result?.Response?.Bots ?? new List<RcsBotDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RCS Gateway] Exception during GetBots");
            return new List<RcsBotDto>();
        }
    }

    public async Task<RcsApiResponse<RcsBotCreateResponseDto>> CreateBotAsync(RcsCreateBotRequestDto dto, string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var baseUrl = GetBaseUrl();
            var url = $"{baseUrl}/CreateBot?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[RCS Gateway] Creating new bot: {Name}", dto.Name);
            var response = await _httpClient.PostAsJsonAsync(url, dto, _jsonOptions, ct);
            var json = await response.Content.ReadAsStringAsync(ct);
            _logger.LogInformation("[RCS Gateway] CreateBot raw response ({StatusCode}): {Json}", response.StatusCode, json);

            var result = JsonSerializer.Deserialize<RcsApiResponse<RcsBotCreateResponseDto>>(json, _jsonOptions);
            return result ?? new RcsApiResponse<RcsBotCreateResponseDto>
            {
                Status = response.IsSuccessStatusCode ? "OK" : "WARNING",
                Response = new RcsBotCreateResponseDto { Message = json }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RCS Gateway] Exception during CreateBot");
            return new RcsApiResponse<RcsBotCreateResponseDto>
            {
                Status = "ERROR",
                Response = new RcsBotCreateResponseDto { Message = ex.Message }
            };
        }
    }

    public async Task<List<RcsTemplateItemDto>> GetTemplatesAsync(
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
            var baseUrl = GetBaseUrl();
            var resolvedBotId = string.IsNullOrWhiteSpace(botId) ? GetDefaultBotId() : botId;

            var sb = new StringBuilder($"{baseUrl}/GetTemplates?apiKey={Uri.EscapeDataString(key)}&botId={Uri.EscapeDataString(resolvedBotId)}");
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
            _logger.LogInformation("[RCS Gateway] Fetching templates from: {Url}", url);
            var response = await _httpClient.GetAsync(url, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("[RCS Gateway] GetTemplates failed ({Status}): {Content}", response.StatusCode, errContent);
                return new List<RcsTemplateItemDto>();
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            var result = JsonSerializer.Deserialize<RcsApiResponse<RcsTemplatesResponseDto>>(json, _jsonOptions);
            return result?.Response?.Templates ?? new List<RcsTemplateItemDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RCS Gateway] Exception during GetTemplates");
            return new List<RcsTemplateItemDto>();
        }
    }

    public async Task<RcsApiResponse<RcsTemplateCreateResponseDto>> CreateTemplateAsync(RcsCreateTemplateRequestDto dto, string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var baseUrl = GetBaseUrl();
            var url = $"{baseUrl}/CreateTemplate?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[RCS Gateway] Creating template: {Name} ({Type})", dto.TemplateName, dto.TemplateType);
            var response = await _httpClient.PostAsJsonAsync(url, dto, _jsonOptions, ct);
            var json = await response.Content.ReadAsStringAsync(ct);

            var result = JsonSerializer.Deserialize<RcsApiResponse<RcsTemplateCreateResponseDto>>(json, _jsonOptions);
            return result ?? new RcsApiResponse<RcsTemplateCreateResponseDto>
            {
                Status = response.IsSuccessStatusCode ? "OK" : "WARNING",
                Response = new RcsTemplateCreateResponseDto { Message = json }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RCS Gateway] Exception during CreateTemplate");
            return new RcsApiResponse<RcsTemplateCreateResponseDto>
            {
                Status = "ERROR",
                Response = new RcsTemplateCreateResponseDto { Message = ex.Message }
            };
        }
    }

    public async Task<RcsCampaignResponseDto> CreateCampaignAsync(RcsCampaignRequestDto dto, string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var baseUrl = GetBaseUrl();
            var url = $"{baseUrl}/CreateCampaign?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[RCS Gateway] Dispatching campaign '{Name}' to {Count} numbers", dto.CampaignName, dto.MobileNumbers?.Count ?? 0);
            var response = await _httpClient.PostAsJsonAsync(url, dto, _jsonOptions, ct);
            var json = await response.Content.ReadAsStringAsync(ct);

            _logger.LogInformation("[RCS Gateway] CreateCampaign raw response: {Json}", json);
            var result = JsonSerializer.Deserialize<RcsCampaignResponseDto>(json, _jsonOptions);
            return result ?? new RcsCampaignResponseDto
            {
                Status = response.IsSuccessStatusCode ? "OK" : "WARNING",
                Response = new RcsCampaignResultDetailsDto { Message = json }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RCS Gateway] Exception during CreateCampaign");
            return new RcsCampaignResponseDto
            {
                Status = "ERROR",
                Response = new RcsCampaignResultDetailsDto { Message = ex.Message }
            };
        }
    }

    public async Task<RcsChatMessageResponseDto> SendChatMessageAsync(RcsSendChatMessageDto dto, string? apiKey = null, CancellationToken ct = default)
    {
        try
        {
            var key = GetApiKey(apiKey);
            var baseUrl = GetBaseUrl();
            var url = $"{baseUrl}/SendChatMessage?apiKey={Uri.EscapeDataString(key)}";

            _logger.LogInformation("[RCS Gateway] Sending conversational chat to {Number}", dto.MobileNo);
            var response = await _httpClient.PostAsJsonAsync(url, dto, _jsonOptions, ct);
            var json = await response.Content.ReadAsStringAsync(ct);

            var result = JsonSerializer.Deserialize<RcsChatMessageResponseDto>(json, _jsonOptions);
            return result ?? new RcsChatMessageResponseDto
            {
                Status = response.IsSuccessStatusCode ? "OK" : "WARNING",
                Response = new RcsChatMessageResultDetailsDto { Message = json }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RCS Gateway] Exception during SendChatMessage");
            return new RcsChatMessageResponseDto
            {
                Status = "ERROR",
                Response = new RcsChatMessageResultDetailsDto { Message = ex.Message }
            };
        }
    }
}
