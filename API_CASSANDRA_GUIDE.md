# PetCare Services API - C# with Apache Cassandra Guide

## Database: Apache Cassandra

### Why Cassandra for PetCare?

✓ **Free & Open-Source** - No licensing costs  
✓ **Highly Scalable** - Handles millions of appointments/bookings  
✓ **Distributed** - High availability across regions  
✓ **Fast Reads/Writes** - Optimized for time-series data (appointments, availability)  
✓ **Perfect for Mobile Backends** - Low latency, eventual consistency  
✓ **No Complex Joins** - Simplified queries for mobile apps  

### Cassandra vs PostgreSQL for This Project

| Feature | Cassandra | PostgreSQL |
|---------|-----------|-----------|
| Data Model | Wide-column, denormalized | Relational, normalized |
| Scalability | Horizontal (distributed) | Vertical |
| Consistency | Eventual | Strong (ACID) |
| Best For | High-traffic, time-series | Complex queries, transactions |
| Learning Curve | Moderate | Low |
| Mobile Backend | Excellent | Good |

---

## Installation

### 1. Install Apache Cassandra

**Windows**:
```bash
# Download from Apache: https://cassandra.apache.org/download/
# Or use Docker (Recommended)
docker run -d -p 9042:9042 -p 7199:7199 cassandra:4.1
```

**macOS**:
```bash
brew install cassandra
brew services start cassandra
```

**Linux**:
```bash
apt-get install cassandra
sudo systemctl start cassandra
```

**Docker Compose** (Recommended):
```yaml
version: '3'
services:
  cassandra:
    image: cassandra:4.1
    ports:
      - "9042:9042"
    environment:
      CASSANDRA_CLUSTER_NAME: PetCareCluster
    volumes:
      - cassandra_data:/var/lib/cassandra
    healthcheck:
      test: ["CMD", "cqlsh", "-e", "describe cluster"]
      interval: 15s
      timeout: 10s
      retries: 5

volumes:
  cassandra_data:
```

### 2. Verify Installation

```bash
# Connect to Cassandra
cqlsh localhost 9042

# Create keyspace
CREATE KEYSPACE IF NOT EXISTS petcare WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 3};
USE petcare;

# Verify
DESCRIBE KEYSPACES;
```

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
│   │       ├── LoginRequest.cs
│   │       ├── RegisterRequest.cs
│   │       └── ...
│   ├── Data/
│   │   ├── CassandraSession.cs
│   │   └── DatabaseInitializer.cs
│   ├── Repositories/
│   │   ├── IUserRepository.cs
│   │   ├── UserRepository.cs
│   │   ├── IProviderRepository.cs
│   │   ├── ProviderRepository.cs
│   │   ├── IAppointmentRepository.cs
│   │   └── AppointmentRepository.cs
│   ├── Services/
│   │   ├── IAuthService.cs
│   │   ├── AuthService.cs
│   │   ├── IProviderService.cs
│   │   ├── ProviderService.cs
│   │   └── ...
│   ├── appsettings.json
│   └── Program.cs
└── PetCare.Tests/
```

---

## NuGet Packages

```bash
dotnet new webapi -n PetCareAPI -f net8.0
cd PetCareAPI

dotnet add package CassandraDriver
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package FluentValidation.DependencyInjectionExtensions
dotnet add package Serilog.AspNetCore
```

---

## Cassandra Schema Setup

Create file: `cassandra-init.cql`

```cql
-- Create Keyspace
CREATE KEYSPACE IF NOT EXISTS petcare
WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 3}
AND DURABLE_WRITES = true;

USE petcare;

-- Users Table (Partition by email for quick lookup)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email text,
    password_hash text,
    first_name text,
    last_name text,
    phone_number text,
    user_type text,
    is_active boolean,
    created_at timestamp,
    updated_at timestamp
);

-- User lookup by email (Secondary Index)
CREATE TABLE IF NOT EXISTS users_by_email (
    email text PRIMARY KEY,
    user_id UUID
);

