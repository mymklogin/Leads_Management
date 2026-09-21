using System;
using System.Collections.Generic;

namespace LeadsManagement.Api.Models.Dtos;

// ==========================================
// 1. Reseller Inbound SMPP DTOs
// ==========================================
public class ResellerSmppAccountDto
{
    public string Id { get; set; } = string.Empty;
    public string SystemId { get; set; } = string.Empty;
    public string ResellerName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string AllowedIps { get; set; } = string.Empty; // Comma-separated or *
    public string BindMode { get; set; } = "TRX"; // TRX, TX, RX
    public int MaxTps { get; set; } = 50;
    public int ActiveBinds { get; set; } = 0;
    public decimal BalanceCredits { get; set; } = 1000m;
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, SUSPENDED, PENDING
    public string DltEntityId { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
    public long TotalSent { get; set; } = 0;
    public long TotalDelivered { get; set; } = 0;
}

public class ResellerSmppServerConfigDto
{
    public string ServerHost { get; set; } = "10.25.215.137";
    public string ServerDomain { get; set; } = "smpp.yourdomain.com";
    public int Port { get; set; } = 2775;
    public int SslPort { get; set; } = 3550;
    public bool EnableTls { get; set; } = true;
    public string SupportedBinds { get; set; } = "TRX, TX, RX";
    public string DefaultEncoding { get; set; } = "GSM 7-bit, Unicode (UCS2)";
    public int MaxGlobalTps { get; set; } = 1000;
    public bool StrictIpCheck { get; set; } = true;
    public List<ResellerSmppAccountDto> Accounts { get; set; } = new();
}

public class ResellerSmppLiveBindDto
{
    public string SessionId { get; set; } = string.Empty;
    public string SystemId { get; set; } = string.Empty;
    public string ResellerName { get; set; } = string.Empty;
    public string ClientIp { get; set; } = string.Empty;
    public string BindType { get; set; } = "TRX";
    public string ConnectedAt { get; set; } = string.Empty;
    public int CurrentTps { get; set; } = 0;
    public int LatencyMs { get; set; } = 0;
    public string State { get; set; } = "BOUND_TRX";
}

// ==========================================
// 2. IP & Domain Security Whitelist DTOs
// ==========================================
public class WhitelistedIpEntryDto
{
    public string Id { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty; // e.g. 114.143.22.10 or 192.168.1.0/24
    public string AssignedTo { get; set; } = string.Empty; // Reseller Name or Admin
    public string UserEmail { get; set; } = string.Empty;
    public string ServiceScope { get; set; } = "REST_API"; // REST_API, SMPP_SERVER, WEBHOOKS, ALL
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string AddedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
    public long RequestCount { get; set; } = 0;
    public string LastAccessedAt { get; set; } = "Just now";
}

public class WhitelistedDomainEntryDto
{
    public string Id { get; set; } = string.Empty;
    public string DomainUrl { get; set; } = string.Empty; // e.g. https://resellerpanel.com
    public string ResellerName { get; set; } = string.Empty;
    public bool AllowCors { get; set; } = true;
    public bool AllowWebhooks { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public string AddedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
}

public class SecurityPolicyConfigDto
{
    public bool EnforceStrictIpWhitelist { get; set; } = true;
    public bool BlockUnauthorizedOrigins { get; set; } = true;
    public bool EnableRateLimiting { get; set; } = true;
    public int MaxRequestsPerMinutePerIp { get; set; } = 120;
    public List<WhitelistedIpEntryDto> WhitelistedIps { get; set; } = new();
    public List<WhitelistedDomainEntryDto> WhitelistedDomains { get; set; } = new();
}

// ==========================================
// 3. Reseller Custom Domains & White-Label DTOs
// ==========================================
public class ResellerDomainMappingDto
{
    public string Id { get; set; } = string.Empty;
    public string ResellerId { get; set; } = string.Empty;
    public string ResellerName { get; set; } = string.Empty;
    public string BrandTitle { get; set; } = string.Empty;
    public string CustomDomain { get; set; } = string.Empty; // e.g. sms.resellerbrand.com
    public string CnameTarget { get; set; } = "app.yourdomain.com";
    public string BrandLogoUrl { get; set; } = string.Empty;
    public string FaviconUrl { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = "#0284c7";
    public string SupportEmail { get; set; } = string.Empty;
    public string SupportPhone { get; set; } = string.Empty;
    public string CustomApiBaseUrl { get; set; } = string.Empty; // https://sms.resellerbrand.com/api/RCSApi
    public bool SslActive { get; set; } = true;
    public bool DnsVerified { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
}

// ==========================================
// 4. DLT Sender ID & Header Allocation DTOs
// ==========================================
public class SenderIdAllocationDto
{
    public string Id { get; set; } = string.Empty;
    public string SenderId { get; set; } = string.Empty; // e.g. AX-HDFCBK, TX-PBGINF
    public string ResellerId { get; set; } = string.Empty;
    public string ResellerName { get; set; } = string.Empty;
    public string DltEntityId { get; set; } = string.Empty;
    public string ServiceCategory { get; set; } = "Transactional"; // Transactional, Promotional, Service Implicit, Service Explicit
    public string PreferredOperator { get; set; } = "Jio"; // Jio, Airtel, BSNL, Vi, GSM
    public int DailyQuota { get; set; } = 50000;
    public long SentToday { get; set; } = 0;
    public string Status { get; set; } = "APPROVED"; // APPROVED, PENDING_DLT, REJECTED, SUSPENDED
    public string Description { get; set; } = string.Empty;
    public string ApprovedDate { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
}
