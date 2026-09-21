using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Implementations;

public class DynamicMenuStorageModel
{
    public List<DynamicMenuTreeNodeDto> Menus { get; set; } = new();
}

public class DynamicMenuService : IDynamicMenuService
{
    private readonly ILogger<DynamicMenuService> _logger;
    private readonly string _settingsFilePath;
    private static readonly object _fileLock = new();
    private DynamicMenuStorageModel _cache;

    public DynamicMenuService(ILogger<DynamicMenuService> logger)
    {
        _logger = logger;
        _settingsFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dynamic_menus.json");
        _cache = LoadSettings();
    }

    private DynamicMenuStorageModel LoadSettings()
    {
        lock (_fileLock)
        {
            try
            {
                if (File.Exists(_settingsFilePath))
                {
                    var json = File.ReadAllText(_settingsFilePath);
                    var model = JsonSerializer.Deserialize<DynamicMenuStorageModel>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (model != null && model.Menus != null && model.Menus.Count > 0)
                    {
                        return model;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading dynamic_menus.json, initializing defaults.");
            }

            var defaultModel = GetDefaultStorageModel();
            SaveSettingsInternal(defaultModel);
            return defaultModel;
        }
    }

    private void SaveSettingsInternal(DynamicMenuStorageModel model)
    {
        lock (_fileLock)
        {
            try
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                var json = JsonSerializer.Serialize(model, options);
                File.WriteAllText(_settingsFilePath, json);
                _cache = model;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving dynamic_menus.json");
                throw;
            }
        }
    }

    public Task<List<DynamicMenuTreeNodeDto>> GetMenuTreeAsync()
    {
        lock (_fileLock)
        {
            var ordered = _cache.Menus
                .Where(m => m.IsActive)
                .OrderBy(m => m.SortOrder)
                .Select(node => new DynamicMenuTreeNodeDto
                {
                    Id = node.Id,
                    Title = node.Title,
                    MenuKey = node.MenuKey,
                    RoutePath = node.RoutePath,
                    Icon = node.Icon,
                    SortOrder = node.SortOrder,
                    IsActive = node.IsActive,
                    ParentId = node.ParentId,
                    BadgeText = node.BadgeText,
                    BadgeColor = node.BadgeColor,
                    SubMenus = node.SubMenus?.Where(s => s.IsActive).Select(CloneNode).OrderBy(s => s.SortOrder).ToList() ?? new List<DynamicMenuTreeNodeDto>()
                })
                .ToList();
            return Task.FromResult(ordered);
        }
    }

    public Task<List<DynamicMenuTreeNodeDto>> GetAllMenusFlatAsync()
    {
        lock (_fileLock)
        {
            var flatList = new List<DynamicMenuTreeNodeDto>();
            foreach (var parent in _cache.Menus.OrderBy(m => m.SortOrder))
            {
                flatList.Add(CloneNodeWithoutChildren(parent));
                if (parent.SubMenus != null)
                {
                    foreach (var sub in parent.SubMenus.OrderBy(s => s.SortOrder))
                    {
                        flatList.Add(CloneNodeWithoutChildren(sub));
                    }
                }
            }
            return Task.FromResult(flatList);
        }
    }

    public Task<DynamicMenuTreeNodeDto> AddMenuAsync(CreateDynamicMenuDto dto)
    {
        lock (_fileLock)
        {
            var newId = "menu-" + Guid.NewGuid().ToString("N").Substring(0, 8);
            var node = new DynamicMenuTreeNodeDto
            {
                Id = newId,
                Title = dto.Title,
                MenuKey = dto.MenuKey,
                RoutePath = dto.RoutePath,
                Icon = string.IsNullOrWhiteSpace(dto.Icon) ? "Layers" : dto.Icon,
                SortOrder = dto.SortOrder,
                IsActive = dto.IsActive,
                ParentId = dto.ParentId,
                BadgeText = dto.BadgeText,
                BadgeColor = dto.BadgeColor,
                SubMenus = new List<DynamicMenuTreeNodeDto>()
            };

            if (string.IsNullOrEmpty(dto.ParentId))
            {
                // Top-level parent menu
                node.SortOrder = dto.SortOrder > 0 ? dto.SortOrder : _cache.Menus.Count + 1;
                _cache.Menus.Add(node);
            }
            else
            {
                // Sub-menu under parent
                var parent = _cache.Menus.FirstOrDefault(m => m.Id == dto.ParentId || m.MenuKey == dto.ParentId);
                if (parent == null)
                {
                    throw new ArgumentException($"Parent menu with ID '{dto.ParentId}' not found.");
                }
                node.ParentId = parent.Id;
                node.SortOrder = dto.SortOrder > 0 ? dto.SortOrder : (parent.SubMenus?.Count ?? 0) + 1;
                parent.SubMenus ??= new List<DynamicMenuTreeNodeDto>();
                parent.SubMenus.Add(node);
            }

            SaveSettingsInternal(_cache);
            return Task.FromResult(node);
        }
    }

    public Task<DynamicMenuTreeNodeDto?> UpdateMenuAsync(string id, UpdateDynamicMenuDto dto)
    {
        lock (_fileLock)
        {
            DynamicMenuTreeNodeDto? target = null;

            // Search in top level
            target = _cache.Menus.FirstOrDefault(m => m.Id == id);
            if (target != null)
            {
                target.Title = dto.Title;
                target.MenuKey = dto.MenuKey;
                target.RoutePath = dto.RoutePath;
                target.Icon = dto.Icon;
                target.SortOrder = dto.SortOrder;
                target.IsActive = dto.IsActive;
                target.BadgeText = dto.BadgeText;
                target.BadgeColor = dto.BadgeColor;

                SaveSettingsInternal(_cache);
                return Task.FromResult<DynamicMenuTreeNodeDto?>(target);
            }

            // Search in submenus
            foreach (var parent in _cache.Menus)
            {
                if (parent.SubMenus == null) continue;
                var sub = parent.SubMenus.FirstOrDefault(s => s.Id == id);
                if (sub != null)
                {
                    sub.Title = dto.Title;
                    sub.MenuKey = dto.MenuKey;
                    sub.RoutePath = dto.RoutePath;
                    sub.Icon = dto.Icon;
                    sub.SortOrder = dto.SortOrder;
                    sub.IsActive = dto.IsActive;
                    sub.BadgeText = dto.BadgeText;
                    sub.BadgeColor = dto.BadgeColor;

                    SaveSettingsInternal(_cache);
                    return Task.FromResult<DynamicMenuTreeNodeDto?>(sub);
                }
            }

            return Task.FromResult<DynamicMenuTreeNodeDto?>(null);
        }
    }

    public Task<bool> DeleteMenuAsync(string id)
    {
        lock (_fileLock)
        {
            // Try remove parent
            var removedCount = _cache.Menus.RemoveAll(m => m.Id == id);
            if (removedCount > 0)
            {
                SaveSettingsInternal(_cache);
                return Task.FromResult(true);
            }

            // Try remove submenu
            foreach (var parent in _cache.Menus)
            {
                if (parent.SubMenus == null) continue;
                var subRemoved = parent.SubMenus.RemoveAll(s => s.Id == id);
                if (subRemoved > 0)
                {
                    SaveSettingsInternal(_cache);
                    return Task.FromResult(true);
                }
            }

            return Task.FromResult(false);
        }
    }

    public Task<bool> SaveMenuTreeAsync(List<DynamicMenuTreeNodeDto> fullTree)
    {
        lock (_fileLock)
        {
            if (fullTree == null || fullTree.Count == 0)
            {
                throw new ArgumentException("Menu tree cannot be empty.");
            }

            var model = new DynamicMenuStorageModel
            {
                Menus = fullTree
            };

            SaveSettingsInternal(model);
            return Task.FromResult(true);
        }
    }

    public Task<List<DynamicMenuTreeNodeDto>> ResetToDefaultsAsync()
    {
        lock (_fileLock)
        {
            var defaultModel = GetDefaultStorageModel();
            SaveSettingsInternal(defaultModel);
            return Task.FromResult(defaultModel.Menus);
        }
    }

    private static DynamicMenuTreeNodeDto CloneNode(DynamicMenuTreeNodeDto node)
    {
        return new DynamicMenuTreeNodeDto
        {
            Id = node.Id,
            Title = node.Title,
            MenuKey = node.MenuKey,
            RoutePath = node.RoutePath,
            Icon = node.Icon,
            SortOrder = node.SortOrder,
            IsActive = node.IsActive,
            ParentId = node.ParentId,
            BadgeText = node.BadgeText,
            BadgeColor = node.BadgeColor,
            SubMenus = node.SubMenus?.Select(CloneNode).OrderBy(s => s.SortOrder).ToList() ?? new List<DynamicMenuTreeNodeDto>()
        };
    }

    private static DynamicMenuTreeNodeDto CloneNodeWithoutChildren(DynamicMenuTreeNodeDto node)
    {
        return new DynamicMenuTreeNodeDto
        {
            Id = node.Id,
            Title = node.Title,
            MenuKey = node.MenuKey,
            RoutePath = node.RoutePath,
            Icon = node.Icon,
            SortOrder = node.SortOrder,
            IsActive = node.IsActive,
            ParentId = node.ParentId,
            BadgeText = node.BadgeText,
            BadgeColor = node.BadgeColor
        };
    }

    private DynamicMenuStorageModel GetDefaultStorageModel()
    {
        return new DynamicMenuStorageModel
        {
            Menus = new List<DynamicMenuTreeNodeDto>
            {
                // 1. DASHBOARD
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-dash",
                    Title = "DASHBOARD",
                    MenuKey = "RCS_DASHBOARD",
                    RoutePath = "/dashboard",
                    Icon = "LayoutDashboard",
                    SortOrder = 1,
                    IsActive = true
                },

                // 2. SMS BOX (Hidden/Inactive)
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-smsbox",
                    Title = "SMS BOX",
                    MenuKey = "SMS_BOX",
                    RoutePath = "/sms-box",
                    Icon = "Send",
                    SortOrder = 2,
                    IsActive = false,
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-sms-quick", ParentId = "menu-smsbox", Title = "Quick SMS Sender", MenuKey = "VOICE_SINGLE_CALL", RoutePath = "/voice/single", Icon = "Send", SortOrder = 1, IsActive = false },
                        new() { Id = "sub-sms-bulk", ParentId = "menu-smsbox", Title = "Bulk SMS Campaign", MenuKey = "VOICE_BULK_OBD", RoutePath = "/voice/bulk", Icon = "Layers", SortOrder = 2, IsActive = false },
                        new() { Id = "sub-sms-tpl", ParentId = "menu-smsbox", Title = "SMS DLT Templates", MenuKey = "RCS_TEMPLATES", RoutePath = "/rcs/templates", Icon = "FileCode", SortOrder = 3, IsActive = false }
                    }
                },

                // 3. CLICKER (Hidden/Inactive)
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-clicker",
                    Title = "CLICKER",
                    MenuKey = "CLICKER",
                    RoutePath = "/clicker",
                    Icon = "MousePointer",
                    SortOrder = 3,
                    IsActive = false,
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-click-short", ParentId = "menu-clicker", Title = "Smart URL Shortener", MenuKey = "CLICKER_SHORTENER", RoutePath = "/clicker/shortener", Icon = "Globe", SortOrder = 1, IsActive = false },
                        new() { Id = "sub-click-track", ParentId = "menu-clicker", Title = "Click Stream Tracking", MenuKey = "CLICKER_ANALYTICS", RoutePath = "/clicker/analytics", Icon = "BarChart3", SortOrder = 2, IsActive = false }
                    }
                },

                // 4. RCS
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-rcs",
                    Title = "RCS",
                    MenuKey = "RCS_SUITE",
                    RoutePath = "/rcs",
                    Icon = "MessageSquare",
                    SortOrder = 4,
                    IsActive = true,
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-rcs-dash", ParentId = "menu-rcs", Title = "Dashboard", MenuKey = "RCS_DASHBOARD", RoutePath = "/dashboard", Icon = "LayoutDashboard", SortOrder = 1, IsActive = true },
                        new() { Id = "sub-rcs-tpl", ParentId = "menu-rcs", Title = "Templates", MenuKey = "RCS_TEMPLATES", RoutePath = "/rcs/templates", Icon = "FileCode", SortOrder = 2, IsActive = true },
                        new() { Id = "sub-rcs-create", ParentId = "menu-rcs", Title = "Create Campaign", MenuKey = "RCS_CAMPAIGNS", RoutePath = "/rcs/campaign", Icon = "PlusCircle", SortOrder = 3, IsActive = true },
                        new() { Id = "sub-rcs-multi", ParentId = "menu-rcs", Title = "Multi Schedule Campaign", MenuKey = "RCS_MULTI_SCHEDULE", RoutePath = "/rcs/multi-schedule", Icon = "Calendar", SortOrder = 4, IsActive = true },
                        new() { Id = "sub-rcs-rep", ParentId = "menu-rcs", Title = "Campaign Report", MenuKey = "RCS_REPORTS", RoutePath = "/rcs/reports", Icon = "BarChart3", SortOrder = 5, IsActive = true },
                        new() { Id = "sub-rcs-mis", ParentId = "menu-rcs", Title = "MIS Report", MenuKey = "RCS_MIS_REPORT", RoutePath = "/rcs-mis", Icon = "PieChart", SortOrder = 6, IsActive = true },
                        new() { Id = "sub-rcs-chat", ParentId = "menu-rcs", Title = "RCS Chat", MenuKey = "RCS_CHAT", RoutePath = "/rcs/chat", Icon = "MessageSquare", SortOrder = 7, IsActive = true },
                        new() { Id = "sub-rcs-cons", ParentId = "menu-rcs", Title = "Consolidate Report", MenuKey = "RCS_CONSOLIDATE_REPORT", RoutePath = "/rcs/consolidate-report", Icon = "Database", SortOrder = 8, IsActive = true },
                        new() { Id = "sub-rcs-doc", ParentId = "menu-rcs", Title = "API Documentation", MenuKey = "RCS_API_DOC", RoutePath = "/rcs/api-doc", Icon = "BookOpen", SortOrder = 9, IsActive = true }
                    }
                },

                // 5. DIRECT TELCO GATEWAY
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-telco",
                    Title = "DIRECT TELCO GATEWAY",
                    MenuKey = "TELCO_GATEWAY",
                    RoutePath = "/gateway",
                    Icon = "Zap",
                    SortOrder = 5,
                    IsActive = true,
                    BadgeText = "TELCO SMPP",
                    BadgeColor = "#22c55e",
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-telco-smpp", ParentId = "menu-telco", Title = "Direct Telco SMPP Routing", MenuKey = "SMPP_ROUTING", RoutePath = "/smpp-gateways", Icon = "Network", SortOrder = 1, IsActive = true },
                        new() { Id = "sub-telco-bypass", ParentId = "menu-telco", Title = "Gateway & Bypass Policies", MenuKey = "GATEWAY_SETTINGS", RoutePath = "/gateway-settings", Icon = "Sliders", SortOrder = 2, IsActive = true },
                        new() { Id = "sub-telco-dlt", ParentId = "menu-telco", Title = "DLT Sender ID (PE ID) Allocation", MenuKey = "SENDER_ID_ALLOCATION", RoutePath = "/sender-id-allocation", Icon = "Hash", SortOrder = 3, IsActive = true }
                    }
                },

                // 6. REPORTS
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-reports",
                    Title = "REPORTS",
                    MenuKey = "REPORTS_SUITE",
                    RoutePath = "/reports",
                    Icon = "BarChart3",
                    SortOrder = 6,
                    IsActive = true,
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-rep-delivery", ParentId = "menu-reports", Title = "Delivery Report", MenuKey = "RCS_REPORTS", RoutePath = "/rcs/reports", Icon = "CheckCircle2", SortOrder = 1, IsActive = true },
                        new() { Id = "sub-rep-sched", ParentId = "menu-reports", Title = "Scheduled SMS & RCS", MenuKey = "RCS_MULTI_SCHEDULE", RoutePath = "/rcs/multi-schedule", Icon = "Calendar", SortOrder = 2, IsActive = true },
                        new() { Id = "sub-rep-mis", ParentId = "menu-reports", Title = "MIS Report", MenuKey = "RCS_MIS_REPORT", RoutePath = "/rcs-mis", Icon = "PieChart", SortOrder = 3, IsActive = true },
                        new() { Id = "sub-rep-cons", ParentId = "menu-reports", Title = "Consolidate Report", MenuKey = "RCS_CONSOLIDATE_REPORT", RoutePath = "/rcs/consolidate-report", Icon = "Database", SortOrder = 4, IsActive = true },
                        new() { Id = "sub-rep-cred", ParentId = "menu-reports", Title = "Credit History", MenuKey = "RCS_PAYMENT_MANAGE", RoutePath = "/payment-manage", Icon = "Wallet", SortOrder = 5, IsActive = true }
                    }
                },

                // 7. MANAGE
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-manage",
                    Title = "MANAGE",
                    MenuKey = "MANAGE_ADMIN",
                    RoutePath = "/manage",
                    Icon = "Settings",
                    SortOrder = 7,
                    IsActive = true,
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-mng-leads", ParentId = "menu-manage", Title = "Leads CRM", MenuKey = "LEADS_CRM", RoutePath = "/leads", Icon = "Users", SortOrder = 1, IsActive = true, BadgeText = "AI LEADS", BadgeColor = "#0284c7" },
                        new() { Id = "sub-mng-users", ParentId = "menu-manage", Title = "User Management", MenuKey = "USER_MANAGEMENT", RoutePath = "/user-management", Icon = "Users", SortOrder = 2, IsActive = true },
                        new() { Id = "sub-mng-pay", ParentId = "menu-manage", Title = "Payment & Credits", MenuKey = "RCS_PAYMENT_MANAGE", RoutePath = "/payment-manage", Icon = "Wallet", SortOrder = 3, IsActive = true },
                        new() { Id = "sub-mng-builder", ParentId = "menu-manage", Title = "Dynamic Menu & Submenu Builder", MenuKey = "MENU_BUILDER", RoutePath = "/menu-builder", Icon = "Sliders", SortOrder = 4, IsActive = true }
                    }
                },

                // 8. RESELLER (Hidden/Inactive)
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-reseller",
                    Title = "RESELLER",
                    MenuKey = "RESELLER_HUB",
                    RoutePath = "/reseller",
                    Icon = "Briefcase",
                    SortOrder = 8,
                    IsActive = false,
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-res-smpp", ParentId = "menu-reseller", Title = "Inbound SMPP Server (Port 2775)", MenuKey = "RESELLER_SMPP", RoutePath = "/reseller-smpp", Icon = "Server", SortOrder = 1, IsActive = false },
                        new() { Id = "sub-res-cname", ParentId = "menu-reseller", Title = "Reseller Custom Domains (CNAME)", MenuKey = "RESELLER_DOMAINS", RoutePath = "/reseller-domains", Icon = "Globe", SortOrder = 2, IsActive = false },
                        new() { Id = "sub-res-users", ParentId = "menu-reseller", Title = "Reseller User Accounts", MenuKey = "USER_MANAGEMENT", RoutePath = "/user-management", Icon = "Users", SortOrder = 3, IsActive = false }
                    }
                },

                // 9. HTTP API
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-http",
                    Title = "HTTP API",
                    MenuKey = "HTTP_API_DOCS",
                    RoutePath = "/api-docs",
                    Icon = "Code",
                    SortOrder = 9,
                    IsActive = true,
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-api-doc", ParentId = "menu-http", Title = "REST API Documentation", MenuKey = "RCS_API_DOC", RoutePath = "/rcs/api-doc", Icon = "BookOpen", SortOrder = 1, IsActive = true }
                    }
                },

                // 10. TWO FACTOR AUTHENTICATION / SECURITY (Hidden/Inactive)
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-2fa",
                    Title = "TWO FACTOR AUTHENTICATION",
                    MenuKey = "TWO_FACTOR_AUTH",
                    RoutePath = "/security/2fa",
                    Icon = "Key",
                    SortOrder = 10,
                    IsActive = false,
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-sec-ip", ParentId = "menu-2fa", Title = "IP & Domain Whitelist", MenuKey = "IP_SECURITY", RoutePath = "/ip-whitelist", Icon = "ShieldCheck", SortOrder = 1, IsActive = false },
                        new() { Id = "sub-sec-otp", ParentId = "menu-2fa", Title = "2FA Authenticator & OTP", MenuKey = "TWO_FACTOR_AUTH", RoutePath = "/security/2fa", Icon = "Key", SortOrder = 2, IsActive = false }
                    }
                },

                // 11. JSON API (Hidden/Inactive)
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-json",
                    Title = "JSON API",
                    MenuKey = "JSON_API",
                    RoutePath = "/json-api",
                    Icon = "FileCode",
                    SortOrder = 11,
                    IsActive = false,
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-json-spec", ParentId = "menu-json", Title = "JSON Webhook & Payload API", MenuKey = "RCS_API_DOC", RoutePath = "/json-api", Icon = "FileCode", SortOrder = 1, IsActive = false }
                    }
                },

                // 12. UTILITIES (Hidden/Inactive)
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-util",
                    Title = "UTILITIES",
                    MenuKey = "UTILITIES_HUB",
                    RoutePath = "/utilities",
                    Icon = "Sliders",
                    SortOrder = 12,
                    IsActive = false,
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-util-ping", ParentId = "menu-util", Title = "SMPP & IP Ping Diagnostics", MenuKey = "IP_SECURITY", RoutePath = "/utilities/ping", Icon = "Sliders", SortOrder = 1, IsActive = false }
                    }
                },

                // 13. HELP DESK
                new DynamicMenuTreeNodeDto
                {
                    Id = "menu-help",
                    Title = "HELP DESK",
                    MenuKey = "HELP_DESK",
                    RoutePath = "/help",
                    Icon = "HelpCircle",
                    SortOrder = 13,
                    IsActive = true,
                    SubMenus = new List<DynamicMenuTreeNodeDto>
                    {
                        new() { Id = "sub-help-support", ParentId = "menu-help", Title = "Support Tickets", MenuKey = "SUPPORT_TICKETS", RoutePath = "/support", Icon = "HelpCircle", SortOrder = 1, IsActive = true }
                    }
                }
            }
        };
    }
}
