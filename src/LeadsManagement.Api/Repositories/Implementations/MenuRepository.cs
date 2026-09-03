using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using LeadsManagement.Api.Helpers;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Repositories.Interfaces;

namespace LeadsManagement.Api.Repositories.Implementations;

public class MenuRepository : IMenuRepository
{
    private readonly string _Connection;

    public MenuRepository(DbConnectionHelpers Helpers)
    {
        _Connection = Helpers.Getdbconnection();
    }

    public async Task<List<MenuTreeNodeDto>> GetMenusByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var rawItems = new List<(AppMenu menu, bool canView, bool canCreate, bool canEdit, bool canDelete, bool canExport)>();

        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_GetMenusByUserId", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@UserId", userId);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            var menu = new AppMenu
            {
                Id = Convert.ToInt32(dr["Id"]),
                ServiceCode = Convert.ToString(dr["ServiceCode"]) ?? string.Empty,
                MenuKey = Convert.ToString(dr["MenuKey"]) ?? string.Empty,
                Title = Convert.ToString(dr["Title"]) ?? string.Empty,
                RoutePath = Convert.ToString(dr["RoutePath"]) ?? string.Empty,
                Icon = dr["Icon"] == DBNull.Value ? null : Convert.ToString(dr["Icon"]),
                ParentMenuId = dr["ParentMenuId"] == DBNull.Value ? null : Convert.ToInt32(dr["ParentMenuId"]),
                SortOrder = Convert.ToInt32(dr["SortOrder"]),
                IsActive = Convert.ToBoolean(dr["IsActive"])
            };

            bool canView = Convert.ToBoolean(dr["CanView"]);
            bool canCreate = Convert.ToBoolean(dr["CanCreate"]);
            bool canEdit = Convert.ToBoolean(dr["CanEdit"]);
            bool canDelete = Convert.ToBoolean(dr["CanDelete"]);
            bool canExport = Convert.ToBoolean(dr["CanExport"]);

            rawItems.Add((menu, canView, canCreate, canEdit, canDelete, canExport));
        }

        // Build Tree structure (Root -> Submenus)
        var roots = rawItems
            .Where(x => !x.menu.ParentMenuId.HasValue)
            .OrderBy(x => x.menu.SortOrder)
            .Select(x => new MenuTreeNodeDto
            {
                Id = x.menu.Id,
                ServiceCode = x.menu.ServiceCode,
                MenuKey = x.menu.MenuKey,
                Title = x.menu.Title,
                RoutePath = x.menu.RoutePath,
                Icon = x.menu.Icon,
                SortOrder = x.menu.SortOrder,
                CanView = x.canView,
                CanCreate = x.canCreate,
                CanEdit = x.canEdit,
                CanDelete = x.canDelete,
                CanExport = x.canExport,
                SubMenus = new List<MenuTreeNodeDto>()
            })
            .ToList();

        var subItems = rawItems.Where(x => x.menu.ParentMenuId.HasValue).ToList();
        foreach (var root in roots)
        {
            var children = subItems
                .Where(x => x.menu.ParentMenuId == root.Id)
                .OrderBy(x => x.menu.SortOrder)
                .Select(x => new MenuTreeNodeDto
                {
                    Id = x.menu.Id,
                    ServiceCode = x.menu.ServiceCode,
                    MenuKey = x.menu.MenuKey,
                    Title = x.menu.Title,
                    RoutePath = x.menu.RoutePath,
                    Icon = x.menu.Icon,
                    SortOrder = x.menu.SortOrder,
                    CanView = x.canView,
                    CanCreate = x.canCreate,
                    CanEdit = x.canEdit,
                    CanDelete = x.canDelete,
                    CanExport = x.canExport,
                    SubMenus = new List<MenuTreeNodeDto>()
                })
                .ToList();

            root.SubMenus = children;
        }

        return roots;
    }

    public async Task<List<AppMenu>> GetAllMasterMenusAsync(CancellationToken cancellationToken = default)
    {
        var list = new List<AppMenu>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_GetAllMasterMenus", con)
        {
            CommandType = CommandType.StoredProcedure
        };

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(MapMenu(dr));
        }
        return list;
    }

    public async Task<AppMenu?> GetMenuByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "SELECT * FROM [dbo].[AppMenus] WHERE [Id] = @Id";
        using SqlCommand cmd = new SqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", id);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapMenu(dr);
        }
        return null;
    }

    public async Task<AppMenu> CreateMasterMenuAsync(AppMenu menu, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_CreateMasterMenu", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@ServiceCode", menu.ServiceCode);
        cmd.Parameters.AddWithValue("@MenuKey", menu.MenuKey);
        cmd.Parameters.AddWithValue("@Title", menu.Title);
        cmd.Parameters.AddWithValue("@RoutePath", menu.RoutePath);
        cmd.Parameters.AddWithValue("@Icon", (object?)menu.Icon ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@ParentMenuId", (object?)menu.ParentMenuId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@SortOrder", menu.SortOrder);
        cmd.Parameters.AddWithValue("@IsActive", menu.IsActive);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapMenu(dr);
        }
        return menu;
    }

    public async Task<AppMenu?> UpdateMasterMenuAsync(AppMenu menu, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_UpdateMasterMenu", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Id", menu.Id);
        cmd.Parameters.AddWithValue("@ServiceCode", menu.ServiceCode);
        cmd.Parameters.AddWithValue("@MenuKey", (object?)menu.MenuKey ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Title", menu.Title);
        cmd.Parameters.AddWithValue("@RoutePath", menu.RoutePath);
        cmd.Parameters.AddWithValue("@Icon", (object?)menu.Icon ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@ParentMenuId", (object?)menu.ParentMenuId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@SortOrder", menu.SortOrder);
        cmd.Parameters.AddWithValue("@IsActive", menu.IsActive);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapMenu(dr);
        }
        return null;
    }

    public async Task<bool> DeleteMasterMenuAsync(int id, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_DeleteMasterMenu", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Id", id);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<List<UserMenuPermission>> GetUserPermissionsAsync(int userId, CancellationToken cancellationToken = default)
    {
        var list = new List<UserMenuPermission>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_GetUserMenuPermissions", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@UserId", userId);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(new UserMenuPermission
            {
                Id = Convert.ToInt32(dr["Id"]),
                UserId = Convert.ToInt32(dr["UserId"]),
                MenuId = Convert.ToInt32(dr["MenuId"]),
                CanView = Convert.ToBoolean(dr["CanView"]),
                CanCreate = Convert.ToBoolean(dr["CanCreate"]),
                CanEdit = Convert.ToBoolean(dr["CanEdit"]),
                CanDelete = Convert.ToBoolean(dr["CanDelete"]),
                CanExport = Convert.ToBoolean(dr["CanExport"]),
                AssignedByUserId = dr["AssignedByUserId"] == DBNull.Value ? null : Convert.ToInt32(dr["AssignedByUserId"]),
                AssignedAt = Convert.ToDateTime(dr["AssignedAt"])
            });
        }
        return list;
    }

    public async Task<bool> SaveUserPermissionAsync(
        int userId, int menuId, bool canView, bool canCreate, bool canEdit, bool canDelete, bool canExport,
        int? assignedByUserId, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_SaveUserMenuPermission", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@UserId", userId);
        cmd.Parameters.AddWithValue("@MenuId", menuId);
        cmd.Parameters.AddWithValue("@CanView", canView);
        cmd.Parameters.AddWithValue("@CanCreate", canCreate);
        cmd.Parameters.AddWithValue("@CanEdit", canEdit);
        cmd.Parameters.AddWithValue("@CanDelete", canDelete);
        cmd.Parameters.AddWithValue("@CanExport", canExport);
        cmd.Parameters.AddWithValue("@AssignedByUserId", (object?)assignedByUserId ?? DBNull.Value);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<bool> CascadeRevokePermissionsAsync(int parentUserId, List<int> revokedMenuIds, CancellationToken cancellationToken = default)
    {
        if (revokedMenuIds == null || !revokedMenuIds.Any()) return true;

        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);

        // Find all subordinate user IDs recursively
        string query = @"
            WITH UserTree AS (
                SELECT Id FROM [dbo].[Users] WHERE ParentUserId = @ParentUserId
                UNION ALL
                SELECT u.Id FROM [dbo].[Users] u
                INNER JOIN UserTree t ON u.ParentUserId = t.Id
            )
            DELETE FROM [dbo].[UserMenuPermissions]
            WHERE UserId IN (SELECT Id FROM UserTree)
              AND MenuId IN (" + string.Join(",", revokedMenuIds) + @");
        ";

        using SqlCommand cmd = new SqlCommand(query, con);
        cmd.Parameters.AddWithValue("@ParentUserId", parentUserId);

        await cmd.ExecuteNonQueryAsync(cancellationToken);
        return true;
    }

    private static AppMenu MapMenu(SqlDataReader dr)
    {
        return new AppMenu
        {
            Id = Convert.ToInt32(dr["Id"]),
            ServiceCode = Convert.ToString(dr["ServiceCode"]) ?? string.Empty,
            MenuKey = Convert.ToString(dr["MenuKey"]) ?? string.Empty,
            Title = Convert.ToString(dr["Title"]) ?? string.Empty,
            RoutePath = Convert.ToString(dr["RoutePath"]) ?? string.Empty,
            Icon = dr["Icon"] == DBNull.Value ? null : Convert.ToString(dr["Icon"]),
            ParentMenuId = dr["ParentMenuId"] == DBNull.Value ? null : Convert.ToInt32(dr["ParentMenuId"]),
            SortOrder = Convert.ToInt32(dr["SortOrder"]),
            IsActive = Convert.ToBoolean(dr["IsActive"])
        };
    }
}

