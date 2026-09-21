using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Entities;

namespace LeadsManagement.Api.Repositories.Interfaces;

public interface IRcsTransactionRepository
{
    Task<RcsTransactionLog> TransferAsync(int actorId, int targetId, string service, string action, decimal credits,
        decimal rate, string? notes, System.Guid requestId, CancellationToken cancellationToken = default);
    Task<int> InsertTransactionAsync(RcsTransactionLog tx, CancellationToken cancellationToken = default);
    Task<List<RcsTransactionLog>> GetTransactionsByUserIdAsync(int userId, int limit = 50, CancellationToken cancellationToken = default);
    Task<List<RcsTransactionLog>> GetAllTransactionsAsync(CancellationToken cancellationToken = default);
}

