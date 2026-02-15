using Microsoft.AspNetCore.Mvc;
using PetCareAPI.Models.DTOs;
using PetCareAPI.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            if (result == null)
                return Unauthorized();

            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var result = await _authService.RegisterAsync(registerDto);
            if (!result)
                return BadRequest(new { message = "User already exists" });

            return StatusCode(201);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            var result = await _authService.ForgotPasswordAsync(forgotPasswordDto);
            // We return Ok even if user doesn't exist for security reasons (don't reveal registered emails)
            // But for this demo, the service returns true if user exists.
            return Ok(new { message = "If an account exists with this email, a password reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            var result = await _authService.ResetPasswordAsync(resetPasswordDto);
            if (!result)
                return BadRequest(new { message = "Invalid email or token" });

            return Ok(new { message = "Password has been reset successfully" });
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var result = await _authService.ChangePasswordAsync(int.Parse(userIdClaim.Value), changePasswordDto);
            if (!result)
                return BadRequest(new { message = "Invalid current password" });

            return Ok(new { message = "Password changed successfully" });
        }
    }
}
