# PetCare Services API - C# Setup Guide

## Project Overview
This guide provides a complete C# ASP.NET Core API structure for the PetCare Services mobile application with appointment booking, provider management, and user authentication.

## Database Recommendation

### **PostgreSQL (Recommended)**
- **Why**: Free, open-source, production-ready, excellent for mobile backends
- **Installation**: https://www.postgresql.org/download/
- **Connection String Format**:
  ```
  Server=localhost;Port=5432;Database=petcare;User Id=postgres;Password=yourpassword;
  ```
- **Download**: Free from official site
- **Alternatives**:
  - MySQL (free, popular)
  - SQL Server Express (Microsoft's free tier, Windows only)
  - SQLite (lightweight, file-based, good for development)

---

## Project Structure

```
PetCareAPI/
├── PetCare.API/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── UsersController.cs
│   │   ├── ProvidersController.cs
│   │   ├── AppointmentsController.cs
│   │   ├── AvailabilityController.cs
│   │   └── PaymentController.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Provider.cs
│   │   ├── Appointment.cs
│   │   ├── Availability.cs
│   │   ├── Payment.cs
│   │   └── DTOs/
│   │       ├── RegisterRequest.cs
│   │       ├── LoginRequest.cs
│   │       ├── CreateAppointmentRequest.cs
│   │       └── ...
│   ├── Services/
│   │   ├── IAuthService.cs
│   │   ├── AuthService.cs
│   │   ├── IProviderService.cs
│   │   ├── ProviderService.cs
│   │   ├── IAppointmentService.cs
│   │   ├── AppointmentService.cs
│   │   └── ...
│   ├── Data/
│   │   ├── PetCareContext.cs
│   │   └── Migrations/
│   ├── Middleware/
│   │   └── ErrorHandlingMiddleware.cs
│   ├── appsettings.json
│   ├── Program.cs
│   └── Startup.cs
└── PetCare.Tests/
    └── [Unit Tests]
```

---

## Step-by-Step Setup

### 1. Create ASP.NET Core API Project

```bash
dotnet new webapi -n PetCareAPI -f net8.0
cd PetCareAPI
```

### 2. Install NuGet Packages

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package FluentValidation.DependencyInjectionExtensions
```

---

## Core Files

### Models (Entities)

**User.cs**
```csharp
using System;
using System.Collections.Generic;

namespace PetCareAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string UserType { get; set; } // "Owner" or "Provider"
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;

        public virtual Provider Provider { get; set; }
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
```

**Provider.cs**
```csharp
using System;
using System.Collections.Generic;

namespace PetCareAPI.Models
{
    public class Provider
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; }
        public string Description { get; set; }
        public string ServiceType { get; set; } // "Grooming", "Training", "Walking", etc.
        public decimal HourlyRate { get; set; }
        public decimal Rating { get; set; } = 5.0m;
        public int ReviewCount { get; set; } = 0;
        public string Address { get; set; }
        public string City { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string ProfileImageUrl { get; set; }
        public bool IsVerified { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public virtual User User { get; set; }
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public virtual ICollection<Availability> Availabilities { get; set; } = new List<Availability>();
    }
}
```

**Appointment.cs**
```csharp
using System;

namespace PetCareAPI.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }
        public int ProviderId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } // "Pending", "Confirmed", "Completed", "Cancelled"
        public string PetName { get; set; }
        public string PetType { get; set; } // "Dog", "Cat", etc.
        public string Description { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public virtual User Owner { get; set; }
        public virtual Provider Provider { get; set; }
        public virtual Payment Payment { get; set; }
    }
}
```

**Availability.cs**
```csharp
using System;

namespace PetCareAPI.Models
{
    public class Availability
    {
        public int Id { get; set; }
        public int ProviderId { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsBooked { get; set; } = false;
        public DateTime CreatedAt { get; set; }

        public virtual Provider Provider { get; set; }
    }
}
```

**Payment.cs**
```csharp
using System;

namespace PetCareAPI.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } // "Pending", "Completed", "Failed"
        public string PaymentMethod { get; set; } // "Card", "Wallet", etc.
        public string TransactionId { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public virtual Appointment Appointment { get; set; }
        public virtual User User { get; set; }
    }
}
```

### Data Context

**PetCareContext.cs**
```csharp
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Models;

