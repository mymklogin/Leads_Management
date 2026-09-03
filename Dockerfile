# ==============================================================================
# Multi-Stage Dockerfile for LeadsManagement.Api (.NET 9.0) on Render.com
# ==============================================================================

# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY src/LeadsManagement.Api/LeadsManagement.Api.csproj src/LeadsManagement.Api/
RUN dotnet restore src/LeadsManagement.Api/LeadsManagement.Api.csproj

# Copy only src directory
COPY src/ src/

# Build and publish release
WORKDIR /app/src/LeadsManagement.Api
RUN dotnet publish LeadsManagement.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Install libicu & ca-certificates for Linux globalization stability
RUN apt-get update && apt-get install -y --no-install-recommends \
    libicu72 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# Environment settings for Render.com
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_EnableDiagnostics=0
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
EXPOSE 8080

ENTRYPOINT ["dotnet", "LeadsManagement.Api.dll"]
