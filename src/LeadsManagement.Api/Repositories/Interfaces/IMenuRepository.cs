using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;

namespace LeadsManagement.Api.Repositories.Interfaces;

public interface IMenuRepository
{
    Task<List<MenuTreeNodeDto>> GetMenusByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<AppMenu>> GetAllMasterMenusAsync(CancellationToken cancellationToken = default);
    Task<AppMenu?> GetMenuByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<AppMenu> CreateMasterMenuAsync(AppMenu menu, CancellationToken cancellationToken = default);
    Task<AppMenu?> UpdateMasterMenuAsync(AppMenu menu, CancellationToken cancellationToken = default);
    Task<bool> DeleteMasterMenuAsync(int id, CancellationToken cancellationToken = default);
    Task<List<UserMenuPermission>> GetUserPermissionsAsync(int userId, CancellationToken cancellationToken = default);
    Task<bool> SaveUserPermissionAsync(int userId, int menuId, bool canView, bool canCreate, bool canEdit, bool canDelete, bool canExport, int? assignedByUserId, CancellationToken cancellationToken = default);
    Task<bool> CascadeRevokePermissionsAsync(int parentUserId, List<int> revokedMenuIds, CancellationToken cancellationToken = default);
}