-- Providers Table (Partition by city for geographic queries)
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY,
    user_id UUID,
    company_name text,
    description text,
    service_type text,
    hourly_rate decimal,
    rating decimal,
    review_count int,
    address text,
    city text,
    latitude decimal,
    longitude decimal,
    profile_image_url text,
    is_verified boolean,
    created_at timestamp,
    updated_at timestamp
);

-- Providers lookup by city and service type
CREATE TABLE IF NOT EXISTS providers_by_city (
    city text,
    service_type text,
    id UUID,
    company_name text,
    rating decimal,
    hourly_rate decimal,
    PRIMARY KEY ((city, service_type), rating, id)
) WITH CLUSTERING ORDER BY (rating DESC, id ASC);

-- Providers lookup by user
CREATE TABLE IF NOT EXISTS providers_by_user (
    user_id UUID PRIMARY KEY,
    provider_id UUID,
    company_name text
);

-- Appointments Table (Partition by owner for quick user queries)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY,
    owner_id UUID,
    provider_id UUID,
    appointment_date date,
    start_time time,
    end_time time,
    status text,
    pet_name text,
    pet_type text,
    description text,
    total_price decimal,
    created_at timestamp,
    updated_at timestamp
);

-- Appointments by owner
CREATE TABLE IF NOT EXISTS appointments_by_owner (
    owner_id UUID,
    created_at timestamp,
    id UUID,
    provider_id UUID,
    appointment_date date,
    status text,
    pet_name text,
    PRIMARY KEY ((owner_id), created_at, id)
) WITH CLUSTERING ORDER BY (created_at DESC, id ASC);

-- Appointments by provider
CREATE TABLE IF NOT EXISTS appointments_by_provider (
    provider_id UUID,
    appointment_date date,
    id UUID,
    owner_id UUID,
    status text,
    pet_name text,
    start_time time,
    PRIMARY KEY ((provider_id, appointment_date), id)
) WITH CLUSTERING ORDER BY (id ASC);

-- Availability Table (Partition by provider and date)
CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY,
    provider_id UUID,
    date date,
    start_time time,
    end_time time,
    is_booked boolean,
    created_at timestamp
);

-- Availability by provider
CREATE TABLE IF NOT EXISTS availability_by_provider (
    provider_id UUID,
    date date,
    id UUID,
    start_time time,
    end_time time,
    is_booked boolean,
    PRIMARY KEY ((provider_id), date, id)
) WITH CLUSTERING ORDER BY (date ASC, id ASC);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY,
    appointment_id UUID,
    user_id UUID,
    amount decimal,
    status text,
    payment_method text,
    transaction_id text,
    payment_date timestamp,
    created_at timestamp
);

-- Payments by user
CREATE TABLE IF NOT EXISTS payments_by_user (
    user_id UUID,
    payment_date timestamp,
    id UUID,
    appointment_id UUID,
    amount decimal,
    status text,
    PRIMARY KEY ((user_id), payment_date, id)
) WITH CLUSTERING ORDER BY (payment_date DESC, id ASC);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS ON users (email);
CREATE INDEX IF NOT EXISTS ON providers (user_id);
CREATE INDEX IF NOT EXISTS ON appointments (owner_id);
CREATE INDEX IF NOT EXISTS ON appointments (provider_id);
```

---

## Core Files

### Models

**User.cs**
```csharp
using System;

namespace PetCareAPI.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string UserType { get; set; } // "Owner" or "Provider"
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
```

**Provider.cs**
```csharp
using System;

