using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Repositories.Interfaces;

namespace LeadsManagement.Api.Services.Interfaces;

public interface ITemplateWebhookStrategy
{
    int TemplateId { get; }
    Task<WebhookResultDto> ProcessWebhookAsync(ExpressIvrWebhookDto payload, ILeadRepository leadRepository, CancellationToken cancellationToken);
}

