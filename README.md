# Leads Management Web API (.NET 9 Core)

Enterprise-grade **Leads Management & ExpressIVR OBD Webhook Engine** built with **C# / .NET 9 Core**, **Entity Framework Core**, and the **Strategy Pattern**.

This solution supports all ExpressIVR OBD campaign templates, handles real-time call webhooks (`CONNECTED_CALLS`, `DTMF`, `HANGUP`), persists lead status transitions with key preservation & duration bucketing, provides outbound OBD dialing, lead CRM filtering, CSV exports, and real-time dashboard analytics.

---

## 🚀 Features

- **Supported Campaign Templates**:
  - **Template 0**: Simple Campaign (Interactive Lead, Not Interested / DND, 6 Duration brackets)
  - **Template 1**: DTMF Campaign (Target Key 1, Super Hot vs Warm/Cold duration)
  - **Template 2**: Call Patch Campaign (Agent Connection request, 60s+ Hot engagement hierarchy)
  - **Template 3**: Custom IVR Campaign (Multi-key handling with Deep Engagement durations)
  - **Template 4**: Multi-Level IVR Nextar (Memory-cached DTMF, High Intent keys 1-4, Hangup finalization)
  - **Template 5**: OTP Case (Memory-cached OTP digits, Verification completed vs dropped status)
  - **Template 7**: TTS Simple IVR (Memory-cached DTMF, Target Key 1 vs Non-Target hierarchy)
  - **Template 8**: TTS DTMF (TTS Target Key 1, Database fallback on Hangup)
  - **Template 9**: TTS Call Patch (TTS Agent Connection request, Database fallback on Hangup)

- **Webhook Processing**:
  - `POST /api/v1/GetRoutingInfo` (Exact route used by ExpressIVR)
  - `POST /api/v1/webhook/{templateId}` (Explicit template routing)
  - Dynamic template resolution (from payload, query param `?templateId=X`, or existing lead lookup).
  - Full audit logging of all webhook requests in the `WebhookLogs` table.

- **Outbound OBD Engine**:
  - `POST /api/campaigns/singlecall` - Dispatches single OBD call to `https://obd3api.expressivr.com/api/obd/singlecall` with API Key authentication.
  - `POST /api/campaigns/bulk-call` - Dispatches bulk OBD calls.
  - `POST /api/campaigns/preview-payload` - Generates and previews outbound JSON payload.

- **Leads CRM & Analytics**:
  - `GET /api/leads` - Paginated leads with search, filter by Status, Template, and Date Range.
  - `GET /api/leads/{id}` & `GET /api/leads/mobile/{mobile}`
  - `PUT /api/leads/{id}/status` - Update lead status and disposition notes.
  - `GET /api/leads/export` - Export leads to CSV.
  - `GET /api/analytics/dashboard` - Real-time metrics: Total leads, Hot/Warm/Cold funnel, avg call duration, status breakdown, DTMF key breakdown.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: ASP.NET Core Web API (.NET 9.0)
- **Database ORM**: Entity Framework Core 9.0 (Supports SQLite out of the box + SQL Server)
- **Design Pattern**: Strategy Pattern for Template Webhook evaluation
- **Caching**: `IMemoryCache` for multi-stage DTMF events
- **Documentation**: Swagger / OpenAPI UI (`http://localhost:2014/` or `http://localhost:5000/`)

---

## 📁 Project Structure

```
D:\ProjectLeads\
├── LeadsManagement.sln
├── src\
│   └── LeadsManagement.Api\
│       ├── Controllers\
│       │   ├── WebhookController.cs       // /api/v1/GetRoutingInfo & /api/v1/webhook/{templateId}
│       │   ├── LeadsController.cs         // Leads CRM & CSV Export
│       │   ├── CampaignsController.cs     // OBD Outbound Dialing
│       │   └── AnalyticsController.cs     // Dashboard & Audit logs
│       ├── Data\
│       │   └── LeadDbContext.cs           // EF Core DbContext
│       ├── Models\
│       │   ├── Entities\                  // LeadRecord, WebhookLog, CampaignRecord
│       │   ├── Dtos\                      // Request and Response DTOs
│       │   └── Enums\
│       ├── Services\
│       │   ├── Interfaces\
│       │   ├── Strategies\                // Template 0, 1, 2, 3, 4, 5, 7, 8, 9 strategies
│       │   └── Implementations\           // WebhookProcessor, LeadService, ExpressIvrClient, Analytics
│       ├── Program.cs
│       └── appsettings.json
└── tests\
    └── LeadsManagement.Tests\
        ├── TemplateWebhookTests.cs        // 100% test coverage for all 9 templates
        ├── LeadServiceTests.cs
        └── WebhookProcessorServiceTests.cs
```

---

## ⚙️ Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DatabaseProvider": "Sqlite", // Switch to "SqlServer" when using SQL Server
    "SqliteConnection": "Data Source=leads.db",
    "SqlServerConnection": "Server=localhost;Database=LeadsManagementDb;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "ExpressIvr": {
    "ApiUrl": "https://obd3api.expressivr.com/api/obd/singlecall",
    "ApiKey": "YOUR_API_KEY_HERE",
    "DefaultUserId": 50002,
    "DefaultCli": "9999900119",
    "WebhookBaseUrl": "http://localhost:2014"
  }
}
```

---

## ▶️ Running the Application

### 1. Run the Web API
```bash
dotnet run --project D:\ProjectLeads\src\LeadsManagement.Api\LeadsManagement.Api.csproj --urls "http://localhost:2014;https://localhost:2015"
```
Navigate to `http://localhost:2014` in your browser to open **Swagger UI**.

### 2. Run the Unit Tests
```bash
dotnet test D:\ProjectLeads\LeadsManagement.sln
```

---

## 📡 API Endpoint Reference

### 1. ExpressIVR Webhook
- **URL**: `POST /api/v1/GetRoutingInfo` (or `POST /api/v1/webhook/{templateId}`)
- **Sample Payload**:
```json
{
  "mobile": "8571844348",
  "templateId": 1,
  "eventType": "HANGUP",
  "pressedKey": "1",
  "duration": 35
}
```
- **Response**:
```json
{
  "status": "success",
  "templateId": 1,
  "eventType": "HANGUP",
  "pressedKey": "1",
  "effectivePressedKey": "1",
  "duration": 35,
  "leadStatus": "Super Hot Lead - Pressed 1 & Long Call"
}
```

### 2. Initiate OBD Single Call
- **URL**: `POST /api/campaigns/singlecall`
- **Sample Payload**:
```json
{
  "templateId": 0,
  "mobile": "8571844348",
  "customerName": "John Doe",
  "cli": "9999900119"
}
```

### 3. Get Leads with Filtering & Pagination
- **URL**: `GET /api/leads?status=Hot&page=1&pageSize=20`

### 4. Dashboard Analytics
- **URL**: `GET /api/analytics/dashboard`

### 5. Export Leads CSV
- **URL**: `GET /api/leads/export`