namespace PetCareAPI.Models
{
    public class Provider
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string CompanyName { get; set; }
        public string Description { get; set; }
        public string ServiceType { get; set; } // "Grooming", "Training", "Walking"
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
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public Guid ProviderId { get; set; }
        public LocalDate AppointmentDate { get; set; }
        public LocalTime StartTime { get; set; }
        public LocalTime EndTime { get; set; }
        public string Status { get; set; } // "Pending", "Confirmed", "Completed", "Cancelled"
        public string PetName { get; set; }
        public string PetType { get; set; }
        public string Description { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
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
        public Guid Id { get; set; }
        public Guid ProviderId { get; set; }
        public LocalDate Date { get; set; }
        public LocalTime StartTime { get; set; }
        public LocalTime EndTime { get; set; }
        public bool IsBooked { get; set; } = false;
        public DateTime CreatedAt { get; set; }
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
        public Guid Id { get; set; }
        public Guid AppointmentId { get; set; }
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } // "Pending", "Completed", "Failed"
        public string PaymentMethod { get; set; }
        public string TransactionId { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
```

### Cassandra Session Management

**CassandraSession.cs**
```csharp
using Cassandra;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetCareAPI.Data
{
    public interface ICassandraSession
    {
        ISession Session { get; }
        Task<IEnumerable<T>> ExecuteAsync<T>(string query, params object[] parameters);
        Task ExecuteAsync(string query, params object[] parameters);
        Task<T> ExecuteScalarAsync<T>(string query, params object[] parameters);
    }

    public class CassandraSession : ICassandraSession
    {
        private readonly ISession _session;
        private readonly ILogger<CassandraSession> _logger;

        public ISession Session => _session;

        public CassandraSession(IConfiguration configuration, ILogger<CassandraSession> logger)
        {
            _logger = logger;

            var contactPoints = configuration["Cassandra:ContactPoints"].Split(",");
            var keyspace = configuration["Cassandra:Keyspace"];

            try
            {
                var cluster = Cluster.Builder()
                    .AddContactPoints(contactPoints)
                    .WithDefaultKeyspace(keyspace)
                    .Build();

                _session = cluster.Connect();
                _logger.LogInformation("Connected to Cassandra cluster: {Keyspace}", keyspace);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to Cassandra");
                throw;
            }
        }

        public async Task<IEnumerable<T>> ExecuteAsync<T>(string query, params object[] parameters)
        {
            try
            {
                var statement = _session.Prepare(query);
                var boundStatement = statement.Bind(parameters);
                var result = await _session.ExecuteAsync(boundStatement);

                var items = new List<T>();
                foreach (var row in result)
                {
                    items.Add(MapRowToObject<T>(row));
                }

                return items;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing query: {Query}", query);
                throw;
            }
        }

        public async Task ExecuteAsync(string query, params object[] parameters)
        {
            try
            {
                var statement = _session.Prepare(query);
                var boundStatement = statement.Bind(parameters);
                await _session.ExecuteAsync(boundStatement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing query: {Query}", query);
                throw;
            }
        }

        public async Task<T> ExecuteScalarAsync<T>(string query, params object[] parameters)
        {
            try
            {
                var statement = _session.Prepare(query);
                var boundStatement = statement.Bind(parameters);
                var result = await _session.ExecuteAsync(boundStatement);
                var row = result.FirstOrDefault();

                return row != null ? (T)Convert.ChangeType(row[0], typeof(T)) : default;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing scalar query: {Query}", query);
                throw;
            }
        }

        private T MapRowToObject<T>(Row row)
        {
            var type = typeof(T);
            var obj = Activator.CreateInstance<T>();
            var properties = type.GetProperties();

            foreach (var property in properties)
            {
                try
                {
                    var columnName = ToSnakeCase(property.Name);
                    if (row.GetValue(columnName) != null)
                    {
                        var value = row.GetValue(columnName);
                        property.SetValue(obj, value);
                    }
                }
                catch { }
            }

            return obj;
        }

        private string ToSnakeCase(string str)
        {
            return System.Text.RegularExpressions.Regex.Replace(
                str,
                "(?<!^)([A-Z][a-z]|(?<=[a-z])[A-Z])",
                "_$1",
                System.Text.RegularExpressions.RegexOptions.Compiled)
                .ToLower();
        }
    }
}
```

### Repositories

**IUserRepository.cs**
```csharp
using PetCareAPI.Models;
using System;
using System.Threading.Tasks;

namespace PetCareAPI.Repositories
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(Guid id);
        Task<User> GetByEmailAsync(string email);
        Task CreateAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(Guid id);
    }
}
```

**UserRepository.cs**
```csharp
using Cassandra;
using PetCareAPI.Data;
using PetCareAPI.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetCareAPI.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ISession _session;

