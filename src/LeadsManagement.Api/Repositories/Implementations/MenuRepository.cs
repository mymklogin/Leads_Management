using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Npgsql;
using LeadsManagement.Api.Helpers;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Repositories.Interfaces;

namespace LeadsManagement.Api.Repositories.Implementations;

public class MenuRepository : IMenuRepository
{
    private readonly string _connection;

    public MenuRepository(DbConnectionHelpers helpers)
    {
        _connection = helpers.Getdbconnection();
    }

    public async Task<List<MenuTreeNodeDto>> GetMenusByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var rawItems = new List<(AppMenu menu, bool canView, bool canCreate, bool canEdit, bool canDelete, bool canExport)>();

        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        // Check user role: 1 = SuperAdmin
        int userRole = 0;
        const string roleQuery = "SELECT role FROM users WHERE id = @UserId;";
        await using (var roleCmd = new NpgsqlCommand(roleQuery, con))
        {
            roleCmd.Parameters.AddWithValue("@UserId", userId);
            var roleObj = await roleCmd.ExecuteScalarAsync(cancellationToken);
            if (roleObj != null && int.TryParse(roleObj.ToString(), out int r))
            {
                userRole = r;
            }
        }

        string query;
        if (userRole == 1) // SuperAdmin has access to all active menus
        {
            query = @"
                SELECT m.id, m.servicecode, m.menukey, m.title, m.routepath, m.icon, m.parentmenuid, m.sortorder, m.isactive,
                       TRUE AS canview, TRUE AS cancreate, TRUE AS canedit, TRUE AS candelete, TRUE AS canexport
                FROM appmenus m
                WHERE m.isactive = TRUE
                ORDER BY m.sortorder;";
        }
        else
        {
            query = @"
                SELECT m.id, m.servicecode, m.menukey, m.title, m.routepath, m.icon, m.parentmenuid, m.sortorder, m.isactive,
                       p.canview, p.cancreate, p.canedit, p.candelete, p.canexport
                FROM appmenus m
                INNER JOIN usermenupermissions p ON m.id = p.menuid
                WHERE p.userid = @UserId AND p.canview = TRUE AND m.isactive = TRUE
                ORDER BY m.sortorder;";
        }

        await using var cmd = new NpgsqlCommand(query, con);
        if (userRole != 1)
        {
            cmd.Parameters.AddWithValue("@UserId", userId);
        }

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            var menu = new AppMenu
            {
                Id = Convert.ToInt32(dr["id"]),
                ServiceCode = Convert.ToString(dr["servicecode"]) ?? string.Empty,
                MenuKey = Convert.ToString(dr["menukey"]) ?? string.Empty,
                Title = Convert.ToString(dr["title"]) ?? string.Empty,
                RoutePath = Convert.ToString(dr["routepath"]) ?? string.Empty,
                Icon = dr["icon"] == DBNull.Value ? null : Convert.ToString(dr["icon"]),
                ParentMenuId = dr["parentmenuid"] == DBNull.Value ? null : Convert.ToInt32(dr["parentmenuid"]),
                SortOrder = Convert.ToInt32(dr["sortorder"]),
                IsActive = Convert.ToBoolean(dr["isactive"])
            };

            bool canView = Convert.ToBoolean(dr["canview"]);
            bool canCreate = Convert.ToBoolean(dr["cancreate"]);
            bool canEdit = Convert.ToBoolean(dr["canedit"]);
            bool canDelete = Convert.ToBoolean(dr["candelete"]);
            bool canExport = Convert.ToBoolean(dr["canexport"]);

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
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, servicecode, menukey, title, routepath, icon, parentmenuid, sortorder, isactive
            FROM appmenus
            ORDER BY sortorder;";

