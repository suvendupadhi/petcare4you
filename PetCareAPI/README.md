# PetCare Services API

A comprehensive C# ASP.NET Core API for the PetCare Services mobile application with appointment booking, provider management, and user authentication using Apache Cassandra.

## Prerequisites

- .NET 7.0 SDK or higher
- Docker and Docker Compose
- Cassandra 4.1 (via Docker)

## Quick Start

### 1. Start Cassandra Database

From the project root directory:

```bash
docker-compose up -d cassandra
```

Wait for Cassandra to be ready (check health status):

```bash
docker ps
```

### 2. Initialize Cassandra Schema

Connect to Cassandra and run the initialization script:

```bash
docker exec -it petcare-cassandra cqlsh -e "SOURCE '/docker-entrypoint-initdb.d/init.cql'"
```

Or manually:

```bash
docker exec -it petcare-cassandra cqlsh
```

Then paste the contents of `cassandra-init.cql`

### 3. Restore Dependencies

```bash
cd PetCareAPI
dotnet restore
```

### 4. Run the API

```bash
dotnet run
```

The API will start at:
- **HTTPS**: https://localhost:7099
- **HTTP**: http://localhost:5099
- **Swagger UI**: https://localhost:7099/swagger

## Project Structure

```
PetCareAPI/
├── Models/
│   ├── User.cs
│   ├── Provider.cs
│   ├── Appointment.cs
│   ├── Availability.cs
│   ├── Payment.cs
│   └── DTOs/
├── Repositories/
│   ├── IUserRepository.cs
│   ├── UserRepository.cs
│   ├── IProviderRepository.cs
│   ├── ProviderRepository.cs
│   ├── IAppointmentRepository.cs
│   └── AppointmentRepository.cs
├── Services/
│   ├── IAuthService.cs
│   └── AuthService.cs
├── Controllers/
│   ├── AuthController.cs
│   ├── ProvidersController.cs
│   └── AppointmentsController.cs
├── Data/
│   └── CassandraSession.cs
├── Program.cs
├── appsettings.json
└── PetCareAPI.csproj
```

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "userType": "Owner"
}

Response: 200 OK
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "Owner"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Providers

#### Get All Providers
```
GET /api/providers
GET /api/providers?city=NewYork
GET /api/providers?city=NewYork&serviceType=Grooming

Response: 200 OK
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "companyName": "Happy Paws Grooming",
    "description": "Professional pet grooming services",
    "serviceType": "Grooming",
    "hourlyRate": 50.00,
    "rating": 4.8,
    "reviewCount": 25,
    "address": "123 Pet Street",
    "city": "NewYork",
    ...
  }
]
```

#### Get Provider by ID
```
GET /api/providers/{id}

Response: 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  ...
}
```

#### Create Provider (Authenticated)
```
POST /api/providers
Authorization: Bearer {token}
Content-Type: application/json

{
  "companyName": "Happy Paws Grooming",
  "description": "Professional pet grooming services",
  "serviceType": "Grooming",
  "hourlyRate": 50.00,
  "address": "123 Pet Street",
  "city": "NewYork",
  "latitude": 40.7128,
  "longitude": -74.0060
}

Response: 201 Created
```

#### Update Provider (Authenticated)
```
PUT /api/providers/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "companyName": "Updated Company Name",
  "hourlyRate": 60.00,
  ...
}

Response: 204 No Content
```

### Appointments

#### Get My Appointments (Authenticated)
```
GET /api/appointments
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "ownerId": "550e8400-e29b-41d4-a716-446655440000",
    "providerId": "550e8400-e29b-41d4-a716-446655440001",
    "appointmentDate": "2026-02-01T14:00:00Z",
    "startTime": "2026-02-01T14:00:00Z",
    "endTime": "2026-02-01T15:00:00Z",
    "status": "Pending",
    "petName": "Buddy",
    "petType": "Dog",
    "totalPrice": 50.00,
    ...
  }
]
```

#### Create Appointment (Authenticated)
```
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "providerId": "550e8400-e29b-41d4-a716-446655440001",
  "appointmentDate": "2026-02-01T14:00:00Z",
  "startTime": "2026-02-01T14:00:00Z",
  "endTime": "2026-02-01T15:00:00Z",
  "petName": "Buddy",
  "petType": "Dog",
  "description": "Regular grooming",
  "totalPrice": 50.00
}

Response: 201 Created
```

#### Update Appointment Status (Authenticated)
```
PUT /api/appointments/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "status": "Confirmed"
}

Response: 204 No Content
```

## Configuration

### appsettings.json

```json
{
  "Cassandra": {
    "ContactPoints": "localhost",
    "Port": 9042,
    "Keyspace": "petcare"
  },
  "Jwt": {
    "Key": "YourVeryLongSecretKeyForJwtTokenGenerationWithAtLeast32Characters...",
    "Issuer": "PetCareAPI",
    "Audience": "PetCareApp"
  }
}
```

**Important**: Change the JWT Key to a secure random string in production.

Generate a secure key:
```csharp
var key = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
```

## Database Schema

### Key Tables

- **users**: User accounts (owners and providers)
- **users_by_email**: Email lookup index
- **providers**: Service provider information
- **providers_by_user**: User to provider mapping
- **providers_by_city**: Geographic search index
- **appointments**: Booking records
- **appointments_by_owner**: User's appointments
- **appointments_by_provider**: Provider's appointments
- **availability**: Provider time slots
- **payments**: Payment records

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### How to Use

1. Register or login to get a token
2. Include the token in subsequent requests:
   ```
   Authorization: Bearer {token}
   ```

Tokens expire after 24 hours.

## Development

### Build the Project

```bash
dotnet build
```

### Run Tests

```bash
dotnet test
```

### Clean Build

```bash
dotnet clean
```

## Troubleshooting

### Cassandra Connection Issues

If you get connection errors:

1. Verify Cassandra is running:
   ```bash
   docker ps
   ```

2. Check logs:
   ```bash
   docker logs petcare-cassandra
   ```

3. Restart Cassandra:
   ```bash
   docker restart petcare-cassandra
   ```

### Port Already in Use

If port 9042 is already in use:

1. Stop the existing Cassandra:
   ```bash
   docker stop petcare-cassandra
   docker rm petcare-cassandra
   ```

2. Update `docker-compose.yml` to use a different port:
   ```yaml
   ports:
     - "9043:9042"
   ```

3. Update `appsettings.json`:
   ```json
   "Port": 9043
   ```

## Technology Stack

- **Framework**: ASP.NET Core 7.0
- **Language**: C# 11
- **Database**: Apache Cassandra 4.1
- **Authentication**: JWT Bearer
- **Logging**: Serilog
- **API Documentation**: Swagger/OpenAPI

## License

MIT License

## Support

For issues or questions, please contact the development team.
