using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;

namespace PetCareAPI.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<bool> RegisterAsync(RegisterDto registerDto);
    }
}