        await using var cmd = new NpgsqlCommand(query, con);
        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(MapMenu(dr));
        }
        return list;
    }

    public async Task<AppMenu?> GetMenuByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = "SELECT id, servicecode, menukey, title, routepath, icon, parentmenuid, sortorder, isactive FROM appmenus WHERE id = @Id;";
        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", id);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapMenu(dr);
        }
        return null;
    }

    public async Task<AppMenu> CreateMasterMenuAsync(AppMenu menu, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            INSERT INTO appmenus (servicecode, menukey, title, routepath, icon, parentmenuid, sortorder, isactive)
            VALUES (@ServiceCode, @MenuKey, @Title, @RoutePath, @Icon, @ParentMenuId, @SortOrder, @IsActive)
            RETURNING id, servicecode, menukey, title, routepath, icon, parentmenuid, sortorder, isactive;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@ServiceCode", menu.ServiceCode);
        cmd.Parameters.AddWithValue("@MenuKey", menu.MenuKey);
        cmd.Parameters.AddWithValue("@Title", menu.Title);
        cmd.Parameters.AddWithValue("@RoutePath", menu.RoutePath);
        cmd.Parameters.AddWithValue("@Icon", (object?)menu.Icon ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@ParentMenuId", (object?)menu.ParentMenuId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@SortOrder", menu.SortOrder);
        cmd.Parameters.AddWithValue("@IsActive", menu.IsActive);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapMenu(dr);
        }
        return menu;
    }

    public async Task<AppMenu?> UpdateMasterMenuAsync(AppMenu menu, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            UPDATE appmenus
            SET servicecode = @ServiceCode,
                menukey = COALESCE(@MenuKey, menukey),
                title = @Title,
                routepath = @RoutePath,
                icon = @Icon,
                parentmenuid = @ParentMenuId,
                sortorder = @SortOrder,
                isactive = @IsActive
            WHERE id = @Id
            RETURNING id, servicecode, menukey, title, routepath, icon, parentmenuid, sortorder, isactive;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", menu.Id);
        cmd.Parameters.AddWithValue("@ServiceCode", menu.ServiceCode);
        cmd.Parameters.AddWithValue("@MenuKey", (object?)menu.MenuKey ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Title", menu.Title);
        cmd.Parameters.AddWithValue("@RoutePath", menu.RoutePath);
        cmd.Parameters.AddWithValue("@Icon", (object?)menu.Icon ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@ParentMenuId", (object?)menu.ParentMenuId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@SortOrder", menu.SortOrder);
        cmd.Parameters.AddWithValue("@IsActive", menu.IsActive);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapMenu(dr);
        }
        return null;
    }

    public async Task<bool> DeleteMasterMenuAsync(int id, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = "DELETE FROM appmenus WHERE id = @Id;";
        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", id);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<List<UserMenuPermission>> GetUserPermissionsAsync(int userId, CancellationToken cancellationToken = default)
    {
        var list = new List<UserMenuPermission>();
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, userid, menuid, canview, cancreate, canedit, candelete, canexport, assignedbyuserid, assignedat
            FROM usermenupermissions
            WHERE userid = @UserId;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@UserId", userId);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(new UserMenuPermission
            {
                Id = Convert.ToInt32(dr["id"]),
                UserId = Convert.ToInt32(dr["userid"]),
                MenuId = Convert.ToInt32(dr["menuid"]),
                CanView = Convert.ToBoolean(dr["canview"]),
                CanCreate = Convert.ToBoolean(dr["cancreate"]),
                CanEdit = Convert.ToBoolean(dr["canedit"]),
                CanDelete = Convert.ToBoolean(dr["candelete"]),
                CanExport = Convert.ToBoolean(dr["canexport"]),
                AssignedByUserId = dr["assignedbyuserid"] == DBNull.Value ? null : Convert.ToInt32(dr["assignedbyuserid"]),
                AssignedAt = Convert.ToDateTime(dr["assignedat"])
            });
        }
        return list;
    }

    public async Task<bool> SaveUserPermissionAsync(
        int userId, int menuId, bool canView, bool canCreate, bool canEdit, bool canDelete, bool canExport,
        int? assignedByUserId, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            INSERT INTO usermenupermissions (userid, menuid, canview, cancreate, canedit, candelete, canexport, assignedbyuserid, assignedat)
            VALUES (@UserId, @MenuId, @CanView, @CanCreate, @CanEdit, @CanDelete, @CanExport, @AssignedByUserId, CURRENT_TIMESTAMP)
            ON CONFLICT (userid, menuid) DO UPDATE SET 
                canview = EXCLUDED.canview,
                cancreate = EXCLUDED.cancreate,
                canedit = EXCLUDED.canedit,
                candelete = EXCLUDED.candelete,
                canexport = EXCLUDED.canexport,
                assignedbyuserid = EXCLUDED.assignedbyuserid,
                assignedat = CURRENT_TIMESTAMP;";

        await using var cmd = new NpgsqlCommand(query, con);
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
        if (revokedMenuIds == null || revokedMenuIds.Count == 0) return true;

        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            WITH RECURSIVE subordinates AS (
                SELECT id FROM users WHERE parentuserid = @ParentUserId
                UNION ALL
                SELECT u.id FROM users u
                INNER JOIN subordinates s ON u.parentuserid = s.id
            )
            DELETE FROM usermenupermissions
            WHERE userid IN (SELECT id FROM subordinates)
              AND menuid = ANY(@RevokedMenuIds);";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@ParentUserId", parentUserId);
        cmd.Parameters.AddWithValue("@RevokedMenuIds", revokedMenuIds.ToArray());

        await cmd.ExecuteNonQueryAsync(cancellationToken);
        return true;
    }

    private static AppMenu MapMenu(NpgsqlDataReader dr)
    {
        return new AppMenu
        {
            Id = Convert.ToInt32(dr["id"]),
            ServiceCode = Convert.ToString(dr["servicecode"]) ?? string.Empty,
            MenuKey = Convert.ToString(dr["menukey"]) ?? string.Empty,
            Title = Convert.ToString(dr["title"]) ?? string.Empty,
            RoutePath = Convert.ToString(dr["routepath"]) ?? string.Empty,
            Icon = dr["icon"] == DBNull.Value ? null : Convert.ToString(dr["icon"]),
            ParentMenuId = dr["parentmenuid"] == DBNull.Value ? null : Convert.ToInt32(dr["parentmenuid"]),
            SortOrder = Convert.ToInt32(dr["sortorder"]),
            IsActive = Convert.ToBoolean(dr["isactive"])
        };
    }
}
