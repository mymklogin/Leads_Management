using System.Threading;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;

namespace LeadsManagement.Api.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<UserProfileDto> GetMyProfileAsync(int userId, CancellationToken cancellationToken = default);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto, CancellationToken cancellationToken = default);
}
