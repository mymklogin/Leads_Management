using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResellerConnectivityController : ControllerBase
{
    private readonly IResellerConnectivityService _service;

    public ResellerConnectivityController(IResellerConnectivityService service)
    {
        _service = service;
    }

    // ==========================================
    // 1. Reseller Inbound SMPP Server
    // ==========================================
    [HttpGet("smpp-server")]
    public IActionResult GetSmppServer()
    {
        var config = _service.GetSmppServerConfig();
        var liveBinds = _service.GetLiveBinds();
        return Ok(new { success = true, config, liveBinds });
    }

    [HttpPost("smpp-server")]
    public IActionResult UpdateSmppServer([FromBody] ResellerSmppServerConfigDto dto)
    {
        var success = _service.UpdateSmppServerConfig(dto);
        return Ok(new { success, message = "Inbound SMPP server configuration updated successfully!" });
    }

    [HttpPost("smpp-accounts")]
    public IActionResult SaveSmppAccount([FromBody] ResellerSmppAccountDto dto)
    {
        var success = _service.AddOrUpdateSmppAccount(dto);
        return Ok(new { success, message = $"Reseller SMPP Account '{dto.SystemId}' saved successfully!" });
    }

    [HttpDelete("smpp-accounts/{id}")]
    public IActionResult DeleteSmppAccount(string id)
    {
        var success = _service.DeleteSmppAccount(id);
        return Ok(new { success, message = "Reseller SMPP Account deleted successfully!" });
    }

    [HttpGet("live-binds")]
    public IActionResult GetLiveBinds()
    {
        var liveBinds = _service.GetLiveBinds();
        return Ok(new { success = true, liveBinds });
    }

    // ==========================================
    // 2. IP & Domain Security Whitelist
    // ==========================================
    [HttpGet("security-policy")]
    public IActionResult GetSecurityPolicy()
    {
        var policy = _service.GetSecurityPolicyConfig();
        return Ok(new { success = true, policy });
    }

    [HttpPost("security-policy")]
    public IActionResult UpdateSecurityPolicy([FromBody] SecurityPolicyConfigDto dto)
    {
        var success = _service.UpdateSecurityPolicyConfig(dto);
        return Ok(new { success, message = "Firewall & IP Security policies updated successfully!" });
    }

    [HttpPost("whitelisted-ips")]
    public IActionResult SaveWhitelistedIp([FromBody] WhitelistedIpEntryDto dto)
    {
        var success = _service.AddOrUpdateWhitelistedIp(dto);
        return Ok(new { success, message = $"IP address '{dto.IpAddress}' whitelisted successfully!" });
    }

    [HttpDelete("whitelisted-ips/{id}")]
    public IActionResult DeleteWhitelistedIp(string id)
    {
        var success = _service.DeleteWhitelistedIp(id);
        return Ok(new { success, message = "Whitelisted IP removed successfully!" });
    }

    [HttpPost("whitelisted-domains")]
    public IActionResult SaveWhitelistedDomain([FromBody] WhitelistedDomainEntryDto dto)
    {
        var success = _service.AddOrUpdateWhitelistedDomain(dto);
        return Ok(new { success, message = $"Origin Domain '{dto.DomainUrl}' whitelisted successfully!" });
    }

    [HttpDelete("whitelisted-domains/{id}")]
    public IActionResult DeleteWhitelistedDomain(string id)
    {
        var success = _service.DeleteWhitelistedDomain(id);
        return Ok(new { success, message = "Whitelisted domain removed successfully!" });
    }

    // ==========================================
    // 3. Reseller Custom Domains & White-Label
    // ==========================================
    [HttpGet("domains")]
    public IActionResult GetDomains()
    {
        var domains = _service.GetResellerDomains();
        return Ok(new { success = true, domains });
    }

    [HttpPost("domains")]
    public IActionResult SaveDomain([FromBody] ResellerDomainMappingDto dto)
    {
        var success = _service.AddOrUpdateResellerDomain(dto);
        return Ok(new { success, message = $"Reseller Domain '{dto.CustomDomain}' saved and mapped successfully!" });
    }

    [HttpDelete("domains/{id}")]
    public IActionResult DeleteDomain(string id)
    {
        var success = _service.DeleteResellerDomain(id);
        return Ok(new { success, message = "Reseller Domain mapping deleted successfully!" });
    }

    [HttpPost("verify-domain")]
    public async Task<IActionResult> VerifyDomain([FromBody] DomainVerifyRequest request)
    {
        var result = await _service.VerifyDomainDnsAsync(request.Domain);
        return Ok(result);
    }

    // ==========================================
    // 4. DLT Sender ID Allocation
    // ==========================================
    [HttpGet("sender-ids")]
    public IActionResult GetSenderIds()
    {
        var senderIds = _service.GetSenderIdAllocations();
        return Ok(new { success = true, senderIds });
    }

    [HttpPost("sender-ids")]
    public IActionResult SaveSenderId([FromBody] SenderIdAllocationDto dto)
    {
        var success = _service.AddOrUpdateSenderIdAllocation(dto);
        return Ok(new { success, message = $"Sender ID '{dto.SenderId}' allocated to '{dto.ResellerName}' successfully!" });
    }

    [HttpDelete("sender-ids/{id}")]
    public IActionResult DeleteSenderId(string id)
    {
        var success = _service.DeleteSenderIdAllocation(id);
        return Ok(new { success, message = "Sender ID allocation removed successfully!" });
    }

    [HttpPost("verify-header")]
    public async Task<IActionResult> VerifyHeader([FromBody] HeaderVerifyRequest request)
    {
        var result = await _service.VerifyDltHeaderAsync(request.SenderId, request.EntityId);
        return Ok(result);
    }
}

public class DomainVerifyRequest
{
    public string Domain { get; set; } = string.Empty;
}

public class HeaderVerifyRequest
{
    public string SenderId { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
}
