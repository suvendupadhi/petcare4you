using System.Net;
using System.Net.Http.Json;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;
using Xunit;

namespace PetCareAPI.Tests
{
    public class TipsTests : IClassFixture<IntegrationTestBase>
    {
        private readonly HttpClient _client;

        public TipsTests(IntegrationTestBase factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task CreateAndGetTip_Success()
        {
            // 1. Register and Login to get token
            var registerDto = new RegisterDto
            {
                Email = "admin@test.com",
                Password = "Password123!",
                FirstName = "Admin",
                LastName = "User",
                PhoneNumber = "+12345678903",
                RoleId = 3 // Admin
            };
            var regResponse = await _client.PostAsJsonAsync("/api/auth/register", registerDto);
            Assert.Equal(HttpStatusCode.Created, regResponse.StatusCode);
            
            var loginDto = new LoginDto { Email = registerDto.Email, Password = registerDto.Password };
            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
            Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
            var authResult = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
            Assert.NotNull(authResult?.Token);
            Assert.NotEmpty(authResult.Token);
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authResult.Token);

            // 2. Create tip
            var tipDto = new TipCreateDto
            {
                Title = "Test Tip",
                Content = "Test Content",
                UserRoleId = null, // Global tip
                ServiceTypeId = 1, // General
                IsActive = true
            };

            var createResponse = await _client.PostAsJsonAsync("/api/tips", tipDto);
            if (createResponse.StatusCode == HttpStatusCode.Unauthorized)
            {
                var body = await createResponse.Content.ReadAsStringAsync();
                throw new Exception($"Unauthorized: {body}");
            }
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

            var tips = await _client.GetFromJsonAsync<List<Tip>>("/api/tips");
            Assert.Contains(tips, t => t.Title == "Test Tip");
        }

        [Fact]
        public async Task SearchProviders_Normalization_Success()
        {
            // Reset authorization for this test
            _client.DefaultRequestHeaders.Authorization = null;

            // 1. Register a user for the provider
            var registerDto = new RegisterDto
            {
                Email = "provider@test.com",
                Password = "Password123!",
                FirstName = "Test",
                LastName = "Provider",
                PhoneNumber = "+12345678902",
                RoleId = 2 // Provider role
            };
            var regResponse = await _client.PostAsJsonAsync("/api/auth/register", registerDto);
            Assert.Equal(HttpStatusCode.Created, regResponse.StatusCode);

            // 2. Login to get token for creating provider profile
            var loginDto = new LoginDto { Email = registerDto.Email, Password = registerDto.Password };
            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
            Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
            var authResult = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
            Assert.NotNull(authResult?.Token);
            Assert.NotEmpty(authResult.Token);
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authResult.Token);

            // 3. Create a provider profile in "New York"
            var providerDto = new ProviderUpdateDto
            {
                CompanyName = "Test Business",
                Description = "This is a test business description with enough length.",
                HourlyRate = 50.0m,
                Address = "123 Main St",
                City = "New York",
                ServiceTypeIds = new List<int> { 1 }
            };
            var createResponse = await _client.PostAsJsonAsync("/api/providers", providerDto);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

            // 4. Search with mixed case and spaces
            var response = await _client.GetAsync("/api/providers?city=  nEW   yORk  ");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var results = await response.Content.ReadFromJsonAsync<List<Provider>>();
            Assert.Contains(results, p => p.City == "New York");
        }
    }
}
