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

public class UserManagementService : IUserManagementService
{
    private readonly IUserRepository _userRepository;
    private readonly IMenuRepository _menuRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMenuService _menuService;

    public UserManagementService(
        IUserRepository userRepository,
        IMenuRepository menuRepository,
        IPasswordHasher passwordHasher,
        IMenuService menuService)
    {
        _userRepository = userRepository;
        _menuRepository = menuRepository;
        _passwordHasher = passwordHasher;
        _menuService = menuService;
    }

    public async Task<List<UserResponseDto>> GetSubordinateUsersAsync(
        int currentUserId,
        UserRole? roleFilter = null,
        CancellationToken cancellationToken = default)
    {
        var currentUser = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
        if (currentUser == null) return new List<UserResponseDto>();

        var allUsers = await _userRepository.GetAllUsersAsync(cancellationToken);
        var usersMap = allUsers.ToDictionary(u => u.Id);

        List<AppUser> filteredUsers;

        if (currentUser.Role == UserRole.SuperAdmin)
        {
            filteredUsers = allUsers.Where(u => u.Id != currentUserId).ToList();
        }
        else
        {
            var subordinateIds = await _userRepository.GetDownlineUserIdsAsync(currentUserId, cancellationToken);
            filteredUsers = allUsers.Where(u => subordinateIds.Contains(u.Id)).ToList();
        }

        if (roleFilter.HasValue)
        {
            filteredUsers = filteredUsers.Where(u => u.Role == roleFilter.Value).ToList();
        }

        var result = new List<UserResponseDto>();
        foreach (var u in filteredUsers.OrderByDescending(x => x.CreatedAt))
        {
            string? parentName = null;
            if (u.ParentUserId.HasValue && usersMap.TryGetValue(u.ParentUserId.Value, out var parent))
            {
                parentName = parent.FullName ?? parent.Username;
            }

            int subCount = allUsers.Count(x => x.ParentUserId == u.Id);
            var perms = await _menuRepository.GetUserPermissionsAsync(u.Id, cancellationToken);
            int menuCount = perms.Count(p => p.CanView);

            result.Add(new UserResponseDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role,
                ParentUserId = u.ParentUserId,
                ParentUserName = parentName,
                IsActive = u.IsActive,
                VoiceCredits = u.VoiceCredits,
                WhatsAppCredits = u.WhatsAppCredits,
                RcsCredits = u.RcsCredits,
                SmsCredits = u.SmsCredits,
                AllowedMenusCount = menuCount,
                SubordinatesCount = subCount,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            });
        }

        return result;
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(
        int currentUserId,
        int targetUserId,
        CancellationToken cancellationToken = default)
    {
        var targetUser = await _userRepository.GetByIdAsync(targetUserId, cancellationToken);
        if (targetUser == null) return null;

        var currentUser = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
        if (currentUser == null) return null;

        if (currentUser.Role != UserRole.SuperAdmin && targetUser.Id != currentUserId)
        {
            var downline = await _userRepository.GetDownlineUserIdsAsync(currentUserId, cancellationToken);
            if (!downline.Contains(targetUserId))
            {
                throw new UnauthorizedAccessException("You do not have permission to access this user.");
            }
        }

        string? parentName = null;
        if (targetUser.ParentUserId.HasValue)
        {
            var parent = await _userRepository.GetByIdAsync(targetUser.ParentUserId.Value, cancellationToken);
            parentName = parent?.FullName ?? parent?.Username;
        }

        var perms = await _menuRepository.GetUserPermissionsAsync(targetUserId, cancellationToken);
        int menuCount = perms.Count(p => p.CanView);

        var allUsers = await _userRepository.GetAllUsersAsync(cancellationToken);
        int subCount = allUsers.Count(u => u.ParentUserId == targetUserId);

        return new UserResponseDto
        {
            Id = targetUser.Id,
            Username = targetUser.Username,
            Email = targetUser.Email,
            FullName = targetUser.FullName,
            PhoneNumber = targetUser.PhoneNumber,
            Role = targetUser.Role,
            ParentUserId = targetUser.ParentUserId,
            ParentUserName = parentName,
            IsActive = targetUser.IsActive,
            VoiceCredits = targetUser.VoiceCredits,
            WhatsAppCredits = targetUser.WhatsAppCredits,
            RcsCredits = targetUser.RcsCredits,
            SmsCredits = targetUser.SmsCredits,
            AllowedMenusCount = menuCount,
            SubordinatesCount = subCount,
            CreatedAt = targetUser.CreatedAt,
            UpdatedAt = targetUser.UpdatedAt
        };
    }

