# PetCare Services - Complete Setup Instructions

## Project Overview

The PetCare Services repository now contains:

1. **React Native Mobile App** (Existing)
   - Location: Root `/app` directory
   - Built with: Expo, React 19, React Native, TypeScript, Tailwind CSS (NativeWind)

2. **C# ASP.NET Core API** (New - Added)
   - Location: `/PetCareAPI` directory
   - Built with: .NET 7, Apache Cassandra, JWT Authentication
   - Features: User authentication, provider management, appointment booking

---

## Part 1: Setting Up the API Backend

### Prerequisites

- **Docker** and **Docker Compose** (for Cassandra database)
- **.NET 7 SDK** or higher
- **Windows Command Prompt** or **PowerShell**

### Step 1: Start Cassandra Database

From the project root directory:

```bash
docker-compose up -d cassandra
```

This will:
- Pull the Cassandra 4.1 image
- Start a Cassandra container
- Initialize the database schema
- Wait for the cluster to be ready

**Verify Cassandra is running:**

```bash
docker ps
```

You should see `petcare-cassandra` running.

### Step 2: Verify Database Initialization

Connect to Cassandra and check if tables were created:

```bash
docker exec -it petcare-cassandra cqlsh
```

Then in the CQL shell:

```cql
USE petcare;
DESCRIBE TABLES;
```

You should see tables like: `users`, `providers`, `appointments`, `availability`, `payments`

Exit CQL shell: `exit`

### Step 3: Run the API

Navigate to the API directory and start the server:

```bash
cd PetCareAPI
dotnet restore  # Install dependencies (first time only)
dotnet run      # Start the API
```

**Expected output:**

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7099
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### Step 4: Access API Documentation

Open your browser and navigate to:

```
https://localhost:7099/swagger
```

You will see the interactive Swagger UI with all available endpoints.

---

## Part 2: API Quick Test

### Test 1: Register a User

Using **Swagger UI** or **Postman/curl**:

```bash
curl -X POST "https://localhost:7099/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "userType": "Owner"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "Owner"
  }
}
```

### Test 2: Login

```bash
curl -X POST "https://localhost:7099/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Save the returned `token` - you'll need it for authenticated requests.

### Test 3: Register as Provider

```bash
curl -X POST "https://localhost:7099/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "groomer@example.com",
    "password": "SecurePass123",
    "firstName": "Jane",
    "lastName": "Smith",
    "phoneNumber": "+1234567891",
    "userType": "Provider"
  }'
```

### Test 4: Create Provider Profile (Authenticated)

Use the provider's token from above:

```bash
curl -X POST "https://localhost:7099/api/providers" \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Happy Paws Grooming",
    "description": "Professional pet grooming services",
    "serviceType": "Grooming",
    "hourlyRate": 50.00,
    "address": "123 Pet Street",
    "city": "New York",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

### Test 5: Search Providers

```bash
curl -X GET "https://localhost:7099/api/providers?city=New%20York&serviceType=Grooming"
```

### Test 6: Create Appointment (Authenticated)

Use the owner's token:

```bash
curl -X POST "https://localhost:7099/api/appointments" \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "PROVIDER_ID_FROM_STEP_4",
    "appointmentDate": "2026-02-01T14:00:00Z",
    "startTime": "2026-02-01T14:00:00Z",
    "endTime": "2026-02-01T15:00:00Z",
    "petName": "Buddy",
    "petType": "Dog",
    "description": "Regular grooming",
    "totalPrice": 50.00
  }'
```

---

## Part 3: Connecting Mobile App to API

### Update React Native App Configuration

In the mobile app, create a configuration file or environment variable for the API endpoint.

**File: `PetCareApp/app/config/api.ts` (Create this file)**

```typescript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7099/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
  },
  PROVIDERS: {
    LIST: `${API_BASE_URL}/providers`,
    GET: (id: string) => `${API_BASE_URL}/providers/${id}`,
    CREATE: `${API_BASE_URL}/providers`,
    UPDATE: (id: string) => `${API_BASE_URL}/providers/${id}`,
  },
  APPOINTMENTS: {
    LIST: `${API_BASE_URL}/appointments`,
    GET: (id: string) => `${API_BASE_URL}/appointments/${id}`,
    CREATE: `${API_BASE_URL}/appointments`,
    UPDATE: (id: string) => `${API_BASE_URL}/appointments/${id}`,
  },
};
```

### Example: Register API Call in React Native

**File: `PetCareApp/app/register-owner.tsx`**

```typescript
import { API_ENDPOINTS } from '@/config/api';

async function handleRegister(email: string, password: string, firstName: string, lastName: string, phoneNumber: string) {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        userType: 'Owner',
      }),
    });

    const data = await response.json();

    if (data.success) {
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      // Navigate to dashboard
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed');
  }
}
```

### Example: Search Providers

```typescript
async function searchProviders(city: string, serviceType: string) {
  try {
    const url = `${API_ENDPOINTS.PROVIDERS.LIST}?city=${city}&serviceType=${serviceType}`;
    const response = await fetch(url);
    const providers = await response.json();
    return providers;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
```

