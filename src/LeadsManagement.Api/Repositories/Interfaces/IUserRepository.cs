using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Entities;

namespace LeadsManagement.Api.Repositories.Interfaces;

public interface IUserRepository
{
    Task<AppUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<AppUser?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<AppUser>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    Task<List<AppUser>> GetSubordinateUsersAsync(int parentUserId, CancellationToken cancellationToken = default);
    Task<int> CreateUserAsync(AppUser user, CancellationToken cancellationToken = default);
    Task<bool> UpdateUserAsync(AppUser user, CancellationToken cancellationToken = default);
    Task<bool> UpdateCreditsAsync(int userId, decimal voice, decimal whatsapp, decimal rcs, decimal sms, CancellationToken cancellationToken = default);
    Task<bool> UpdateLastLoginAsync(int userId, CancellationToken cancellationToken = default);
    Task<bool> ExistsByUsernameOrEmailAsync(string username, string email, CancellationToken cancellationToken = default);
    Task<bool> UpdatePasswordAsync(int userId, string passwordHash, CancellationToken cancellationToken = default);
    Task<bool> DeleteUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<int>> GetDownlineUserIdsAsync(int parentId, CancellationToken cancellationToken = default);
}

