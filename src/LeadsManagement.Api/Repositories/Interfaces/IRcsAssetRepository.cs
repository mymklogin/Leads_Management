using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Entities;

namespace LeadsManagement.Api.Repositories.Interfaces;

public interface IRcsAssetRepository
{
    // Bot Management
    Task<List<RcsBotRecord>> GetAllBotsAsync(int? userId = null, CancellationToken cancellationToken = default);
    Task<RcsBotRecord?> GetBotByIdAsync(string botId, CancellationToken cancellationToken = default);
    Task<RcsBotRecord> SaveBotAsync(RcsBotRecord bot, CancellationToken cancellationToken = default);
    Task<bool> UpdateBotStatusAsync(string botId, string status, string? reason = null, CancellationToken cancellationToken = default);
    Task<bool> DeleteBotAsync(string botId, CancellationToken cancellationToken = default);

    // Template Management
    Task<List<RcsTemplateRecord>> GetAllTemplatesAsync(int? userId = null, string? botId = null, CancellationToken cancellationToken = default);
    Task<RcsTemplateRecord?> GetTemplateByIdAsync(string templateId, CancellationToken cancellationToken = default);
    Task<RcsTemplateRecord> SaveTemplateAsync(RcsTemplateRecord template, CancellationToken cancellationToken = default);
    Task<bool> UpdateTemplateStatusAsync(string templateId, string status, string? reason = null, CancellationToken cancellationToken = default);
    Task<bool> DeleteTemplateAsync(string templateId, CancellationToken cancellationToken = default);
}