        public UserRepository(ICassandraSession cassandraSession)
        {
            _session = cassandraSession.Session;
        }

        public async Task<User> GetByIdAsync(Guid id)
        {
            var query = "SELECT * FROM users WHERE id = ?";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(id);
            var result = await _session.ExecuteAsync(boundStatement);

            var row = result.FirstOrDefault();
            return row != null ? MapRow(row) : null;
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            var query = "SELECT user_id FROM users_by_email WHERE email = ?";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(email);
            var result = await _session.ExecuteAsync(boundStatement);

            var row = result.FirstOrDefault();
            if (row == null)
                return null;

            var userId = row.GetValue<Guid>("user_id");
            return await GetByIdAsync(userId);
        }

        public async Task CreateAsync(User user)
        {
            user.Id = Guid.NewGuid();
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            var query = @"INSERT INTO users 
                (id, email, password_hash, first_name, last_name, phone_number, user_type, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(
                user.Id, user.Email, user.PasswordHash, user.FirstName, 
                user.LastName, user.PhoneNumber, user.UserType, user.IsActive, 
                user.CreatedAt, user.UpdatedAt);

            await _session.ExecuteAsync(boundStatement);

            // Insert into lookup table
            var emailQuery = "INSERT INTO users_by_email (email, user_id) VALUES (?, ?)";
            var emailStatement = _session.Prepare(emailQuery);
            var emailBoundStatement = emailStatement.Bind(user.Email, user.Id);
            await _session.ExecuteAsync(emailBoundStatement);
        }

        public async Task UpdateAsync(User user)
        {
            user.UpdatedAt = DateTime.UtcNow;

            var query = @"UPDATE users 
                SET password_hash = ?, first_name = ?, last_name = ?, phone_number = ?, 
                    user_type = ?, is_active = ?, updated_at = ?
                WHERE id = ?";

            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(
                user.PasswordHash, user.FirstName, user.LastName, user.PhoneNumber,
                user.UserType, user.IsActive, user.UpdatedAt, user.Id);

            await _session.ExecuteAsync(boundStatement);
        }

        public async Task DeleteAsync(Guid id)
        {
            var user = await GetByIdAsync(id);
            if (user == null)
                return;

            var query = "DELETE FROM users WHERE id = ?";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(id);
            await _session.ExecuteAsync(boundStatement);

            // Delete from lookup table
            var emailQuery = "DELETE FROM users_by_email WHERE email = ?";
            var emailStatement = _session.Prepare(emailQuery);
            var emailBoundStatement = emailStatement.Bind(user.Email);
            await _session.ExecuteAsync(emailBoundStatement);
        }

        private User MapRow(Row row)
        {
            return new User
            {
                Id = row.GetValue<Guid>("id"),
                Email = row.GetValue<string>("email"),
                PasswordHash = row.GetValue<string>("password_hash"),
                FirstName = row.GetValue<string>("first_name"),
                LastName = row.GetValue<string>("last_name"),
                PhoneNumber = row.GetValue<string>("phone_number"),
                UserType = row.GetValue<string>("user_type"),
                IsActive = row.GetValue<bool>("is_active"),
                CreatedAt = row.GetValue<DateTime>("created_at"),
                UpdatedAt = row.GetValue<DateTime>("updated_at")
            };
        }
    }
}
```

**IProviderRepository.cs**
```csharp
using PetCareAPI.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetCareAPI.Repositories
{
    public interface IProviderRepository
    {
        Task<Provider> GetByIdAsync(Guid id);
        Task<Provider> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Provider>> GetByServiceTypeAndCityAsync(string serviceType, string city);
        Task<IEnumerable<Provider>> GetByCityAsync(string city);
        Task CreateAsync(Provider provider);
        Task UpdateAsync(Provider provider);
        Task DeleteAsync(Guid id);
    }
}
```

**ProviderRepository.cs**
```csharp
using Cassandra;
using PetCareAPI.Data;
using PetCareAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PetCareAPI.Repositories
{
    public class ProviderRepository : IProviderRepository
    {
        private readonly ISession _session;

        public ProviderRepository(ICassandraSession cassandraSession)
        {
            _session = cassandraSession.Session;
        }

        public async Task<Provider> GetByIdAsync(Guid id)
        {
            var query = "SELECT * FROM providers WHERE id = ?";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(id);
            var result = await _session.ExecuteAsync(boundStatement);

            var row = result.FirstOrDefault();
            return row != null ? MapRow(row) : null;
        }

        public async Task<Provider> GetByUserIdAsync(Guid userId)
        {
            var query = "SELECT provider_id FROM providers_by_user WHERE user_id = ?";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(userId);
            var result = await _session.ExecuteAsync(boundStatement);

            var row = result.FirstOrDefault();
            if (row == null)
                return null;

            var providerId = row.GetValue<Guid>("provider_id");
            return await GetByIdAsync(providerId);
        }

        public async Task<IEnumerable<Provider>> GetByServiceTypeAndCityAsync(string serviceType, string city)
        {
            var query = "SELECT * FROM providers_by_city WHERE city = ? AND service_type = ?";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(city, serviceType);
            var result = await _session.ExecuteAsync(boundStatement);

            return result.Select(MapRow).ToList();
        }

        public async Task<IEnumerable<Provider>> GetByCityAsync(string city)
        {
            var query = "SELECT * FROM providers WHERE city = ? ALLOW FILTERING";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(city);
            var result = await _session.ExecuteAsync(boundStatement);

            return result.Select(MapRow).ToList();
        }

        public async Task CreateAsync(Provider provider)
        {
            provider.Id = Guid.NewGuid();
            provider.CreatedAt = DateTime.UtcNow;
            provider.UpdatedAt = DateTime.UtcNow;

            var query = @"INSERT INTO providers 
                (id, user_id, company_name, description, service_type, hourly_rate, 
                 rating, review_count, address, city, latitude, longitude, 
                 profile_image_url, is_verified, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(
                provider.Id, provider.UserId, provider.CompanyName, provider.Description,
                provider.ServiceType, provider.HourlyRate, provider.Rating, provider.ReviewCount,
                provider.Address, provider.City, provider.Latitude, provider.Longitude,
                provider.ProfileImageUrl, provider.IsVerified, provider.CreatedAt, provider.UpdatedAt);

            await _session.ExecuteAsync(boundStatement);

            // Insert into lookup table
            var lookupQuery = "INSERT INTO providers_by_user (user_id, provider_id, company_name) VALUES (?, ?, ?)";
            var lookupStatement = _session.Prepare(lookupQuery);
            var lookupBoundStatement = lookupStatement.Bind(provider.UserId, provider.Id, provider.CompanyName);
            await _session.ExecuteAsync(lookupBoundStatement);

            // Insert into city lookup table
            var cityQuery = "INSERT INTO providers_by_city (city, service_type, id, company_name, rating, hourly_rate) VALUES (?, ?, ?, ?, ?, ?)";
            var cityStatement = _session.Prepare(cityQuery);
            var cityBoundStatement = cityStatement.Bind(provider.City, provider.ServiceType, provider.Id, provider.CompanyName, provider.Rating, provider.HourlyRate);
            await _session.ExecuteAsync(cityBoundStatement);
        }

        public async Task UpdateAsync(Provider provider)
        {
            provider.UpdatedAt = DateTime.UtcNow;

            var query = @"UPDATE providers 
                SET company_name = ?, description = ?, service_type = ?, hourly_rate = ?, 
                    rating = ?, review_count = ?, address = ?, city = ?, latitude = ?, 
                    longitude = ?, profile_image_url = ?, is_verified = ?, updated_at = ?
                WHERE id = ?";

            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(
                provider.CompanyName, provider.Description, provider.ServiceType, provider.HourlyRate,
                provider.Rating, provider.ReviewCount, provider.Address, provider.City, provider.Latitude,
                provider.Longitude, provider.ProfileImageUrl, provider.IsVerified, provider.UpdatedAt, provider.Id);

            await _session.ExecuteAsync(boundStatement);
        }

        public async Task DeleteAsync(Guid id)
        {
            var provider = await GetByIdAsync(id);
            if (provider == null)
                return;

            var query = "DELETE FROM providers WHERE id = ?";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(id);
            await _session.ExecuteAsync(boundStatement);

            // Delete from lookup tables
            var userLookupQuery = "DELETE FROM providers_by_user WHERE user_id = ?";
            var userLookupStatement = _session.Prepare(userLookupQuery);
            var userLookupBoundStatement = userLookupStatement.Bind(provider.UserId);
            await _session.ExecuteAsync(userLookupBoundStatement);
        }

        private Provider MapRow(Row row)
        {
            return new Provider
            {
                Id = row.GetValue<Guid>("id"),
                UserId = row.GetValue<Guid>("user_id"),
                CompanyName = row.GetValue<string>("company_name"),
                Description = row.GetValue<string>("description"),
                ServiceType = row.GetValue<string>("service_type"),
                HourlyRate = row.GetValue<decimal>("hourly_rate"),
                Rating = row.GetValue<decimal>("rating"),
                ReviewCount = row.GetValue<int>("review_count"),
                Address = row.GetValue<string>("address"),
                City = row.GetValue<string>("city"),
                Latitude = row.GetValue<decimal>("latitude"),
                Longitude = row.GetValue<decimal>("longitude"),
                ProfileImageUrl = row.GetValue<string>("profile_image_url"),
                IsVerified = row.GetValue<bool>("is_verified"),
                CreatedAt = row.GetValue<DateTime>("created_at"),
                UpdatedAt = row.GetValue<DateTime>("updated_at")
            };
        }
    }
}
```

**AppointmentRepository.cs**
```csharp
using Cassandra;
using PetCareAPI.Data;
using PetCareAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PetCareAPI.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly ISession _session;

        public AppointmentRepository(ICassandraSession cassandraSession)
        {
            _session = cassandraSession.Session;
        }

        public async Task<Appointment> GetByIdAsync(Guid id)
        {
            var query = "SELECT * FROM appointments WHERE id = ?";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(id);
            var result = await _session.ExecuteAsync(boundStatement);

            var row = result.FirstOrDefault();
            return row != null ? MapRow(row) : null;
        }

        public async Task<IEnumerable<Appointment>> GetByOwnerIdAsync(Guid ownerId)
        {
            var query = "SELECT * FROM appointments_by_owner WHERE owner_id = ? ORDER BY created_at DESC";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(ownerId);
            var result = await _session.ExecuteAsync(boundStatement);

            return result.Select(MapRow).ToList();
        }

        public async Task<IEnumerable<Appointment>> GetByProviderIdAsync(Guid providerId)
        {
            var query = "SELECT * FROM appointments_by_provider WHERE provider_id = ? ALLOW FILTERING";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(providerId);
            var result = await _session.ExecuteAsync(boundStatement);

            return result.Select(MapRow).ToList();
        }

        public async Task CreateAsync(Appointment appointment)
        {
            appointment.Id = Guid.NewGuid();
            appointment.CreatedAt = DateTime.UtcNow;
            appointment.UpdatedAt = DateTime.UtcNow;

            var query = @"INSERT INTO appointments 
                (id, owner_id, provider_id, appointment_date, start_time, end_time, 
                 status, pet_name, pet_type, description, total_price, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(
                appointment.Id, appointment.OwnerId, appointment.ProviderId, 
                appointment.AppointmentDate, appointment.StartTime, appointment.EndTime,
                appointment.Status, appointment.PetName, appointment.PetType, 
                appointment.Description, appointment.TotalPrice, appointment.CreatedAt, appointment.UpdatedAt);

            await _session.ExecuteAsync(boundStatement);

            // Insert into owner lookup
            var ownerQuery = "INSERT INTO appointments_by_owner (owner_id, created_at, id, provider_id, appointment_date, status, pet_name) VALUES (?, ?, ?, ?, ?, ?, ?)";
            var ownerStatement = _session.Prepare(ownerQuery);
            var ownerBoundStatement = ownerStatement.Bind(
                appointment.OwnerId, appointment.CreatedAt, appointment.Id, 
                appointment.ProviderId, appointment.AppointmentDate, appointment.Status, appointment.PetName);
            await _session.ExecuteAsync(ownerBoundStatement);
        }

        public async Task UpdateAsync(Appointment appointment)
        {
            appointment.UpdatedAt = DateTime.UtcNow;

            var query = @"UPDATE appointments 
                SET provider_id = ?, appointment_date = ?, start_time = ?, end_time = ?, 
                    status = ?, pet_name = ?, pet_type = ?, description = ?, total_price = ?, updated_at = ?
                WHERE id = ?";

            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(
                appointment.ProviderId, appointment.AppointmentDate, appointment.StartTime, 
                appointment.EndTime, appointment.Status, appointment.PetName, appointment.PetType, 
                appointment.Description, appointment.TotalPrice, appointment.UpdatedAt, appointment.Id);

            await _session.ExecuteAsync(boundStatement);
        }

        public async Task DeleteAsync(Guid id)
        {
            var query = "DELETE FROM appointments WHERE id = ?";
            var statement = _session.Prepare(query);
            var boundStatement = statement.Bind(id);
            await _session.ExecuteAsync(boundStatement);
        }

        private Appointment MapRow(Row row)
        {
            return new Appointment
            {
                Id = row.GetValue<Guid>("id"),
                OwnerId = row.GetValue<Guid>("owner_id"),
                ProviderId = row.GetValue<Guid>("provider_id"),
                AppointmentDate = row.GetValue<LocalDate>("appointment_date"),
                StartTime = row.GetValue<LocalTime>("start_time"),
                EndTime = row.GetValue<LocalTime>("end_time"),
                Status = row.GetValue<string>("status"),
                PetName = row.GetValue<string>("pet_name"),
                PetType = row.GetValue<string>("pet_type"),
                Description = row.GetValue<string>("description"),
                TotalPrice = row.GetValue<decimal>("total_price"),
                CreatedAt = row.GetValue<DateTime>("created_at"),
                UpdatedAt = row.GetValue<DateTime>("updated_at")
            };
        }
    }
}
```

**IAppointmentRepository.cs**
```csharp
using PetCareAPI.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetCareAPI.Repositories
{
    public interface IAppointmentRepository
    {
        Task<Appointment> GetByIdAsync(Guid id);
        Task<IEnumerable<Appointment>> GetByOwnerIdAsync(Guid ownerId);
        Task<IEnumerable<Appointment>> GetByProviderIdAsync(Guid providerId);
        Task CreateAsync(Appointment appointment);
        Task UpdateAsync(Appointment appointment);
        Task DeleteAsync(Guid id);
    }
}
```

### Services

**IAuthService.cs**
```csharp
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;
using System.Threading.Tasks;

