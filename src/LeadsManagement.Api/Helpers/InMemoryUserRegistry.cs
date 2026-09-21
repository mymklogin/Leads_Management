using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Models.Enums;

namespace LeadsManagement.Api.Helpers;

public static class InMemoryUserRegistry
{
    private static readonly ConcurrentDictionary<int, AppUser> _users = new();
    private static int _nextId = 10;

    static InMemoryUserRegistry()
    {
        // Seed single master SuperAdmin account: Abhishaarod
        var admin = new AppUser
        {
            Id = 1,
            Username = "Abhishaarod",
            FullName = "Abhishaarod",
            Email = "Abhishaarod@rcsflow.io",
            PhoneNumber = "9999900000",
            CompanyName = "Enterprise Telecom Cloud",
            DltEntityId = "",
            Role = UserRole.SuperAdmin,
            IsActive = true,
            RcsCredits = 100000,
            RcsPromotionalCredits = 100000,
            SmsCredits = 100000,
            VoiceCredits = 50000,
            WhatsAppCredits = 50000,
            AllowedServices = new List<string> { "RCS-T", "RCS-P", "BULKSMS-T", "BULKSMS-P", "WHATSAPP-T", "WHATSAPP-P" },
            CreatedAt = DateTime.UtcNow.AddMonths(-1),
            UpdatedAt = DateTime.UtcNow,
            Documents = new List<string>()
        };

        _users[admin.Id] = admin;
    }

    public static List<AppUser> GetAll() => _users.Values.OrderBy(u => u.Id).ToList();

    public static AppUser? GetById(int id)
    {
        _users.TryGetValue(id, out var user);
        return user;
    }

    public static AppUser? GetByUsername(string username) =>
        _users.Values.FirstOrDefault(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));

    public static AppUser AddUser(AppUser user)
    {
        // Enforce unique username check:
        var existing = GetByUsername(user.Username);
        if (existing != null)
        {
            throw new InvalidOperationException($"Username '{user.Username}' is already taken. Please choose another username.");
        }

        int newId = System.Threading.Interlocked.Increment(ref _nextId);
        user.Id = newId;
        if (user.AllowedServices == null || user.AllowedServices.Count == 0)
        {
            user.AllowedServices = new List<string> { "RCS-T", "RCS-P" };
        }
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        _users[newId] = user;
        return user;
    }

    public static bool UpdateUser(AppUser user)
    {
        if (!_users.ContainsKey(user.Id)) return false;
        user.UpdatedAt = DateTime.UtcNow;
        _users[user.Id] = user;
        return true;
    }

    public static bool UpdateCredits(int userId, decimal voice, decimal whatsapp, decimal rcsT, decimal rcsP, decimal sms, decimal smsP = 0, decimal whatsappP = 0)
    {
        if (_users.TryGetValue(userId, out var user))
        {
            user.VoiceCredits = voice;
            user.WhatsAppCredits = whatsapp;
            user.WhatsAppPromotionalCredits = whatsappP;
            user.RcsCredits = rcsT;
            user.RcsPromotionalCredits = rcsP;
            user.SmsCredits = sms;
            user.BulkSmsPromotionalCredits = smsP;
            user.UpdatedAt = DateTime.UtcNow;
            return true;
        }
        return false;
    }

    public static bool ToggleStatus(int userId, bool isActive)
    {
        if (_users.TryGetValue(userId, out var user))
        {
            user.IsActive = isActive;
            user.UpdatedAt = DateTime.UtcNow;
            return true;
        }
        return false;
    }

    public static bool DeleteUser(int userId)
    {
        return _users.TryRemove(userId, out _);
    }

    public static List<RoleOptionDto> GetStandardRoles()
    {
        return new List<RoleOptionDto>
        {
            new() { Id = 2, Name = "Admin", Label = "Admin (Administrator)", Description = "Full system administration and reseller management" },
            new() { Id = 3, Name = "Reseller", Label = "Reseller (Telecom Partner)", Description = "Subordinate partner with client quota management" },
            new() { Id = 4, Name = "User", Label = "User / Client (Standard Client)", Description = "End client account for messaging and campaigns" }
        };
    }

    public static ServiceDefinitionsResponseDto GetServiceDefinitions()
    {
        return new ServiceDefinitionsResponseDto
        {
            Platforms = new List<ServicePlatformDto>
            {
                new() { Id = "RCS", Name = "RCS SMS", Icon = "MessageSquare" },
                new() { Id = "SMS", Name = "Bulk SMS", Icon = "PhoneCall" },
                new() { Id = "WHATSAPP", Name = "WhatsApp SMS", Icon = "Send" }
            },
            Routes = new List<ServiceRouteDto>
            {
                new() { Id = "Transactional", Name = "Transactional" },
                new() { Id = "Promotional", Name = "Promotional" }
            }
        };
    }
}