---

## Project Structure

```
petcare/
├── app/                          # React Native mobile app
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── register-owner.tsx
│   ├── register-provider.tsx
│   ├── search-providers.tsx
│   ├── provider-detail.tsx
│   ├── appointments-owner.tsx
│   ├── appointment-detail.tsx
│   ├── owner-dashboard.tsx
│   ├── provider-dashboard.tsx
│   ├── manage-availability.tsx
│   ├── payment-invoice.tsx
│   ├── profile-owner.tsx
│   └── profile-provider.tsx
│
├── components/                   # Shared React components
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
│
├── PetCareAPI/                   # C# ASP.NET Core API
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ProvidersController.cs
│   │   └── AppointmentsController.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Provider.cs
│   │   ├── Appointment.cs
│   │   ├── Availability.cs
│   │   ├── Payment.cs
│   │   └── DTOs/
│   ├── Repositories/
│   │   ├── UserRepository.cs
│   │   ├── ProviderRepository.cs
│   │   └── AppointmentRepository.cs
│   ├── Services/
│   │   └── AuthService.cs
│   ├── Data/
│   │   └── CassandraSession.cs
│   ├── Program.cs
│   ├── appsettings.json
│   ├── README.md
│   └── PetCareAPI.csproj
│
├── cassandra-init.cql            # Cassandra schema
├── docker-compose.yml            # Docker configuration
├── API_SETUP_GUIDE.md           # PostgreSQL API guide (reference)
├── API_CASSANDRA_GUIDE.md       # Cassandra API guide (reference)
└── SETUP_INSTRUCTIONS.md        # This file
```

---

## Troubleshooting

### Issue: Cassandra Won't Start

**Solution:**

1. Check if port 9042 is already in use:
   ```bash
   netstat -ano | findstr :9042
   ```

2. Kill the process or change the port in `docker-compose.yml`

3. Restart:
   ```bash
   docker-compose down
   docker-compose up -d cassandra
   ```

### Issue: API Can't Connect to Cassandra

**Solution:**

1. Verify Cassandra container is running:
   ```bash
   docker ps
   ```

2. Check Cassandra logs:
   ```bash
   docker logs petcare-cassandra
   ```

3. Verify connection string in `PetCareAPI/appsettings.json`:
   ```json
   "Cassandra": {
     "ContactPoints": "localhost",
     "Port": 9042,
     "Keyspace": "petcare"
   }
   ```

### Issue: JWT Token Invalid

**Solution:**

Make sure to update the JWT Key in `appsettings.json` for production. The current key is for development only.

### Issue: CORS Errors When Calling API from Mobile

**Solution:**

The API is configured to accept requests from any origin. If you still get CORS errors:

1. Verify the API is running (check port 7099)
2. Use the correct full URL: `https://localhost:7099/api/...`
3. Check browser console for specific error messages

---

## API Authentication Flow

1. **Register** → Get JWT token
2. **Store token** in device storage (AsyncStorage in React Native)
3. **Include token** in Authorization header for authenticated requests:
   ```
   Authorization: Bearer {token}
   ```
4. **Token expires** after 24 hours → User must login again

---

## Database Schema Overview

### Key Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts (owners & providers) |
| `users_by_email` | Email lookup index |
| `providers` | Service provider information |
| `providers_by_user` | User-to-provider mapping |
| `providers_by_city` | Geographic search index |
| `appointments` | Booking records |
| `appointments_by_owner` | User's appointments |
| `appointments_by_provider` | Provider's appointments |
| `availability` | Provider time slots |
| `payments` | Payment transactions |

---

## Development Workflow

### Backend Development

1. Edit files in `PetCareAPI/`
2. Run `dotnet build` to check for errors
3. Run `dotnet run` to start the API
4. Test endpoints using Swagger UI

### Mobile Development

1. Edit files in `app/`
2. Run `npm run lint` to check code quality
3. Run `npx expo start` to preview
4. Test integration with API

### Database Changes

1. Update `cassandra-init.cql` for schema changes
2. Restart Cassandra: `docker-compose down && docker-compose up -d cassandra`
3. Update model classes in `PetCareAPI/Models/`

---

## Next Steps

1. ✅ **Start Cassandra**: `docker-compose up -d cassandra`
2. ✅ **Run API**: `cd PetCareAPI && dotnet run`
3. ✅ **Test endpoints** in Swagger UI
4. ⏭️ **Integrate with mobile app** using provided code examples
5. ⏭️ **Deploy to production** (configure real JWT key, update connection strings)

---

## Additional Resources

- **API Documentation**: `PetCareAPI/README.md`
- **Cassandra Guide**: `API_CASSANDRA_GUIDE.md`
- **Expo Documentation**: https://docs.expo.dev
- **Cassandra Documentation**: https://cassandra.apache.org/doc

---

## Support

For issues or questions about the setup:

1. Check the troubleshooting section above
2. Review the README files in each directory
3. Check Docker logs: `docker logs petcare-cassandra`
4. Check API logs: Terminal output when running `dotnet run`

