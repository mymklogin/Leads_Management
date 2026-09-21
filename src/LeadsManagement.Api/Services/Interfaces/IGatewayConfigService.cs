using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LeadsManagement.Api.Services.Interfaces;

public class PlatformPublicConfigDto
{
    public string CompanyName { get; set; } = "Enterprise Telecom Cloud";
    public string BrandLogoUrl { get; set; } = "";
    public string WebDomain { get; set; } = "http://10.25.215.137:5173";
    public string ApiDomain { get; set; } = "http://10.25.215.137:5108";
    public string SupportEmail { get; set; } = "support@enterprisecloud.com";
    public string SupportPhone { get; set; } = "+91 9999900000";
    public string TermsUrl { get; set; } = "/terms";
    public string PrivacyUrl { get; set; } = "/privacy";
}

public class GatewayProviderProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Channel { get; set; } = "RCS"; // RCS, SMS, WHATSAPP, VOICE
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string? DefaultBotId { get; set; }
    public string? DefaultBotName { get; set; }
    public string? DefaultTemplateId { get; set; }
    public string? SenderId { get; set; }
    public string? DltEntityId { get; set; }
    public bool IsActive { get; set; }
}

public class VoiceGatewayConfigDto
{
    public string Provider { get; set; } = "ExpressIVR";
    public string ApiUrl { get; set; } = "http://localhost:2014";
    public string ApiKey { get; set; } = "";
    public int DefaultUserId { get; set; } = 50002;
    public string DefaultCli { get; set; } = "9999900119";
    public string WebhookBaseUrl { get; set; } = "http://10.25.215.137:5108";
    public string CountryCode { get; set; } = "91";
    public string? DefaultSmsConfigJson { get; set; }
    public List<GatewayProviderProfileDto> SavedVoiceProviders { get; set; } = new();
}

public class GatewayConfigDto
{
    public string Provider { get; set; } = "Primary Cloud Gateway";
    public string BaseUrl { get; set; } = "https://gateway.rcsflow.io/api/RCSApi";
    public string ApiKey { get; set; } = "A58463AEB7AE41CD9901D23D18BC2482883";
    public string DefaultBotId { get; set; } = "";
    public string DefaultBotName { get; set; } = "";
    public string DefaultTemplateId { get; set; } = "";
    public string DefaultMobile { get; set; } = "";
    
    // Per-message deduction rates (INR)
    public decimal RcsTRate { get; set; } = 0.20m;
    public decimal RcsPRate { get; set; } = 0.20m;
    public decimal BulkSmsRate { get; set; } = 0.15m;
    public decimal VoiceRate { get; set; } = 0.30m;
    public decimal WhatsAppRate { get; set; } = 0.40m;

    // Webhooks
    public string DlrWebhookUrl { get; set; } = "http://10.25.215.137:5108/api/RCSApi/DeliveryReportCallback";
    public string ChatReplyWebhookUrl { get; set; } = "http://10.25.215.137:5108/api/RCSApi/CustomerReplyCallback";

    // Dynamic Saved Providers across all channels
    public List<GatewayProviderProfileDto> SavedProviders { get; set; } = new();
}

public class BrandingConfigDto
{
    public string CompanyName { get; set; } = "Enterprise Telecom Cloud";
    public string BrandLogoUrl { get; set; } = "";
    public string WebDomain { get; set; } = "http://10.25.215.137:5173";
    public string ApiDomain { get; set; } = "http://10.25.215.137:5108";
    public string SupportEmail { get; set; } = "support@enterprisecloud.com";
    public string SupportPhone { get; set; } = "+91 9999900000";
    public string TermsUrl { get; set; } = "/terms";
    public string PrivacyUrl { get; set; } = "/privacy";
}

public class GatewayTestResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public long LatencyMs { get; set; }
    public int MainBalanceRcsT { get; set; }
    public int MainBalanceRcsP { get; set; }
    public int MainBalanceBulkSms { get; set; }
    public string CheckedUrl { get; set; } = string.Empty;
}

