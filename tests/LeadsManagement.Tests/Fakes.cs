using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Models.Enums;
using LeadsManagement.Api.Repositories.Interfaces;

namespace LeadsManagement.Tests;

public class FakeLeadRepository : ILeadRepository
{
    public readonly List<LeadRecord> Leads = new();
    private int _nextId = 1;

    public Task<List<LeadRecord>> GetLeadsAsync(string? status, int? templateId, string? mobile, int pageNumber = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var q = Leads.AsQueryable();
        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(l => l.LeadStatus.Contains(status, StringComparison.OrdinalIgnoreCase));
        if (templateId.HasValue)
            q = q.Where(l => l.TemplateId == templateId.Value);
        if (!string.IsNullOrWhiteSpace(mobile))
            q = q.Where(l => l.Mobile.Contains(mobile));

        var items = q.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        return Task.FromResult(items);
    }

    public Task<int> CreateOrUpdateLeadAsync(LeadRecord lead, CancellationToken cancellationToken = default)
    {
        var existing = Leads.FirstOrDefault(l => l.Mobile == lead.Mobile);
        if (existing != null)
        {
            existing.CustomerName = lead.CustomerName ?? existing.CustomerName;
            existing.TemplateId = lead.TemplateId;
            existing.LeadStatus = lead.LeadStatus;
            existing.CallDuration = lead.CallDuration;
            existing.PressedDtmf = lead.PressedDtmf ?? existing.PressedDtmf;
            existing.LastEventType = lead.LastEventType ?? existing.LastEventType;
            existing.Cli = lead.Cli ?? existing.Cli;
            existing.Notes = lead.Notes ?? existing.Notes;
            existing.CustomData = lead.CustomData ?? existing.CustomData;
            existing.UserId = lead.UserId ?? existing.UserId;
            existing.AssignedToUserId = lead.AssignedToUserId ?? existing.AssignedToUserId;
            existing.UpdatedAt = DateTime.UtcNow;
            return Task.FromResult(existing.Id);
        }
        else
        {
            lead.Id = _nextId++;
            lead.CreatedAt = DateTime.UtcNow;
            lead.UpdatedAt = DateTime.UtcNow;
            Leads.Add(lead);
            return Task.FromResult(lead.Id);
        }
    }

    public Task<LeadRecord?> GetLeadByMobileAsync(string mobile, CancellationToken cancellationToken = default)
    {
        var item = Leads.FirstOrDefault(l => l.Mobile == mobile);
        return Task.FromResult(item);
    }

    public Task<LeadRecord?> GetLeadByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = Leads.FirstOrDefault(l => l.Id == id);
        return Task.FromResult(item);
    }

    public Task<bool> DeleteLeadAsync(int id, CancellationToken cancellationToken = default)
    {
        var count = Leads.RemoveAll(l => l.Id == id);
        return Task.FromResult(count > 0);
    }

    public Task<List<LeadRecord>> GetAllLeadsRawAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Leads.ToList());
    }

    public Task<Dictionary<string, int>> GetLeadCountByStatusAsync(CancellationToken cancellationToken = default)
    {
        var dict = Leads.GroupBy(l => l.LeadStatus).ToDictionary(g => g.Key, g => g.Count());
        return Task.FromResult(dict);
    }

    public Task<Dictionary<int, int>> GetLeadCountByTemplateAsync(CancellationToken cancellationToken = default)
    {
        var dict = Leads.GroupBy(l => l.TemplateId ?? 0).ToDictionary(g => g.Key, g => g.Count());
        return Task.FromResult(dict);
    }
}

public class FakeUserRepository : IUserRepository
{
    public readonly List<AppUser> Users = new();
    private int _nextId = 1;

    public FakeUserRepository()
    {
        // Seed initial SuperAdmin
        Users.Add(new AppUser
        {
            Id = 1,
            Username = "Abhishaarod",
            Email = "Abhishaarod@rcsflow.io",
            PasswordHash = "hash",
            FullName = "Abhishaarod",
            PhoneNumber = "9999900000",
            Role = UserRole.SuperAdmin,
            IsActive = true,
            VoiceCredits = 100000,
            WhatsAppCredits = 100000,
            RcsCredits = 100000,
            SmsCredits = 100000
        });
        _nextId = 2;
    }

