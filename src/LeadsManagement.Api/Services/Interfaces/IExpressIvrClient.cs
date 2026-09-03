using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;

namespace LeadsManagement.Api.Services.Interfaces;

public interface IExpressIvrClient
{
    ExpressIvrSingleCallPayload BuildPayload(AdvancedCallRequestDto request);
    ExpressIvrSingleCallPayload BuildSimplePayload(SimpleCallRequestDto request);
    Task<SingleCallResponseDto> SendSingleCallAsync(SimpleCallRequestDto request, CancellationToken cancellationToken = default);
    Task<SingleCallResponseDto> SendAdvancedSingleCallAsync(AdvancedCallRequestDto request, CancellationToken cancellationToken = default);
    IEnumerable<TemplateInfoDto> GetAllTemplateDefinitions(string? webhookBaseUrl = null);
    TemplateInfoDto? GetTemplateDefinition(int templateId, string? webhookBaseUrl = null);
}
