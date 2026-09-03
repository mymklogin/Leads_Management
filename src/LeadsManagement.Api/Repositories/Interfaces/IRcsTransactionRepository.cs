using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Entities;

namespace LeadsManagement.Api.Repositories.Interfaces;

public interface IRcsTransactionRepository
{
    Task<int> InsertTransactionAsync(RcsTransactionLog tx, CancellationToken cancellationToken = default);
    Task<List<RcsTransactionLog>> GetTransactionsByUserIdAsync(int userId, int limit = 50, CancellationToken cancellationToken = default);
    Task<List<RcsTransactionLog>> GetAllTransactionsAsync(CancellationToken cancellationToken = default);
}

