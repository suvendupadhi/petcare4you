using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PetCareAPI.Data;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;
using PetCareAPI.Constants;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BC = BCrypt.Net.BCrypt;

namespace PetCareAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly PetCare4YouContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(PetCare4YouContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var email = loginDto.Email.ToLower().Trim();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
            
            if (user == null || !BC.Verify(loginDto.Password, user.PasswordHash))
                return null;

            if (user.RowStatus != StatusConstants.RowStatus.Active)
                return null; // Only active users can login

            var token = GenerateJwtToken(user);
            return new AuthResponseDto
            {
                Token = token,
                UserId = user.Id,
                RoleId = user.RoleId
            };
        }

        public async Task<bool> RegisterAsync(RegisterDto registerDto)
        {
            var email = registerDto.Email.ToLower().Trim();
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == email))
                return false;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new User
                {
                    Email = email,
                    PasswordHash = BC.HashPassword(registerDto.Password),
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    PhoneNumber = registerDto.PhoneNumber,
                    RoleId = registerDto.RoleId,
                    Address = registerDto.Address
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // If user is a provider, create provider profile
                if (registerDto.RoleId == StatusConstants.UserRole.Provider)
                {
                    var provider = new Provider
                    {
                        UserId = user.Id,
                        CompanyName = registerDto.CompanyName ?? $"{user.FirstName} {user.LastName}'s Services",
                        Description = registerDto.Description ?? "No description provided",
                        HourlyRate = registerDto.HourlyRate ?? 0,
                        Address = registerDto.Address ?? string.Empty,
                        City = registerDto.City ?? string.Empty,
                        Latitude = (decimal?)registerDto.Latitude,
                        Longitude = (decimal?)registerDto.Longitude,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Providers.Add(provider);
                    await _context.SaveChangesAsync();

                    if (registerDto.ServiceTypeIds != null && registerDto.ServiceTypeIds.Any())
                    {
                        foreach (var stId in registerDto.ServiceTypeIds)
                        {
                            _context.ProviderServices.Add(new ProviderService
                            {
                                ProviderId = provider.Id,
                                ServiceTypeId = stId,
                                Price = provider.HourlyRate,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            });
                        }
                        await _context.SaveChangesAsync();
                    }
                }

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
        {
            var email = forgotPasswordDto.Email.ToLower().Trim();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
            
            if (user == null)
                return false;

            // Generate a 6-digit reset token
            var token = new Random().Next(100000, 999999).ToString();
            user.PasswordResetToken = token;
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            // Mock SMTP - Send email with token
            await SendEmailAsync(user.Email, "Reset Your Password", 
                $"Your password reset token is: {token}. It will expire in 1 hour.");

            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var email = resetPasswordDto.Email.ToLower().Trim();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null)
                return false;

            // Validate token and expiry
            if (user.PasswordResetToken != resetPasswordDto.Token || 
                user.ResetTokenExpiry < DateTime.UtcNow)
            {
                return false;
            }
            
            user.PasswordHash = BC.HashPassword(resetPasswordDto.NewPassword);
            user.PasswordResetToken = null; // Clear token after success
            user.ResetTokenExpiry = null;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            // MOCK SMTP SETUP
            // In a production environment, this would be replaced with actual SMTP logic using MailKit or similar.
            /*
            using var client = new SmtpClient();
            await client.ConnectAsync(_configuration["Smtp:Host"], int.Parse(_configuration["Smtp:Port"]), SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_configuration["Smtp:Username"], _configuration["Smtp:Password"]);
            
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("PetCare Services", "no-reply@petcare.com"));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;
            message.Body = new TextPart("plain") { Text = body };
            
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            */

            // Log the email to console for development/testing
            Console.WriteLine($"[MOCK EMAIL] To: {toEmail}, Subject: {subject}, Body: {body}");
            await Task.CompletedTask;
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            if (!BC.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
                return false;

            user.PasswordHash = BC.HashPassword(changePasswordDto.NewPassword);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "YourVeryLongSecretKeyForJwtTokenGenerationWithAtLeast32Characters1234567890"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("RoleId", user.RoleId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