    public Task<AppUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        var user = Users.FirstOrDefault(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(user);
    }

    public Task<AppUser?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = Users.FirstOrDefault(u => u.Id == id);
        return Task.FromResult(user);
    }

    public Task<List<AppUser>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Users.ToList());
    }

    public Task<List<AppUser>> GetSubordinateUsersAsync(int parentUserId, CancellationToken cancellationToken = default)
    {
        var subs = Users.Where(u => u.ParentUserId == parentUserId).ToList();
        return Task.FromResult(subs);
    }

    public Task<int> CreateUserAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        user.Id = _nextId++;
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        Users.Add(user);
        return Task.FromResult(user.Id);
    }

    public Task<bool> UpdateUserAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        var existing = Users.FirstOrDefault(u => u.Id == user.Id);
        if (existing == null) return Task.FromResult(false);
        existing.FullName = user.FullName;
        existing.PhoneNumber = user.PhoneNumber;
        existing.Role = user.Role;
        existing.IsActive = user.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;
        return Task.FromResult(true);
    }

    public Task<bool> UpdateCreditsAsync(int userId, decimal voice, decimal whatsapp, decimal rcs, decimal sms, CancellationToken cancellationToken = default)
    {
        var existing = Users.FirstOrDefault(u => u.Id == userId);
        if (existing == null) return Task.FromResult(false);
        existing.VoiceCredits = voice;
        existing.WhatsAppCredits = whatsapp;
        existing.RcsCredits = rcs;
        existing.SmsCredits = sms;
        return Task.FromResult(true);
    }

    public Task<bool> UpdateLastLoginAsync(int userId, CancellationToken cancellationToken = default)
    {
        var existing = Users.FirstOrDefault(u => u.Id == userId);
        if (existing == null) return Task.FromResult(false);
        existing.UpdatedAt = DateTime.UtcNow;
        return Task.FromResult(true);
    }

    public Task<bool> ExistsByUsernameOrEmailAsync(string username, string email, CancellationToken cancellationToken = default)
    {
        var exists = Users.Any(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase) || u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(exists);
    }

    public Task<bool> UpdatePasswordAsync(int userId, string passwordHash, CancellationToken cancellationToken = default)
    {
        var existing = Users.FirstOrDefault(u => u.Id == userId);
        if (existing == null) return Task.FromResult(false);
        existing.PasswordHash = passwordHash;
        return Task.FromResult(true);
    }

    public Task<bool> DeleteUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var count = Users.RemoveAll(u => u.Id == userId);
        return Task.FromResult(count > 0);
    }

    public Task<List<int>> GetDownlineUserIdsAsync(int parentId, CancellationToken cancellationToken = default)
    {
        var result = new List<int>();
        void Traverse(int pid)
        {
            var children = Users.Where(u => u.ParentUserId == pid).Select(u => u.Id).ToList();
            foreach (var cid in children)
            {
                result.Add(cid);
                Traverse(cid);
            }
        }
        Traverse(parentId);
        return Task.FromResult(result);
    }
}

public class FakeMenuRepository : IMenuRepository
{
    public readonly List<AppMenu> Menus = new();
    public readonly List<UserMenuPermission> Permissions = new();
    public FakeUserRepository? UserRepo { get; set; }

