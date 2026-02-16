using System.Net;
using System.Net.Http.Json;
using PetCareAPI.Models.DTOs;
using Xunit;

namespace PetCareAPI.Tests
{
    public class AuthTests : IClassFixture<IntegrationTestBase>
    {
        private readonly HttpClient _client;

        public AuthTests(IntegrationTestBase factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Register_InvalidEmail_ReturnsBadRequest()
        {
            var dto = new RegisterDto
            {
                Email = "invalid-email",
                Password = "Password123!",
                FirstName = "Test",
                LastName = "User",
                PhoneNumber = "+1234567890",
                RoleId = 1 // Owner
            };

            var response = await _client.PostAsJsonAsync("/api/auth/register", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Register_WeakPassword_ReturnsBadRequest()
        {
            var dto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "weak",
                FirstName = "Test",
                LastName = "User",
                PhoneNumber = "+1234567890",
                RoleId = 1
            };

            var response = await _client.PostAsJsonAsync("/api/auth/register", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Register_InvalidPhone_ReturnsBadRequest()
        {
            var dto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "Password123!",
                FirstName = "Test",
                LastName = "User",
                PhoneNumber = "not-a-phone",
                RoleId = 1
            };

            var response = await _client.PostAsJsonAsync("/api/auth/register", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task ForgotPassword_ValidEmail_ReturnsOk()
        {
            // First register a user
            var registerDto = new RegisterDto
            {
                Email = "forgot@example.com",
                Password = "Password123!",
                FirstName = "Forgot",
                LastName = "User",
                PhoneNumber = "+12345678901",
                RoleId = 1
            };
            await _client.PostAsJsonAsync("/api/auth/register", registerDto);

            var forgotDto = new ForgotPasswordDto { Email = "forgot@example.com" };
            var response = await _client.PostAsJsonAsync("/api/auth/forgot-password", forgotDto);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}
