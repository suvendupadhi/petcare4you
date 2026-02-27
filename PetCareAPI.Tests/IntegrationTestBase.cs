using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PetCareAPI.Data;
using PetCareAPI.Models;
using System;
using System.Linq;
using System.Net.Http;

namespace PetCareAPI.Tests
{
    public class IntegrationTestBase : WebApplicationFactory<Program>
    {
        private readonly string _dbName = Guid.NewGuid().ToString();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseSetting("Jwt:Key", "YourVeryLongSecretKeyForJwtTokenGenerationWithAtLeast32Characters1234567890");
            builder.UseSetting("Jwt:Issuer", "PetCareAPI");
            builder.UseSetting("Jwt:Audience", "PetCareApp");

            builder.ConfigureServices(services =>
            {
                // Remove the existing DbContext registration
                var descriptors = services.Where(
                    d => d.ServiceType.Namespace != null && 
                         (d.ServiceType.Namespace.Contains("EntityFrameworkCore") || 
                          d.ServiceType.Namespace.Contains("Npgsql"))).ToList();

                foreach (var descriptor in descriptors)
                {
                    services.Remove(descriptor);
                }

                // Specifically remove the PetCare4YouContext
                var contextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<PetCare4YouContext>));
                if (contextDescriptor != null) services.Remove(contextDescriptor);

                services.AddDbContext<PetCare4YouContext>(options =>
                {
                    options.UseInMemoryDatabase(_dbName);
                });
            });
        }

        // We override CreateDefaultClient to ensure seeding happens
        public new HttpClient CreateClient()
        {
            var client = base.CreateClient();
            
            using (var scope = Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<PetCare4YouContext>();
                db.Database.EnsureCreated();
                SeedData(db);
            }

            return client;
        }

        private void SeedData(PetCare4YouContext db)
        {
            lock (_seedLock)
            {
                if (!db.UserRoles.Any())
                {
                    db.UserRoles.AddRange(
                        new UserRole { Id = 1, RoleName = "owner", Description = "Pet Owner" },
                        new UserRole { Id = 2, RoleName = "provider", Description = "Service Provider" },
                        new UserRole { Id = 3, RoleName = "admin", Description = "Administrator" }
                    );
                    db.SaveChanges();
                }

                if (!db.ServiceTypes.Any())
                {
                    db.ServiceTypes.Add(new ServiceType { Id = 1, Name = "Pet Grooming", Description = "Professional grooming services" });
                    db.SaveChanges();
                }
            }
        }

        private static readonly object _seedLock = new object();
    }
}