    public FakeMenuRepository()
    {
        // Default seed menus
        Menus.AddRange(new[]
        {
            new AppMenu { Id = 1, ServiceCode = "DASHBOARD", MenuKey = "DASHBOARD", Title = "Dashboard", RoutePath = "/dashboard", Icon = "fa-tachometer-alt", SortOrder = 1, IsActive = true },
            new AppMenu { Id = 2, ServiceCode = "VOICE", MenuKey = "VOICE_OBD", Title = "Voice OBD Calls", RoutePath = "/voice", Icon = "fa-phone-volume", SortOrder = 2, IsActive = true },
            new AppMenu { Id = 3, ServiceCode = "WHATSAPP", MenuKey = "WHATSAPP", Title = "WhatsApp Messaging", RoutePath = "/whatsapp", Icon = "fab fa-whatsapp", SortOrder = 3, IsActive = true },
            new AppMenu { Id = 4, ServiceCode = "WHATSAPP", MenuKey = "WHATSAPP_BROADCAST", Title = "WhatsApp Broadcast", RoutePath = "/whatsapp/broadcast", Icon = "fa-paper-plane", ParentMenuId = 3, SortOrder = 1, IsActive = true },
            new AppMenu { Id = 5, ServiceCode = "RCS", MenuKey = "RCS_MESSAGING", Title = "RCS Messaging", RoutePath = "/rcs", Icon = "fa-comment-alt", SortOrder = 4, IsActive = true },
            new AppMenu { Id = 6, ServiceCode = "SMS", MenuKey = "SMS_GATEWAY", Title = "SMS Gateway", RoutePath = "/sms", Icon = "fa-sms", SortOrder = 5, IsActive = true },
            new AppMenu { Id = 7, ServiceCode = "LEADS_CRM", MenuKey = "LEADS_CRM", Title = "Leads CRM", RoutePath = "/leads", Icon = "fa-users-cog", SortOrder = 6, IsActive = true },
            new AppMenu { Id = 8, ServiceCode = "USER_MANAGEMENT", MenuKey = "USER_MANAGEMENT", Title = "Users & Resellers", RoutePath = "/users", Icon = "fa-user-friends", SortOrder = 7, IsActive = true },
            new AppMenu { Id = 9, ServiceCode = "REPORTS", MenuKey = "REPORTS", Title = "Reports & Analytics", RoutePath = "/analytics", Icon = "fa-chart-pie", SortOrder = 8, IsActive = true },
            new AppMenu { Id = 10, ServiceCode = "VOICE", MenuKey = "VOICE_SINGLE_CALL", Title = "Single OBD Call", RoutePath = "/voice/single", Icon = "fa-phone", ParentMenuId = 2, SortOrder = 1, IsActive = true }
        });

        // Grant all permissions to SuperAdmin (User ID 1)
        foreach (var m in Menus)
        {
            Permissions.Add(new UserMenuPermission
            {
                UserId = 1,
                MenuId = m.Id,
                CanView = true,
                CanCreate = true,
                CanEdit = true,
                CanDelete = true,
                CanExport = true
            });
        }
    }

    public Task<List<MenuTreeNodeDto>> GetMenusByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var allowedMenuIds = Permissions
            .Where(p => p.UserId == userId && p.CanView)
            .Select(p => p.MenuId)
            .ToHashSet();

        var allowedMenus = Menus.Where(m => allowedMenuIds.Contains(m.Id) && m.IsActive).ToList();
        var roots = allowedMenus.Where(m => m.ParentMenuId == null).OrderBy(m => m.SortOrder).ToList();

        var result = roots.Select(r => new MenuTreeNodeDto
        {
            Id = r.Id,
            ServiceCode = r.ServiceCode,
            MenuKey = r.MenuKey,
            Title = r.Title,
            RoutePath = r.RoutePath,
            Icon = r.Icon,
            SortOrder = r.SortOrder,
            CanCreate = Permissions.Any(p => p.UserId == userId && p.MenuId == r.Id && p.CanCreate),
            CanEdit = Permissions.Any(p => p.UserId == userId && p.MenuId == r.Id && p.CanEdit),
            CanDelete = Permissions.Any(p => p.UserId == userId && p.MenuId == r.Id && p.CanDelete),
            CanExport = Permissions.Any(p => p.UserId == userId && p.MenuId == r.Id && p.CanExport),
            SubMenus = allowedMenus.Where(sub => sub.ParentMenuId == r.Id).OrderBy(sub => sub.SortOrder).Select(sub => new MenuTreeNodeDto
            {
                Id = sub.Id,
                ServiceCode = sub.ServiceCode,
                MenuKey = sub.MenuKey,
                Title = sub.Title,
                RoutePath = sub.RoutePath,
                Icon = sub.Icon,
                SortOrder = sub.SortOrder,
                CanCreate = Permissions.Any(p => p.UserId == userId && p.MenuId == sub.Id && p.CanCreate),
                CanEdit = Permissions.Any(p => p.UserId == userId && p.MenuId == sub.Id && p.CanEdit),
                CanDelete = Permissions.Any(p => p.UserId == userId && p.MenuId == sub.Id && p.CanDelete),
                CanExport = Permissions.Any(p => p.UserId == userId && p.MenuId == sub.Id && p.CanExport)
            }).ToList()
        }).ToList();

