# ==============================================================================
# Multi-Stage Dockerfile for LeadsManagement.Api (.NET 9.0) on Render.com
# ==============================================================================

# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY src/LeadsManagement.Api/LeadsManagement.Api.csproj src/LeadsManagement.Api/
RUN dotnet restore src/LeadsManagement.Api/LeadsManagement.Api.csproj

# Copy only src directory (ignoring bin/obj via .dockerignore)
COPY src/ src/

# Build and publish release
WORKDIR /app/src/LeadsManagement.Api
RUN dotnet publish LeadsManagement.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Essential container environment flags for Render.com virtualized sandbox (Prevents SIGSEGV status 139)
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_EnableDiagnostics=0
ENV DOTNET_EnableWriteXorExecute=0
ENV GLIBC_TUNABLES=glibc.pthread.rseq=0
ENV DOTNET_TieredPGO=0
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1
ENV DOTNET_GCHeapHardLimitPercent=75
EXPOSE 8080

ENTRYPOINT ["dotnet", "LeadsManagement.Api.dll"]
