using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;

namespace PetCareAPI.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
    }
}
