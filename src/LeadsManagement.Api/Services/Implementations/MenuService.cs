using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Models.Enums;
using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Implementations;

public class MenuService : IMenuService
{
    private readonly IMenuRepository _menuRepository;
    private readonly IUserRepository _userRepository;

    public MenuService(IMenuRepository menuRepository, IUserRepository userRepository)
    {
        _menuRepository = menuRepository;
        _userRepository = userRepository;
    }

    public async Task<List<MenuTreeNodeDto>> GetMyMenusAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null || !user.IsActive)
        {
            return new List<MenuTreeNodeDto>();
        }

        return await _menuRepository.GetMenusByUserIdAsync(userId, cancellationToken);
    }

    public async Task<List<AssignableMenuDto>> GetAssignableMenusAsync(
        int currentUserId,
        int targetUserId,
        CancellationToken cancellationToken = default)
    {
        var currentUser = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
        if (currentUser == null) return new List<AssignableMenuDto>();

        var allMenus = await _menuRepository.GetAllMasterMenusAsync(cancellationToken);
        var menuMap = allMenus.ToDictionary(m => m.Id);

        List<AppMenu> availableMenus;
        if (currentUser.Role == UserRole.SuperAdmin)
        {
            availableMenus = allMenus.Where(m => m.IsActive).OrderBy(m => m.ServiceCode).ThenBy(m => m.SortOrder).ToList();
        }
        else
        {
            var assignerPermissions = await _menuRepository.GetUserPermissionsAsync(currentUserId, cancellationToken);
            var allowedMenuIds = assignerPermissions.Where(p => p.CanView).Select(p => p.MenuId).ToHashSet();
            availableMenus = allMenus.Where(m => allowedMenuIds.Contains(m.Id) && m.IsActive).ToList();
        }

        var targetPermissions = (await _menuRepository.GetUserPermissionsAsync(targetUserId, cancellationToken))
            .ToDictionary(p => p.MenuId);

        return availableMenus.Select(m =>
        {
            bool hasPerm = targetPermissions.TryGetValue(m.Id, out var perm);
            string? parentTitle = m.ParentMenuId.HasValue && menuMap.TryGetValue(m.ParentMenuId.Value, out var parent) ? parent.Title : null;

            return new AssignableMenuDto
            {
                MenuId = m.Id,
                ServiceCode = m.ServiceCode,
                MenuKey = m.MenuKey,
                Title = m.Title,
                RoutePath = m.RoutePath,
                Icon = m.Icon,
                ParentMenuId = m.ParentMenuId,
                ParentMenuTitle = parentTitle,
                IsAssigned = hasPerm && perm!.CanView,
                CanView = hasPerm && perm!.CanView,
                CanCreate = hasPerm && perm!.CanCreate,
                CanEdit = hasPerm && perm!.CanEdit,
                CanDelete = hasPerm && perm!.CanDelete,
                CanExport = hasPerm && perm!.CanExport
            };
        }).ToList();
    }

    public async Task<bool> AssignPermissionsAsync(
        int currentUserId,
        AssignMenuPermissionsDto dto,
        CancellationToken cancellationToken = default)
    {
        var currentUser = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
        var targetUser = await _userRepository.GetByIdAsync(dto.TargetUserId, cancellationToken);

        if (currentUser == null || targetUser == null)
        {
            throw new ArgumentException("Invalid user specified.");
        }

        if (currentUser.Role != UserRole.SuperAdmin && targetUser.ParentUserId != currentUserId)
        {
            var downline = await _userRepository.GetDownlineUserIdsAsync(currentUserId, cancellationToken);
            if (!downline.Contains(targetUser.Id))
            {
                throw new UnauthorizedAccessException("You can only assign permissions to your own subordinate users.");
            }
        }

        if (currentUser.Role != UserRole.SuperAdmin)
        {
            var assignerPerms = await _menuRepository.GetUserPermissionsAsync(currentUserId, cancellationToken);
            var allowedMenuIds = assignerPerms.Where(p => p.CanView).Select(p => p.MenuId).ToList();

            var requestedIds = dto.Permissions.Where(p => p.CanView).Select(p => p.MenuId).ToList();
            var unauthorized = requestedIds.Except(allowedMenuIds).ToList();
            if (unauthorized.Any())
            {
                throw new UnauthorizedAccessException($"You cannot grant permissions for menus you do not have access to (Menu IDs: {string.Join(", ", unauthorized)}).");
            }
        }

        var existingPerms = await _menuRepository.GetUserPermissionsAsync(dto.TargetUserId, cancellationToken);
        var requestedMenuIds = dto.Permissions.Where(p => p.CanView).Select(p => p.MenuId).ToHashSet();
        var existingMenuIds = existingPerms.Where(p => p.CanView).Select(p => p.MenuId).ToHashSet();

        var revokedMenuIds = existingMenuIds.Except(requestedMenuIds).ToList();

        // Save requested permissions
        foreach (var item in dto.Permissions)
        {
            await _menuRepository.SaveUserPermissionAsync(
                dto.TargetUserId, item.MenuId, item.CanView, item.CanCreate, item.CanEdit, item.CanDelete, item.CanExport,
                currentUserId, cancellationToken);
        }

        // Revoke any unchecked menus
        foreach (var revokedId in revokedMenuIds)
        {
            await _menuRepository.SaveUserPermissionAsync(
                dto.TargetUserId, revokedId, false, false, false, false, false, currentUserId, cancellationToken);
        }

        // Cascade auto-revocation to downline subordinates
        if (revokedMenuIds.Any())
        {
            await _menuRepository.CascadeRevokePermissionsAsync(dto.TargetUserId, revokedMenuIds, cancellationToken);
        }

        return true;
    }

    public async Task<List<AppMenuDto>> GetAllMasterMenusAsync(CancellationToken cancellationToken = default)
    {
        var list = await _menuRepository.GetAllMasterMenusAsync(cancellationToken);
        return list.Select(m => new AppMenuDto
        {
            Id = m.Id,
            ServiceCode = m.ServiceCode,
            MenuKey = m.MenuKey,
            Title = m.Title,
            RoutePath = m.RoutePath,
            Icon = m.Icon,
            ParentMenuId = m.ParentMenuId,
            SortOrder = m.SortOrder,
            IsActive = m.IsActive
        }).ToList();
    }

    public async Task<AppMenuDto> CreateMasterMenuAsync(CreateMenuDto dto, CancellationToken cancellationToken = default)
    {
        var menu = new AppMenu
        {
            ServiceCode = dto.ServiceCode.Trim().ToUpperInvariant(),
            MenuKey = dto.MenuKey.Trim().ToUpperInvariant(),
            Title = dto.Title.Trim(),
            RoutePath = dto.RoutePath.Trim(),
            Icon = dto.Icon?.Trim(),
            ParentMenuId = dto.ParentMenuId,
            SortOrder = dto.SortOrder,
            IsActive = true
        };

        var created = await _menuRepository.CreateMasterMenuAsync(menu, cancellationToken);

        return new AppMenuDto
        {
            Id = created.Id,
            ServiceCode = created.ServiceCode,
            MenuKey = created.MenuKey,
            Title = created.Title,
            RoutePath = created.RoutePath,
            Icon = created.Icon,
            ParentMenuId = created.ParentMenuId,
            SortOrder = created.SortOrder,
            IsActive = created.IsActive
        };
    }

    public async Task<AppMenuDto?> UpdateMasterMenuAsync(int id, UpdateMenuDto dto, CancellationToken cancellationToken = default)
    {
        var menu = await _menuRepository.GetMenuByIdAsync(id, cancellationToken);
        if (menu == null) return null;

        menu.ServiceCode = dto.ServiceCode.Trim().ToUpperInvariant();
        if (!string.IsNullOrWhiteSpace(dto.MenuKey))
        {
            menu.MenuKey = dto.MenuKey.Trim().ToUpperInvariant();
        }
        menu.Title = dto.Title.Trim();
        menu.RoutePath = dto.RoutePath.Trim();
        menu.Icon = dto.Icon?.Trim();
        menu.ParentMenuId = dto.ParentMenuId;
        menu.SortOrder = dto.SortOrder;
        menu.IsActive = dto.IsActive;

        var updated = await _menuRepository.UpdateMasterMenuAsync(menu, cancellationToken);
        if (updated == null) return null;

        return new AppMenuDto
        {
            Id = updated.Id,
            ServiceCode = updated.ServiceCode,
            MenuKey = updated.MenuKey,
            Title = updated.Title,
            RoutePath = updated.RoutePath,
            Icon = updated.Icon,
            ParentMenuId = updated.ParentMenuId,
            SortOrder = updated.SortOrder,
            IsActive = updated.IsActive
        };
    }

    public async Task<bool> DeleteMasterMenuAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _menuRepository.DeleteMasterMenuAsync(id, cancellationToken);
    }
}

