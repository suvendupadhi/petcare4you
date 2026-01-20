---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary
PetCare Services is a universal pet care platform featuring a mobile application for pet owners and service providers, integrated with a robust backend API and a scalable Cassandra database. The system supports user authentication, provider profile management, service discovery, and appointment booking.

## Repository Structure
The repository is organized as a multi-project workspace containing both the mobile client and the backend server.

### Main Repository Components
- **app/**: React Native mobile application using Expo and file-based routing.
- **PetCareAPI/**: C# ASP.NET Core RESTful API providing backend services.
- **Database Configuration**: Docker Compose and CQL scripts for Apache Cassandra setup.

## Projects

### PetCare Mobile App (Root)
The mobile application is the primary interface for users, built with modern React Native patterns.

#### Language & Runtime
**Language**: TypeScript 5.9.3  
**Runtime**: React Native 0.81.4 (React 19.1.0)  
**Build System**: Expo 54.0.13 with Metro bundler  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `expo-router`: File-based routing and navigation.
- `nativewind`: Tailwind CSS for React Native.
- `lucide-react-native`: Icon library.
- `date-fns`: Date manipulation.
- `react-native-reanimated`: Fluid animations.

#### Build & Installation
```bash
npm install
npx expo start
```

### PetCare API (Backend)
A production-ready C# API that handles business logic and persists data to Cassandra.

#### Language & Runtime
**Language**: C# (.NET 7.0)  
**Framework**: ASP.NET Core  
**Package Manager**: NuGet (via dotnet CLI)

#### Dependencies
**Main Dependencies**:
- `CassandraCSharpDriver (3.22.0)`: Official driver for Apache Cassandra.
- `Microsoft.AspNetCore.Authentication.JwtBearer`: JWT authentication middleware.
- `Serilog.AspNetCore`: Structured logging for .NET.
- `Swashbuckle.AspNetCore`: Swagger/OpenAPI documentation.

#### Build & Installation
```bash
cd PetCareAPI
dotnet restore
dotnet run
```

#### Docker
**Configuration**: Root-level `docker-compose.yml` manages the Cassandra cluster.
**Service**: `petcare-cassandra` (Cassandra 4.1)
**Initialization**: `cassandra-init.cql` defines the keyspace and tables for users, providers, appointments, and payments.

#### Testing
The project currently relies on manual testing via Swagger UI and integration tests using `curl` as documented in `SETUP_INSTRUCTIONS.md`.

**Run Command**:
```bash
# Verify API endpoints via Swagger
https://localhost:7099/swagger
```
