using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;

namespace PetCareAPI.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<bool> RegisterAsync(RegisterDto registerDto);
        Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
        Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    }
}
