# PetCare Services API - PostgreSQL Database Guide

## Database: PostgreSQL

### Why PostgreSQL for PetCare?

✓ **Relational Integrity** - Strong ACID compliance for appointments and payments.
✓ **Rich Features** - Support for complex queries, joins, and spatial data (PostGIS).
✓ **Production Ready** - Industry standard for web and mobile backends.
✓ **Ease of Use** - Excellent tooling (pgAdmin, DBeaver) and EF Core support.

---

## Installation & Setup

### 1. Install PostgreSQL
Download and install from the official site: [postgresql.org/download/](https://www.postgresql.org/download/)

### 2. Docker Setup (Recommended)
If you prefer Docker, you can use the following configuration:

```yaml
version: '3.8'
services:
  petcare-db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: yourpassword
      POSTGRES_DB: petcare
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres-init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

### 3. Initialize Database
Run the `postgres-init.sql` script located in the project root to create the schema and seed sample data.

```bash
psql -U postgres -d petcare -f postgres-init.sql
```

---

## Database Schema Overview

The database uses the `petcare` schema. Key tables include:

### Core Identity
- **user_roles**: Defines roles (owner, provider, admin).
- **users**: Main user accounts with email/password and role linkage.

### Pet Management
- **pet_types**: Categories (Dog, Cat, etc.).
- **breeds**: Specific breeds linked to pet types.
- **pets**: Individual pet profiles linked to owners.

### Service Providers
- **providers**: Detailed business profiles for service providers.
- **service_types**: Definitions of available services (Grooming, Training, etc.).
- **provider_service_types**: Link table connecting providers to multiple service types.

### Bookings & Operations
- **status_master**: Centralized status definitions for appointments and payments.
- **appointments**: Core booking entity connecting owners, providers, and pets.
- **availability**: Provider-managed time slots available for booking.
- **payments**: Transaction records including Stripe integration fields.

---

## C# Implementation Details

### NuGet Packages
```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design
```

### Configuration (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=5432;Database=postgres;User Id=postgres;Password=yourpassword;Search Path=petcare"
  }
}
```

### Entity Framework Core Context
The `PetCareContext` manages all relational mappings and database interactions.

```csharp
public class PetCareContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Provider> Providers { get; set; }
    // ... other DbSets
}
```

---

## Migrations

To generate and apply migrations:

```bash
# Create migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```
