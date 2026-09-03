using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Enums;

namespace LeadsManagement.Api.Services.Interfaces;

public interface IUserManagementService
{
    Task<List<UserResponseDto>> GetSubordinateUsersAsync(int currentUserId, UserRole? roleFilter = null, CancellationToken cancellationToken = default);
    Task<UserResponseDto?> GetUserByIdAsync(int currentUserId, int targetUserId, CancellationToken cancellationToken = default);
    Task<UserResponseDto> CreateUserAsync(int currentUserId, CreateUserDto dto, CancellationToken cancellationToken = default);
    Task<UserResponseDto?> UpdateUserAsync(int currentUserId, int targetUserId, UpdateUserDto dto, CancellationToken cancellationToken = default);
    Task<bool> ToggleUserStatusAsync(int currentUserId, int targetUserId, bool isActive, CancellationToken cancellationToken = default);
    Task<UserResponseDto?> UpdateUserCreditsAsync(int currentUserId, int targetUserId, UserCreditsUpdateDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteUserAsync(int currentUserId, int targetUserId, CancellationToken cancellationToken = default);
}