    public async Task<UserResponseDto> CreateUserAsync(
        int currentUserId,
        CreateUserDto dto,
        CancellationToken cancellationToken = default)
    {
        var currentUser = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
        if (currentUser == null)
        {
            throw new UnauthorizedAccessException("Current user not found.");
        }

        // Hierarchy creation rule enforcement
        switch (currentUser.Role)
        {
            case UserRole.SuperAdmin:
                if (dto.Role == UserRole.SuperAdmin)
                    throw new ArgumentException("SuperAdmin cannot create another SuperAdmin.");
                break;

            case UserRole.Admin:
                if (dto.Role != UserRole.Reseller && dto.Role != UserRole.User)
                    throw new UnauthorizedAccessException("Admin can only create Resellers and Users.");
                break;

            case UserRole.Reseller:
                if (dto.Role != UserRole.User)
                    throw new UnauthorizedAccessException("Resellers can only create Users.");
                break;

            default:
                throw new UnauthorizedAccessException("End users cannot create other users.");
        }

        // Validate unique username and email
        bool exists = await _userRepository.ExistsByUsernameOrEmailAsync(dto.Username.Trim(), dto.Email.Trim(), cancellationToken);
        if (exists)
        {
            throw new ArgumentException($"Username '{dto.Username}' or Email '{dto.Email}' is already taken.");
        }

        var newUser = new AppUser
        {
            Username = dto.Username.Trim(),
            Email = dto.Email.Trim(),
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            FullName = dto.FullName.Trim(),
            PhoneNumber = dto.PhoneNumber?.Trim(),
            Role = dto.Role,
            ParentUserId = currentUserId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        int newId = await _userRepository.CreateUserAsync(newUser, cancellationToken);
        newUser.Id = newId;

        // Assign initial menu permissions if selected in Checkbox UI
        if (dto.InitialMenuIds != null && dto.InitialMenuIds.Any())
        {
            await _menuService.AssignPermissionsAsync(currentUserId, new AssignMenuPermissionsDto
            {
                TargetUserId = newUser.Id,
                Permissions = dto.InitialMenuIds.Select(id => new MenuPermissionItemDto
                {
                    MenuId = id,
                    CanView = true
                }).ToList()
            }, cancellationToken);
        }

        return new UserResponseDto
        {
            Id = newUser.Id,
            Username = newUser.Username,
            Email = newUser.Email,
            FullName = newUser.FullName,
            PhoneNumber = newUser.PhoneNumber,
            Role = newUser.Role,
            ParentUserId = newUser.ParentUserId,
            ParentUserName = currentUser.FullName,
            IsActive = newUser.IsActive,
            AllowedMenusCount = dto.InitialMenuIds?.Count ?? 0,
            CreatedAt = newUser.CreatedAt,
            UpdatedAt = newUser.UpdatedAt
        };
    }

    public async Task<UserResponseDto?> UpdateUserAsync(
        int currentUserId,
        int targetUserId,
        UpdateUserDto dto,
        CancellationToken cancellationToken = default)
    {
        var targetUser = await _userRepository.GetByIdAsync(targetUserId, cancellationToken);
        if (targetUser == null) return null;

        var currentUser = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
        if (currentUser == null) return null;

        if (currentUser.Role != UserRole.SuperAdmin && targetUser.ParentUserId != currentUserId)
        {
            var downline = await _userRepository.GetDownlineUserIdsAsync(currentUserId, cancellationToken);
            if (!downline.Contains(targetUserId))
            {
                throw new UnauthorizedAccessException("You do not have permission to modify this user.");
            }
        }

        targetUser.FullName = dto.FullName.Trim();
        targetUser.PhoneNumber = dto.PhoneNumber?.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            targetUser.Email = dto.Email.Trim();
        }
        targetUser.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateUserAsync(targetUser, cancellationToken);

        string? parentName = null;
        if (targetUser.ParentUserId.HasValue)
        {
            var parent = await _userRepository.GetByIdAsync(targetUser.ParentUserId.Value, cancellationToken);
            parentName = parent?.FullName;
        }

        return new UserResponseDto
        {
            Id = targetUser.Id,
            Username = targetUser.Username,
            Email = targetUser.Email,
            FullName = targetUser.FullName,
            PhoneNumber = targetUser.PhoneNumber,
            Role = targetUser.Role,
            ParentUserId = targetUser.ParentUserId,
            ParentUserName = parentName,
            IsActive = targetUser.IsActive,
            VoiceCredits = targetUser.VoiceCredits,
            WhatsAppCredits = targetUser.WhatsAppCredits,
            RcsCredits = targetUser.RcsCredits,
            SmsCredits = targetUser.SmsCredits,
            CreatedAt = targetUser.CreatedAt,
            UpdatedAt = targetUser.UpdatedAt
        };
    }

