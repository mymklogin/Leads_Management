using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Entities;

namespace LeadsManagement.Api.Repositories.Interfaces;

public interface IWebhookLogRepository
{
    Task<int> InsertWebhookLogAsync(WebhookLog log, CancellationToken cancellationToken = default);
    Task<List<WebhookLog>> GetRecentLogsAsync(int limit = 100, CancellationToken cancellationToken = default);
}

