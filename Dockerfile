# ==============================================================================
# Multi-Stage Dockerfile for LeadsManagement.Api (.NET 9.0) on Render.com
# ==============================================================================

# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY src/LeadsManagement.Api/LeadsManagement.Api.csproj src/LeadsManagement.Api/
RUN dotnet restore src/LeadsManagement.Api/LeadsManagement.Api.csproj

# Copy all source files
COPY . .

# Publish Release build
WORKDIR /src/src/LeadsManagement.Api
RUN dotnet publish LeadsManagement.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render exposes and injects the PORT environment variable
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "LeadsManagement.Api.dll"]
