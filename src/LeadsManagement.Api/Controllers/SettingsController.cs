using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly IGatewayConfigService _configService;

    public SettingsController(IGatewayConfigService configService)
    {
        _configService = configService;
    }

    /// <summary>
    /// Returns public white-label branding details (Company name, logo, URLs)
    /// </summary>
    [HttpGet("public-config")]
    [AllowAnonymous]
    public IActionResult GetPublicConfig()
    {
        var config = _configService.GetPublicConfig();
        return Ok(new
        {
            success = true,
            data = config
        });
    }

    /// <summary>
    /// Returns complete telecom gateway configuration including upstream credentials and saved providers
    /// </summary>
    [HttpGet("gateway-config")]
    [AllowAnonymous]
    public IActionResult GetGatewayConfig()
    {
        var config = _configService.GetGatewayConfig();
        var voice = _configService.GetVoiceConfig();
        var branding = _configService.GetPublicConfig();

        return Ok(new
        {
            success = true,
            gateway = config,
            voice,
            branding,
            savedProviders = config.SavedProviders
        });
    }

    /// <summary>
    /// Updates telecom gateway upstream settings (BaseUrl, ApiKey, DefaultBotId, Webhooks, Rates)
    /// </summary>
    [HttpPost("gateway-config")]
    [AllowAnonymous]
    public IActionResult UpdateGatewayConfig([FromBody] GatewayConfigDto dto)
    {
        if (dto == null)
            return BadRequest(new { success = false, message = "Invalid gateway configuration payload." });

        _configService.UpdateGatewayConfig(dto);

        return Ok(new
        {
            success = true,
            message = "Telecom Gateway configuration updated and applied dynamically!",
            gateway = _configService.GetGatewayConfig()
        });
    }

    /// <summary>
    /// Gets Voice OBD / ExpressIVR gateway configuration
    /// </summary>
    [HttpGet("voice-config")]
    [AllowAnonymous]
    public IActionResult GetVoiceConfig()
    {
        var voice = _configService.GetVoiceConfig();
        return Ok(new
        {
            success = true,
            voice
        });
    }

    /// <summary>
    /// Updates Voice OBD / ExpressIVR gateway configuration
    /// </summary>
    [HttpPost("voice-config")]
    [AllowAnonymous]
    public IActionResult UpdateVoiceConfig([FromBody] VoiceGatewayConfigDto dto)
    {
        if (dto == null)
            return BadRequest(new { success = false, message = "Invalid voice configuration payload." });

        _configService.UpdateVoiceConfig(dto);

        return Ok(new
        {
            success = true,
            message = "Voice Gateway configuration updated and applied dynamically!",
            voice = _configService.GetVoiceConfig()
        });
    }

    /// <summary>
    /// Adds or updates a custom Gateway Provider Profile (RCS, SMS, WhatsApp, Voice)
    /// </summary>
    [HttpPost("providers")]
    [AllowAnonymous]
    public IActionResult AddOrUpdateProvider([FromBody] GatewayProviderProfileDto provider)
    {
        if (provider == null || string.IsNullOrWhiteSpace(provider.Name) || string.IsNullOrWhiteSpace(provider.BaseUrl))
            return BadRequest(new { success = false, message = "Provider Name and Base URL are required." });

        _configService.AddOrUpdateProvider(provider);

        return Ok(new
        {
            success = true,
            message = $"Gateway provider '{provider.Name}' saved successfully!",
            gateway = _configService.GetGatewayConfig(),
            voice = _configService.GetVoiceConfig()
        });
    }

    /// <summary>
    /// Deletes a saved Gateway Provider Profile
    /// </summary>
    [HttpDelete("providers/{id}")]
    [AllowAnonymous]
    public IActionResult DeleteProvider(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return BadRequest(new { success = false, message = "Provider ID is required." });

        _configService.DeleteProvider(id);

        return Ok(new
        {
            success = true,
            message = "Gateway provider profile deleted.",
            gateway = _configService.GetGatewayConfig(),
            voice = _configService.GetVoiceConfig()
        });
    }

    /// <summary>
    /// Switches the active Telecom Gateway Provider
    /// </summary>
    [HttpPost("switch-provider")]
    [AllowAnonymous]
    public IActionResult SwitchProvider([FromBody] SwitchProviderRequestDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.ProviderId))
            return BadRequest(new { success = false, message = "Provider ID is required." });

        _configService.SwitchActiveProvider(request.ProviderId);

        return Ok(new
        {
            success = true,
            message = "Active Telecom Gateway switched successfully with instant hot-reload!",
            gateway = _configService.GetGatewayConfig(),
            voice = _configService.GetVoiceConfig()
        });
    }

    /// <summary>
    /// Updates white-label company branding, web domains and support details
    /// </summary>
    [HttpPost("branding")]
    [AllowAnonymous]
    public IActionResult UpdateBranding([FromBody] BrandingConfigDto dto)
    {
        if (dto == null)
            return BadRequest(new { success = false, message = "Invalid branding configuration payload." });

        _configService.UpdateBrandingConfig(dto);

        return Ok(new
        {
            success = true,
            message = "Company branding and domain configuration updated successfully!",
            branding = _configService.GetPublicConfig(),
            gateway = _configService.GetGatewayConfig()
        });
    }

    /// <summary>
    /// Tests live connectivity and latency with the upstream Telecom Carrier Gateway
    /// </summary>
    [HttpPost("test-connection")]
    [AllowAnonymous]
    public async Task<IActionResult> TestConnection(
        [FromBody] TestConnectionRequestDto? request,
        CancellationToken ct)
    {
        var result = await _configService.TestConnectionAsync(
            request?.BaseUrl,
            request?.ApiKey,
            ct);

        return Ok(new
        {
            success = result.Success,
            message = result.Message,
            latencyMs = result.LatencyMs,
            checkedUrl = result.CheckedUrl,
            balances = new
            {
                rcsT = result.MainBalanceRcsT,
                rcsP = result.MainBalanceRcsP,
                bulkSms = result.MainBalanceBulkSms
            }
        });
    }

    /// <summary>
    /// Tests live connectivity with Voice OBD / IVR Gateway
    /// </summary>
    [HttpPost("test-voice-connection")]
    [AllowAnonymous]
    public async Task<IActionResult> TestVoiceConnection(
        [FromBody] TestConnectionRequestDto? request,
        CancellationToken ct)
    {
        var result = await _configService.TestVoiceConnectionAsync(
            request?.BaseUrl,
            ct);

        return Ok(new
        {
            success = result.Success,
            message = result.Message,
            latencyMs = result.LatencyMs,
            checkedUrl = result.CheckedUrl
        });
    }

    /// <summary>
    /// Returns carrier routing configuration, saved direct telco SMPP gateways, and live carrier metrics
    /// </summary>
    [HttpGet("smpp-gateways")]
    [AllowAnonymous]
    public IActionResult GetSmppGateways()
    {
        var routing = _configService.GetCarrierRoutingConfig();
        var metrics = _configService.GetCarrierMetrics();

        return Ok(new
        {
            success = true,
            routing,
            gateways = routing.Gateways,
            rules = routing.Rules,
            metrics
        });
    }

    /// <summary>
    /// Adds or updates a direct Telco SMPP gateway profile (Jio, Airtel, BSNL, GSM pool)
    /// </summary>
    [HttpPost("smpp-gateways")]
    [AllowAnonymous]
    public IActionResult AddOrUpdateSmppGateway([FromBody] SmppGatewayProfileDto gateway)
    {
        if (gateway == null || string.IsNullOrWhiteSpace(gateway.Name) || string.IsNullOrWhiteSpace(gateway.Host))
            return BadRequest(new { success = false, message = "Carrier Name and Host/IP are required." });

        _configService.AddOrUpdateSmppGateway(gateway);

        return Ok(new
        {
            success = true,
            message = $"SMPP Gateway '{gateway.Name}' saved successfully!",
            routing = _configService.GetCarrierRoutingConfig(),
            metrics = _configService.GetCarrierMetrics()
        });
    }

    /// <summary>
    /// Deletes a configured SMPP carrier gateway
    /// </summary>
    [HttpDelete("smpp-gateways/{id}")]
    [AllowAnonymous]
    public IActionResult DeleteSmppGateway(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return BadRequest(new { success = false, message = "SMPP Gateway ID is required." });

        _configService.DeleteSmppGateway(id);

        return Ok(new
        {
            success = true,
            message = "SMPP Carrier Gateway deleted successfully.",
            routing = _configService.GetCarrierRoutingConfig(),
            metrics = _configService.GetCarrierMetrics()
        });
    }

    /// <summary>
    /// Switches the active primary SMPP carrier gateway
    /// </summary>
    [HttpPost("smpp-switch")]
    [AllowAnonymous]
    public IActionResult SwitchSmppGateway([FromBody] SwitchProviderRequestDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.ProviderId))
            return BadRequest(new { success = false, message = "Gateway ID is required." });

        _configService.SwitchActiveSmppGateway(request.ProviderId);

        return Ok(new
        {
            success = true,
            message = "Primary SMPP Carrier Gateway switched successfully with zero downtime!",
            routing = _configService.GetCarrierRoutingConfig(),
            metrics = _configService.GetCarrierMetrics()
        });
    }

    /// <summary>
    /// Updates carrier routing rules, auto-failover, and 3rd-party aggregator bypass settings
    /// </summary>
    [HttpPost("routing-rules")]
    [AllowAnonymous]
    public IActionResult UpdateCarrierRouting([FromBody] CarrierRoutingConfigDto dto)
    {
        if (dto == null)
            return BadRequest(new { success = false, message = "Invalid carrier routing payload." });

        _configService.UpdateCarrierRoutingConfig(dto);

        return Ok(new
        {
            success = true,
            message = "Carrier routing policies & data privacy bypass rules updated!",
            routing = _configService.GetCarrierRoutingConfig(),
            metrics = _configService.GetCarrierMetrics()
        });
    }

    /// <summary>
    /// Tests live TCP socket probe and SMPP bind protocol connectivity to upstream carrier
    /// </summary>
    [HttpPost("smpp-test")]
    [AllowAnonymous]
    public async Task<IActionResult> TestSmppConnection(
        [FromBody] SmppTestConnectionRequestDto request,
        CancellationToken ct)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Host) || request.Port <= 0)
            return BadRequest(new { success = false, message = "Target SMPP Host and Port are required." });

        var result = await _configService.TestSmppConnectionAsync(
            request.Host,
            request.Port,
            request.SystemId ?? "SMPP_CLIENT",
            request.Password ?? "",
            request.BindType ?? "TRX",
            ct);

        return Ok(new
        {
            success = result.Success,
            message = result.Message,
            latencyMs = result.LatencyMs,
            host = result.Host,
            port = result.Port,
            bindMode = result.BindMode,
            socketStatus = result.SocketStatus
        });
    }

    /// <summary>
    /// Returns live dynamic carrier packet throughput and load metrics
    /// </summary>
    [HttpGet("carrier-metrics")]
    [AllowAnonymous]
    public IActionResult GetCarrierMetrics()
    {
        var metrics = _configService.GetCarrierMetrics();
        return Ok(new
        {
            success = true,
            metrics
        });
    }
}

public class SwitchProviderRequestDto
{
    public string ProviderId { get; set; } = string.Empty;
}

public class TestConnectionRequestDto
{
    public string? BaseUrl { get; set; }
    public string? ApiKey { get; set; }
}

public class SmppTestConnectionRequestDto
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 2775;
    public string? SystemId { get; set; }
    public string? Password { get; set; }
    public string? BindType { get; set; } = "TRX";
}
