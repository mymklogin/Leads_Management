using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Implementations;

public class MasterDataService : IMasterDataService
{
    private readonly ILogger<MasterDataService> _logger;
    private readonly string _storagePath;
    private readonly object _lock = new();

    private readonly ConcurrentDictionary<int, SystemRoleDto> _roles = new();
    private readonly ConcurrentDictionary<int, TemplateTypeMasterDto> _templateTypes = new();
    private int _nextRoleId = 10;
    private int _nextTypeId = 100;

    public MasterDataService(ILogger<MasterDataService> logger)
    {
        _logger = logger;
        _storagePath = Path.Combine(AppContext.BaseDirectory, "master_data_settings.json");

        SeedDefaultMasters();
        LoadFromFile();
    }

    private void SeedDefaultMasters()
    {
        // Default standard system roles
        var defaultRoles = new List<SystemRoleDto>
        {
            new() { Id = 1, RoleCode = "SuperAdmin", RoleName = "Super Administrator", Description = "Full unrestricted platform & gateway control", IsSystemRole = true, Permissions = new() { "*" } },
            new() { Id = 2, RoleCode = "Admin", RoleName = "Administrator", Description = "Enterprise team and user management permissions", IsSystemRole = true, Permissions = new() { "users.manage", "campaigns.manage", "reports.view", "templates.manage" } },
            new() { Id = 3, RoleCode = "Reseller", RoleName = "White-Label Reseller", Description = "Can manage client accounts and distribute balance quotas", IsSystemRole = true, Permissions = new() { "users.create", "balance.transfer", "reports.view" } },
            new() { Id = 4, RoleCode = "User", RoleName = "Standard Client User", Description = "Send campaigns, manage templates and view delivery reports", IsSystemRole = true, Permissions = new() { "campaigns.send", "templates.create", "reports.view" } }
        };

        foreach (var r in defaultRoles)
        {
            _roles[r.Id] = r;
        }

        // Default template & campaign types
        var defaultTypes = new List<TemplateTypeMasterDto>
        {
            new() { Id = 1, TypeCode = "PlainText", DisplayName = "Plain Text RCS Message", ChannelType = "RCS", Description = "Simple text message with optional action buttons", IsActive = true },
            new() { Id = 2, TypeCode = "RichCard", DisplayName = "Standalone Rich Card", ChannelType = "RCS", Description = "Media card with title, description, and interactive chips", IsActive = true },
            new() { Id = 3, TypeCode = "Carousel", DisplayName = "Multi-Card Carousel Slider", ChannelType = "RCS", Description = "Horizontally scrollable rich media cards", IsActive = true },
            new() { Id = 4, TypeCode = "SimpleCampaign", DisplayName = "Simple Voice OBD Campaign", ChannelType = "VOICE", Description = "Single prompt audio broadcast", IsActive = true },
            new() { Id = 5, TypeCode = "DtmfCampaign", DisplayName = "Interactive DTMF Voice Campaign", ChannelType = "VOICE", Description = "Keypress interactive menu routing", IsActive = true },
            new() { Id = 6, TypeCode = "CallPatchCampaign", DisplayName = "Live Agent Call Patching", ChannelType = "VOICE", Description = "Transfers answered calls to call center agents", IsActive = true },
            new() { Id = 7, TypeCode = "TransactionalSms", DisplayName = "Transactional DLT SMS", ChannelType = "SMS", Description = "Bank OTPs, order updates and service alerts", IsActive = true },
            new() { Id = 8, TypeCode = "PromotionalSms", DisplayName = "Promotional Marketing SMS", ChannelType = "SMS", Description = "Discounts, offers and marketing blasts", IsActive = true },
            new() { Id = 9, TypeCode = "WhatsAppTemplate", DisplayName = "WhatsApp Interactive Template", ChannelType = "WHATSAPP", Description = "Meta pre-approved HSM with quick reply buttons", IsActive = true }
        };

        foreach (var t in defaultTypes)
        {
            _templateTypes[t.Id] = t;
        }
    }

    private void LoadFromFile()
    {
        lock (_lock)
        {
            try
            {
                if (File.Exists(_storagePath))
                {
                    var json = File.ReadAllText(_storagePath);
                    var bundle = JsonSerializer.Deserialize<MasterDataBundle>(json);
                    if (bundle != null)
                    {
                        if (bundle.Roles != null && bundle.Roles.Count > 0)
                        {
                            foreach (var r in bundle.Roles)
                            {
                                _roles[r.Id] = r;
                                if (r.Id >= _nextRoleId) _nextRoleId = r.Id + 1;
                            }
                        }
                        if (bundle.TemplateTypes != null && bundle.TemplateTypes.Count > 0)
                        {
                            foreach (var t in bundle.TemplateTypes)
                            {
                                _templateTypes[t.Id] = t;
                                if (t.Id >= _nextTypeId) _nextTypeId = t.Id + 1;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Failed to load master data storage: {Message}", ex.Message);
            }
        }
    }

    private void SaveToFile()
    {
        lock (_lock)
        {
            try
            {
                var bundle = new MasterDataBundle
                {
                    Roles = _roles.Values.ToList(),
                    TemplateTypes = _templateTypes.Values.ToList()
                };
                var json = JsonSerializer.Serialize(bundle, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_storagePath, json);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Failed to write master data storage: {Message}", ex.Message);
            }
        }
    }

    public List<SystemRoleDto> GetRoles()
    {
        return _roles.Values.OrderBy(r => r.Id).ToList();
    }

    public SystemRoleDto? GetRoleById(int id)
    {
        _roles.TryGetValue(id, out var role);
        return role;
    }

    public SystemRoleDto AddOrUpdateRole(SystemRoleDto dto)
    {
        if (dto.Id <= 0)
        {
            dto.Id = System.Threading.Interlocked.Increment(ref _nextRoleId);
            dto.CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
        }

        _roles[dto.Id] = dto;
        SaveToFile();
        return dto;
    }

    public bool DeleteRole(int id)
    {
        if (_roles.TryGetValue(id, out var existing) && existing.IsSystemRole)
        {
            throw new InvalidOperationException("Default system roles cannot be deleted.");
        }

        var removed = _roles.TryRemove(id, out _);
        if (removed) SaveToFile();
        return removed;
    }

    public List<TemplateTypeMasterDto> GetTemplateTypes(string? channel = null)
    {
        var list = _templateTypes.Values.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(channel))
        {
            list = list.Where(t => t.ChannelType.Equals(channel, StringComparison.OrdinalIgnoreCase));
        }
        return list.OrderBy(t => t.Id).ToList();
    }

    public TemplateTypeMasterDto? GetTemplateTypeById(int id)
    {
        _templateTypes.TryGetValue(id, out var t);
        return t;
    }

    public TemplateTypeMasterDto AddOrUpdateTemplateType(TemplateTypeMasterDto dto)
    {
        if (dto.Id <= 0)
        {
            dto.Id = System.Threading.Interlocked.Increment(ref _nextTypeId);
            dto.CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
        }

        _templateTypes[dto.Id] = dto;
        SaveToFile();
        return dto;
    }

    public bool DeleteTemplateType(int id)
    {
        var removed = _templateTypes.TryRemove(id, out _);
        if (removed) SaveToFile();
        return removed;
    }

    private class MasterDataBundle
    {
        public List<SystemRoleDto> Roles { get; set; } = new();
        public List<TemplateTypeMasterDto> TemplateTypes { get; set; } = new();
    }
}
