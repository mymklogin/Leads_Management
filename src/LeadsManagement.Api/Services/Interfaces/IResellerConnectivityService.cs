using System.Collections.Generic;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;

namespace LeadsManagement.Api.Services.Interfaces;

public interface IResellerConnectivityService
{
    // Module 1: Inbound SMPP Server
    ResellerSmppServerConfigDto GetSmppServerConfig();
    bool UpdateSmppServerConfig(ResellerSmppServerConfigDto dto);
    bool AddOrUpdateSmppAccount(ResellerSmppAccountDto dto);
    bool DeleteSmppAccount(string id);
    List<ResellerSmppLiveBindDto> GetLiveBinds();

    // Module 2: IP & Domain Security Whitelist
    SecurityPolicyConfigDto GetSecurityPolicyConfig();
    bool UpdateSecurityPolicyConfig(SecurityPolicyConfigDto dto);
    bool AddOrUpdateWhitelistedIp(WhitelistedIpEntryDto dto);
    bool DeleteWhitelistedIp(string id);
    bool AddOrUpdateWhitelistedDomain(WhitelistedDomainEntryDto dto);
    bool DeleteWhitelistedDomain(string id);

    // Module 3: Reseller Custom Domains & White-Label
    List<ResellerDomainMappingDto> GetResellerDomains();
    bool AddOrUpdateResellerDomain(ResellerDomainMappingDto dto);
    bool DeleteResellerDomain(string id);
    Task<object> VerifyDomainDnsAsync(string domain);

    // Module 4: DLT Sender ID Allocation
    List<SenderIdAllocationDto> GetSenderIdAllocations();
    bool AddOrUpdateSenderIdAllocation(SenderIdAllocationDto dto);
    bool DeleteSenderIdAllocation(string id);
    Task<object> VerifyDltHeaderAsync(string senderId, string entityId);
}