namespace PetCareAPI.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
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
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;
using PetCareAPI.Repositories;

namespace PetCareAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
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
                IsActive = true
            };

            await _userRepository.CreateAsync(user);

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
            var user = await _userRepository.GetByEmailAsync(request.Email);
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
using Microsoft.AspNetCore.Mvc;
using PetCareAPI.Models.DTOs;
using PetCareAPI.Services;
using System.Threading.Tasks;

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
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(request);
            return result.Success ? Ok(result) : Unauthorized(result);
        }
    }
}
```

**ProvidersController.cs**
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCareAPI.Models;
using PetCareAPI.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProvidersController : ControllerBase
    {
        private readonly IProviderRepository _providerRepository;

        public ProvidersController(IProviderRepository providerRepository)
        {
            _providerRepository = providerRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Provider>>> GetProviders(
            [FromQuery] string serviceType = null,
            [FromQuery] string city = null)
        {
            if (!string.IsNullOrEmpty(serviceType) && !string.IsNullOrEmpty(city))
                return Ok(await _providerRepository.GetByServiceTypeAndCityAsync(serviceType, city));

            if (!string.IsNullOrEmpty(city))
                return Ok(await _providerRepository.GetByCityAsync(city));

            return Ok(new List<Provider>());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Provider>> GetProvider(Guid id)
        {
            var provider = await _providerRepository.GetByIdAsync(id);
            if (provider == null)
                return NotFound();

            return Ok(provider);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Provider>> CreateProvider([FromBody] Provider provider)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            provider.UserId = Guid.Parse(userIdClaim.Value);
            await _providerRepository.CreateAsync(provider);

            return CreatedAtAction(nameof(GetProvider), new { id = provider.Id }, provider);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProvider(Guid id, [FromBody] Provider provider)
        {
            var existing = await _providerRepository.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            provider.Id = id;
            await _providerRepository.UpdateAsync(provider);

            return NoContent();
        }
    }
}
```

