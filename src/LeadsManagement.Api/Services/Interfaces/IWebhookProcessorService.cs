using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;

namespace LeadsManagement.Api.Services.Interfaces;

public interface IWebhookProcessorService
{
    Task<WebhookResultDto> ProcessWebhookAsync(
        ExpressIvrWebhookDto payload,
        int? overrideTemplateId = null,
        CancellationToken cancellationToken = default);
}
