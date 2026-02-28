# Use the official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy the project file and restore dependencies
COPY PetCareAPI/PetCare4YouAPI.csproj ./PetCareAPI/
RUN dotnet restore ./PetCareAPI/PetCare4YouAPI.csproj

# Copy the remaining files and build the app
COPY PetCareAPI/ ./PetCareAPI/
WORKDIR /app/PetCareAPI
RUN dotnet publish -c Release -o /out

# Use the official .NET runtime image to run the app
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /out .

# Expose the port the app runs on
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Start the app
ENTRYPOINT ["dotnet", "PetCare4YouAPI.dll"]