**AppointmentsController.cs**
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;
using PetCareAPI.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentRepository _appointmentRepository;

        public AppointmentsController(IAppointmentRepository appointmentRepository)
        {
            _appointmentRepository = appointmentRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);
            return Ok(await _appointmentRepository.GetByOwnerIdAsync(userId));
        }

        [HttpPost]
        public async Task<ActionResult<Appointment>> CreateAppointment([FromBody] CreateAppointmentRequest request)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var appointment = new Appointment
            {
                OwnerId = Guid.Parse(userIdClaim.Value),
                ProviderId = request.ProviderId,
                AppointmentDate = request.AppointmentDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                PetName = request.PetName,
                PetType = request.PetType,
                Description = request.Description,
                Status = "Pending"
            };

            await _appointmentRepository.CreateAsync(appointment);
            return CreatedAtAction(nameof(GetAppointments), appointment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(Guid id, [FromBody] Appointment appointment)
        {
            var existing = await _appointmentRepository.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            appointment.Id = id;
            await _appointmentRepository.UpdateAsync(appointment);
            return NoContent();
        }
    }
}
```

### Program.cs

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PetCareAPI.Data;
using PetCareAPI.Repositories;
using PetCareAPI.Services;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cassandra
builder.Services.AddSingleton<ICassandraSession, CassandraSession>();

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProviderRepository, ProviderRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();

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

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
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
  "Cassandra": {
    "ContactPoints": "localhost",
    "Port": 9042,
    "Keyspace": "petcare"
  },
  "Jwt": {
    "Key": "YourVeryLongSecretKeyForJwtTokenGenerationWithAtLeast32Characters",
    "Issuer": "PetCareAPI",
    "Audience": "PetCareApp"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Cassandra": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

---

## Cassandra vs Relational Database Comparison

### Cassandra Advantages for PetCare:
- **High Write Throughput** - Many appointment bookings simultaneously
- **Time-Series Optimized** - Appointments/availability by date
- **Geographic Scaling** - Data distributed across regions
- **No Single Point of Failure** - Multi-node redundancy
- **Flexible Schema** - Easy to add new fields

### Cassandra Challenges:
- **Learning Curve** - Different query patterns than SQL
- **Denormalization** - Duplicate data for query optimization
- **Limited Transactions** - No ACID across multiple tables
- **Operational Complexity** - Requires understanding of distribution

---

## Setup Steps

### 1. Start Cassandra
```bash
docker-compose up -d cassandra
```

### 2. Initialize Database
```bash
docker exec cassandra cqlsh -f cassandra-init.cql
```

### 3. Create Project
```bash
dotnet new webapi -n PetCareAPI
cd PetCareAPI
dotnet add package CassandraDriver
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
```

### 4. Add Files
- Copy models, repositories, services, controllers
- Update appsettings.json
- Update Program.cs

### 5. Run API
```bash
dotnet run
```

---

## Key Differences from PostgreSQL Version

1. **Partition Keys**: Data organization for performance
2. **Clustering Keys**: Ordering within partitions
3. **Denormalization**: Same data in multiple tables for different queries
4. **No Joins**: Queries return data as-is
5. **Eventual Consistency**: Not immediately consistent across nodes
6. **Batch Operations**: Efficient bulk inserts/updates

---

## Best Practices with Cassandra

1. **Design for Queries** - Know your query patterns first
2. **Denormalize Liberally** - Duplicate data for performance
3. **Use Clustering Keys** - Efficient range queries
4. **TTL for Temporary Data** - Auto-expire old records
5. **Avoid Hot Spots** - Distribute data evenly
6. **Monitor Latency** - Set consistency levels appropriately