        return Task.FromResult(result);
    }

    public Task<List<AppMenu>> GetAllMasterMenusAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Menus.ToList());
    }

    public Task<AppMenu?> GetMenuByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = Menus.FirstOrDefault(m => m.Id == id);
        return Task.FromResult(item);
    }

    public Task<AppMenu> CreateMasterMenuAsync(AppMenu menu, CancellationToken cancellationToken = default)
    {
        menu.Id = Menus.Count > 0 ? Menus.Max(m => m.Id) + 1 : 1;
        Menus.Add(menu);
        return Task.FromResult(menu);
    }

    public Task<AppMenu?> UpdateMasterMenuAsync(AppMenu menu, CancellationToken cancellationToken = default)
    {
        var existing = Menus.FirstOrDefault(m => m.Id == menu.Id);
        if (existing == null) return Task.FromResult<AppMenu?>(null);
        existing.Title = menu.Title;
        existing.RoutePath = menu.RoutePath;
        existing.Icon = menu.Icon;
        existing.SortOrder = menu.SortOrder;
        existing.IsActive = menu.IsActive;
        return Task.FromResult<AppMenu?>(existing);
    }

    public Task<bool> DeleteMasterMenuAsync(int id, CancellationToken cancellationToken = default)
    {
        var count = Menus.RemoveAll(m => m.Id == id);
        return Task.FromResult(count > 0);
    }

    public Task<List<UserMenuPermission>> GetUserPermissionsAsync(int userId, CancellationToken cancellationToken = default)
    {
        var list = Permissions.Where(p => p.UserId == userId).ToList();
        return Task.FromResult(list);
    }

    public Task<bool> SaveUserPermissionAsync(int userId, int menuId, bool canView, bool canCreate, bool canEdit, bool canDelete, bool canExport, int? assignedByUserId, CancellationToken cancellationToken = default)
    {
        var existing = Permissions.FirstOrDefault(p => p.UserId == userId && p.MenuId == menuId);
        if (existing != null)
        {
            existing.CanView = canView;
            existing.CanCreate = canCreate;
            existing.CanEdit = canEdit;
            existing.CanDelete = canDelete;
            existing.CanExport = canExport;
            existing.AssignedByUserId = assignedByUserId;
        }
        else
        {
            Permissions.Add(new UserMenuPermission
            {
                UserId = userId,
                MenuId = menuId,
                CanView = canView,
                CanCreate = canCreate,
                CanEdit = canEdit,
                CanDelete = canDelete,
                CanExport = canExport,
                AssignedByUserId = assignedByUserId
            });
        }
        return Task.FromResult(true);
    }

    public async Task<bool> CascadeRevokePermissionsAsync(int parentUserId, List<int> revokedMenuIds, CancellationToken cancellationToken = default)
    {
        if (revokedMenuIds == null || revokedMenuIds.Count == 0) return true;

        if (UserRepo != null)
        {
            var downlineIds = await UserRepo.GetDownlineUserIdsAsync(parentUserId, cancellationToken);
            Permissions.RemoveAll(p => revokedMenuIds.Contains(p.MenuId) && downlineIds.Contains(p.UserId));
        }
        else
        {
            Permissions.RemoveAll(p => revokedMenuIds.Contains(p.MenuId) && p.AssignedByUserId == parentUserId);
        }
        return true;
    }
}

public class FakeWebhookLogRepository : IWebhookLogRepository
{
    public readonly List<WebhookLog> Logs = new();
    private int _nextId = 1;

    public Task<int> InsertWebhookLogAsync(WebhookLog log, CancellationToken cancellationToken = default)
    {
        log.Id = _nextId++;
        log.ReceivedAt = DateTime.UtcNow;
        Logs.Add(log);
        return Task.FromResult(log.Id);
    }

    public Task<List<WebhookLog>> GetRecentLogsAsync(int limit = 100, CancellationToken cancellationToken = default)
    {
        var list = Logs.OrderByDescending(l => l.ReceivedAt).Take(limit).ToList();
        return Task.FromResult(list);
    }
}