public class SmppGatewayProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Carrier { get; set; } = "Jio"; // Jio, Airtel, BSNL, Vodafone, PrivateGSM, Custom
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 2775;
    public string SystemId { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string SystemType { get; set; } = "SMPP";
    public string BindType { get; set; } = "TRX"; // TRX (Transceiver), TX (Transmitter), RX (Receiver)
    public string? DltEntityId { get; set; }
    public string? SenderId { get; set; }
    public int MaxTps { get; set; } = 50;
    public bool IsActive { get; set; }
    public bool DataPrivacyMode { get; set; } = true; // Bypass 3rd-party SaaS / Direct Operator delivery
    public string Status { get; set; } = "ONLINE"; // ONLINE, STANDBY, ERROR
    public long LastLatencyMs { get; set; } = 18;
    public long TotalSent { get; set; } = 0;
    public long TotalDelivered { get; set; } = 0;
}

public class CarrierRoutingRuleDto
{
    public string Id { get; set; } = string.Empty;
    public string ServiceType { get; set; } = "ALL"; // OTP, TRANSACTIONAL, PROMOTIONAL, RCS_FALLBACK, ALL
    public string PrimaryGatewayId { get; set; } = string.Empty;
    public string FallbackGatewayId { get; set; } = string.Empty;
    public int Priority { get; set; } = 1;
    public bool IsActive { get; set; } = true;
}

public class CarrierRoutingConfigDto
{
    public bool BypassThirdPartyAggregators { get; set; } = true;
    public bool AutoFailoverEnabled { get; set; } = true;
    public bool StrictDltEntityCheck { get; set; } = true;
    public string DefaultPrimaryCarrierId { get; set; } = "smpp-jio-01";
    public string DefaultFallbackCarrierId { get; set; } = "smpp-airtel-01";
    public List<SmppGatewayProfileDto> Gateways { get; set; } = new();
    public List<CarrierRoutingRuleDto> Rules { get; set; } = new();
}

public class SmppTestResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public long LatencyMs { get; set; }
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public string SystemId { get; set; } = string.Empty;
    public string BindMode { get; set; } = "TRX";
    public string SocketStatus { get; set; } = "CONNECTED";
}

public class CarrierMetricsDto
{
    public int ActiveSmppTunnels { get; set; }
    public int CurrentTps { get; set; }
    public int PeakTpsCapacity { get; set; }
    public double OverallDeliveryRate { get; set; }
    public long TotalPacketsProcessed { get; set; }
    public long DirectBypassedPackets { get; set; }
    public List<CarrierLiveStatDto> CarrierStats { get; set; } = new();
}

public class CarrierLiveStatDto
{
    public string CarrierId { get; set; } = string.Empty;
    public string CarrierName { get; set; } = string.Empty;
    public string CarrierType { get; set; } = string.Empty;
    public string Status { get; set; } = "ONLINE";
    public int CurrentTps { get; set; }
    public int MaxTps { get; set; }
    public long TotalSent { get; set; }
    public long TotalDelivered { get; set; }
    public double SuccessRate { get; set; }
    public long LatencyMs { get; set; }
    public bool IsPrimary { get; set; }
    public bool IsDirectTelco { get; set; }
}

public interface IGatewayConfigService
{
    PlatformPublicConfigDto GetPublicConfig();
    GatewayConfigDto GetGatewayConfig();
    VoiceGatewayConfigDto GetVoiceConfig();
    CarrierRoutingConfigDto GetCarrierRoutingConfig();
    void UpdateGatewayConfig(GatewayConfigDto dto);
    void UpdateVoiceConfig(VoiceGatewayConfigDto dto);
    void UpdateBrandingConfig(BrandingConfigDto dto);
    void UpdateCarrierRoutingConfig(CarrierRoutingConfigDto dto);
    void AddOrUpdateProvider(GatewayProviderProfileDto provider);
    void DeleteProvider(string id);
    void SwitchActiveProvider(string id);
    void AddOrUpdateSmppGateway(SmppGatewayProfileDto gateway);
    void DeleteSmppGateway(string id);
    void SwitchActiveSmppGateway(string id);
    Task<GatewayTestResultDto> TestConnectionAsync(string? testUrl = null, string? testKey = null, CancellationToken ct = default);
    Task<GatewayTestResultDto> TestVoiceConnectionAsync(string? testUrl = null, CancellationToken ct = default);
    Task<SmppTestResultDto> TestSmppConnectionAsync(string host, int port, string systemId, string password, string bindType, CancellationToken ct = default);
    CarrierMetricsDto GetCarrierMetrics();
}
