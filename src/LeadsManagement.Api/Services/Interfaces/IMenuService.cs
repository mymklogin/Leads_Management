using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;

namespace LeadsManagement.Api.Services.Interfaces;

public interface IMenuService
{
    Task<List<MenuTreeNodeDto>> GetMyMenusAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<AssignableMenuDto>> GetAssignableMenusAsync(int currentUserId, int targetUserId, CancellationToken cancellationToken = default);
    Task<bool> AssignPermissionsAsync(int currentUserId, AssignMenuPermissionsDto dto, CancellationToken cancellationToken = default);
    Task<List<AppMenuDto>> GetAllMasterMenusAsync(CancellationToken cancellationToken = default);
    Task<AppMenuDto> CreateMasterMenuAsync(CreateMenuDto dto, CancellationToken cancellationToken = default);
    Task<AppMenuDto?> UpdateMasterMenuAsync(int id, UpdateMenuDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteMasterMenuAsync(int id, CancellationToken cancellationToken = default);
}