namespace PetCareAPI.Data
{
    public class PetCareContext : DbContext
    {
        public PetCareContext(DbContextOptions<PetCareContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Provider> Providers { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Availability> Availabilities { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Provider Configuration
            modelBuilder.Entity<Provider>()
                .HasOne(p => p.User)
                .WithOne(u => u.Provider)
                .HasForeignKey<Provider>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Appointment Configuration
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Owner)
                .WithMany(u => u.Appointments)
                .HasForeignKey(a => a.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Provider)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.ProviderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Availability Configuration
            modelBuilder.Entity<Availability>()
                .HasOne(a => a.Provider)
                .WithMany(p => p.Availabilities)
                .HasForeignKey(a => a.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Payment Configuration
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Appointment)
                .WithOne(a => a.Payment)
                .HasForeignKey<Payment>(p => p.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.User)
                .WithMany(u => u.Payments)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### DTOs (Data Transfer Objects)

**LoginRequest.cs**
```csharp
using System.ComponentModel.DataAnnotations;

namespace PetCareAPI.Models.DTOs
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }
    }
}
```

**RegisterRequest.cs**
```csharp
using System.ComponentModel.DataAnnotations;

namespace PetCareAPI.Models.DTOs
{
    public class RegisterRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        public string PhoneNumber { get; set; }

        [Required]
        public string UserType { get; set; } // "Owner" or "Provider"
    }
}
```

**AuthResponse.cs**
```csharp
namespace PetCareAPI.Models.DTOs
{
    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Token { get; set; }
        public UserDto User { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserType { get; set; }
    }
}
```

### Services

**IAuthService.cs**
```csharp
using System.Threading.Tasks;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;

namespace PetCareAPI.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<User> GetUserByEmailAsync(string email);
        string GenerateJwtToken(User user);
    }
}
```

**AuthService.cs**
```csharp
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PetCareAPI.Data;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;

namespace PetCareAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly PetCareContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(PetCareContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return new AuthResponse { Success = false, Message = "Email already exists" };
            }

            var user = new User
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                UserType = request.UserType,
                PasswordHash = HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "User registered successfully",
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    UserType = user.UserType
                }
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return new AuthResponse { Success = false, Message = "Invalid email or password" };
            }

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    UserType = user.UserType
                }
            };
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<System.Security.Claims.Claim>
            {
                new(System.Security.Claims.ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(System.Security.Claims.ClaimTypes.Email, user.Email),
                new("UserType", user.UserType)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput.Equals(hash);
        }
    }
}
```

### Controllers

**AuthController.cs**
```csharp
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PetCareAPI.Models.DTOs;
using PetCareAPI.Services;

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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterAsync(request);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(request);
            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }
    }
}
```

**ProvidersController.cs**
```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProvidersController : ControllerBase
    {
        private readonly PetCareContext _context;

        public ProvidersController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Provider>>> GetProviders(
            [FromQuery] string serviceType = null,
            [FromQuery] string city = null)
        {
            var query = _context.Providers
                .Include(p => p.User)
                .Include(p => p.Availabilities)
                .AsQueryable();

            if (!string.IsNullOrEmpty(serviceType))
                query = query.Where(p => p.ServiceType == serviceType);

            if (!string.IsNullOrEmpty(city))
                query = query.Where(p => p.City == city);

            return await query.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Provider>> GetProvider(int id)
        {
            var provider = await _context.Providers
                .Include(p => p.User)
                .Include(p => p.Availabilities)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (provider == null)
                return NotFound();

            return provider;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Provider>> CreateProvider([FromBody] Provider provider)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            provider.UserId = int.Parse(userIdClaim.Value);
            _context.Providers.Add(provider);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProvider), new { id = provider.Id }, provider);
        }
    }
}
```

**AppointmentsController.cs**
```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly PetCareContext _context;

        public AppointmentsController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            return await _context.Appointments
                .Where(a => a.OwnerId == userId || a.Provider.UserId == userId)
                .Include(a => a.Owner)
                .Include(a => a.Provider)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Appointment>> CreateAppointment(
            [FromBody] CreateAppointmentRequest request)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var appointment = new Appointment
            {
                OwnerId = int.Parse(userIdClaim.Value),
                ProviderId = request.ProviderId,
                AppointmentDate = request.AppointmentDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                PetName = request.PetName,
                PetType = request.PetType,
                Description = request.Description,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAppointments), appointment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] Appointment appointment)
        {
            var existing = await _context.Appointments.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Status = appointment.Status;
            existing.UpdatedAt = DateTime.UtcNow;

            _context.Appointments.Update(existing);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
```

### Program.cs Configuration

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PetCareAPI.Data;
using PetCareAPI.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<PetCareContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL")));

// Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]))
        };
    });

// Services
builder.Services.AddScoped<IAuthService, AuthService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### appsettings.json

```json
{
  "ConnectionStrings": {
    "PostgreSQL": "Server=localhost;Port=5432;Database=petcare;User Id=postgres;Password=yourpassword;"
  },
  "Jwt": {
    "Key": "YourVeryLongSecretKeyForJwtTokenGenerationWithAtLeast32Characters",
    "Issuer": "PetCareAPI",
    "Audience": "PetCareApp"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

---

## Database Setup

### PostgreSQL Installation & Setup

1. **Install PostgreSQL**:
   - Download: https://www.postgresql.org/download/
   - Follow installer instructions

2. **Create Database**:
   ```sql
   CREATE DATABASE petcare;
   ```

3. **Apply Migrations**:
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

### Connection String by Database Type

**PostgreSQL**:
```
Server=localhost;Port=5432;Database=petcare;User Id=postgres;Password=yourpassword;
```

**MySQL**:
```
Server=localhost;Port=3306;Database=petcare;Uid=root;Pwd=yourpassword;
```

**SQL Server Express**:
```
Server=(localdb)\mssqllocaldb;Database=petcare;Trusted_Connection=true;
```

**SQLite** (Development):
```
Data Source=petcare.db
```

---

## Running the API

```bash
# Restore dependencies
dotnet restore

# Apply migrations
dotnet ef database update

# Run the API
dotnet run

# API will be available at https://localhost:7000
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Providers
- `GET /api/providers` - List all providers (with filtering)
- `GET /api/providers/{id}` - Get provider details
- `POST /api/providers` - Create new provider (Auth required)

### Appointments
- `GET /api/appointments` - Get user appointments (Auth required)
- `POST /api/appointments` - Create appointment (Auth required)
- `PUT /api/appointments/{id}` - Update appointment status (Auth required)

### Availability
- `GET /api/availability/{providerId}` - Get provider availability slots
- `POST /api/availability` - Add availability slots (Auth required)

---

## Environment Variables

Create `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=petcare
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=YourVeryLongSecretKeyForJwtTokenGenerationWithAtLeast32Characters
JWT_ISSUER=PetCareAPI
JWT_AUDIENCE=PetCareApp
```

---

## Best Practices Implemented

1. **Entity Framework Core** for database operations
2. **JWT Authentication** for secure API access
3. **Service Pattern** for business logic separation
4. **DTOs** for request/response handling
5. **Dependency Injection** for loose coupling
6. **Repository Pattern** ready (can be extended)
7. **CORS** configured for mobile app
8. **Async/Await** for scalability
9. **Proper error handling** via middleware
10. **Data validation** with ModelState

---

## Next Steps

1. Install PostgreSQL
2. Create the project structure
3. Install NuGet packages
4. Configure connection string
5. Run migrations
6. Test endpoints with Postman or Swagger UI
7. Connect from React Native app using:
   ```typescript
   const API_BASE_URL = 'https://localhost:7000/api';
   ```