    public async Task<bool> ToggleUserStatusAsync(
        int currentUserId,
        int targetUserId,
        bool isActive,
        CancellationToken cancellationToken = default)
    {
        var targetUser = await _userRepository.GetByIdAsync(targetUserId, cancellationToken);
        if (targetUser == null) return false;

        var currentUser = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
        if (currentUser == null) return false;

        if (currentUser.Role != UserRole.SuperAdmin && targetUser.ParentUserId != currentUserId)
        {
            var downline = await _userRepository.GetDownlineUserIdsAsync(currentUserId, cancellationToken);
            if (!downline.Contains(targetUserId))
            {
                throw new UnauthorizedAccessException("You do not have permission to change this user's status.");
            }
        }

        targetUser.IsActive = isActive;
        targetUser.UpdatedAt = DateTime.UtcNow;
        return await _userRepository.UpdateUserAsync(targetUser, cancellationToken);
    }

    public async Task<UserResponseDto?> UpdateUserCreditsAsync(
        int currentUserId,
        int targetUserId,
        UserCreditsUpdateDto dto,
        CancellationToken cancellationToken = default)
    {
        var targetUser = await _userRepository.GetByIdAsync(targetUserId, cancellationToken);
        if (targetUser == null) return null;

        var currentUser = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
        if (currentUser == null) return null;

        if (currentUser.Role != UserRole.SuperAdmin && targetUser.ParentUserId != currentUserId)
        {
            var downline = await _userRepository.GetDownlineUserIdsAsync(currentUserId, cancellationToken);
            if (!downline.Contains(targetUserId))
            {
                throw new UnauthorizedAccessException("You do not have permission to update credits for this user.");
            }
        }

        decimal voice = dto.VoiceCredits ?? targetUser.VoiceCredits;
        decimal whatsapp = dto.WhatsAppCredits ?? targetUser.WhatsAppCredits;
        decimal rcs = dto.RcsCredits ?? targetUser.RcsCredits;
        decimal sms = dto.SmsCredits ?? targetUser.SmsCredits;

        await _userRepository.UpdateCreditsAsync(targetUserId, voice, whatsapp, rcs, sms, cancellationToken);

        targetUser.VoiceCredits = voice;
        targetUser.WhatsAppCredits = whatsapp;
        targetUser.RcsCredits = rcs;
        targetUser.SmsCredits = sms;

        string? parentName = null;
        if (targetUser.ParentUserId.HasValue)
        {
            var parent = await _userRepository.GetByIdAsync(targetUser.ParentUserId.Value, cancellationToken);
            parentName = parent?.FullName;
        }

        return new UserResponseDto
        {
            Id = targetUser.Id,
            Username = targetUser.Username,
            Email = targetUser.Email,
            FullName = targetUser.FullName,
            Role = targetUser.Role,
            ParentUserId = targetUser.ParentUserId,
            ParentUserName = parentName,
            IsActive = targetUser.IsActive,
            VoiceCredits = targetUser.VoiceCredits,
            WhatsAppCredits = targetUser.WhatsAppCredits,
            RcsCredits = targetUser.RcsCredits,
            SmsCredits = targetUser.SmsCredits,
            CreatedAt = targetUser.CreatedAt,
            UpdatedAt = targetUser.UpdatedAt
        };
    }

    public async Task<bool> DeleteUserAsync(int currentUserId, int targetUserId, CancellationToken cancellationToken = default)
    {
        var targetUser = await _userRepository.GetByIdAsync(targetUserId, cancellationToken);
        if (targetUser == null) return false;

        var currentUser = await _userRepository.GetByIdAsync(currentUserId, cancellationToken);
        if (currentUser == null) return false;

        if (currentUser.Role != UserRole.SuperAdmin && targetUser.ParentUserId != currentUserId)
        {
            var downline = await _userRepository.GetDownlineUserIdsAsync(currentUserId, cancellationToken);
            if (!downline.Contains(targetUserId))
            {
                throw new UnauthorizedAccessException("You do not have permission to delete this user.");
            }
        }

        // Cascade delete downline users
        var downlineIds = await _userRepository.GetDownlineUserIdsAsync(targetUserId, cancellationToken);
        foreach (var id in downlineIds)
        {
            await _userRepository.DeleteUserAsync(id, cancellationToken);
        }

        return await _userRepository.DeleteUserAsync(targetUserId, cancellationToken);
    }
}
