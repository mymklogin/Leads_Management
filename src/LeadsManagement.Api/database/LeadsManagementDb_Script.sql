-- ==============================================================================
-- LEADS MANAGEMENT & MULTI-SERVICE PLATFORM DATABASE SCRIPT
-- SQL Server 2016+ Compatible
-- Generated without Entity Framework Core
-- ==============================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'LeadsManagementDb')
BEGIN
    CREATE DATABASE LeadsManagementDb;
END
GO

USE LeadsManagementDb;
GO

-- ==============================================================================
-- 1. TABLES CREATION
-- ==============================================================================

-- 1.1 USERS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Username] NVARCHAR(50) NOT NULL UNIQUE,
        [Email] NVARCHAR(100) NOT NULL UNIQUE,
        [PasswordHash] NVARCHAR(255) NOT NULL,
        [FullName] NVARCHAR(100) NOT NULL,
        [PhoneNumber] NVARCHAR(20) NOT NULL,
        [Role] INT NOT NULL, -- 1=SuperAdmin, 2=Admin, 3=Reseller, 4=User
        [ParentUserId] INT NULL,
        [VoiceCredits] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [WhatsAppCredits] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [RcsCredits] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [SmsCredits] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [LastLoginAt] DATETIME2 NULL,
        CONSTRAINT [FK_Users_ParentUser] FOREIGN KEY ([ParentUserId]) REFERENCES [dbo].[Users]([Id])
    );

    CREATE INDEX [IX_Users_Role] ON [dbo].[Users]([Role]);
    CREATE INDEX [IX_Users_ParentUserId] ON [dbo].[Users]([ParentUserId]);
END
ELSE
BEGIN
    -- Ensure LastLoginAt column exists
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'LastLoginAt')
    BEGIN
        ALTER TABLE [dbo].[Users] ADD [LastLoginAt] DATETIME2 NULL;
    END
END
GO

-- 1.2 APPMENUS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AppMenus]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AppMenus] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [ServiceCode] NVARCHAR(50) NOT NULL,
        [MenuKey] NVARCHAR(50) NOT NULL UNIQUE,
        [Title] NVARCHAR(100) NOT NULL,
        [RoutePath] NVARCHAR(100) NOT NULL,
        [Icon] NVARCHAR(50) NULL,
        [ParentMenuId] INT NULL,
        [SortOrder] INT NOT NULL DEFAULT 0,
        [IsActive] BIT NOT NULL DEFAULT 1,
        CONSTRAINT [FK_AppMenus_ParentMenu] FOREIGN KEY ([ParentMenuId]) REFERENCES [dbo].[AppMenus]([Id])
    );

    CREATE INDEX [IX_AppMenus_ServiceCode] ON [dbo].[AppMenus]([ServiceCode]);
    CREATE INDEX [IX_AppMenus_ParentMenuId] ON [dbo].[AppMenus]([ParentMenuId]);
END
GO

-- 1.3 USERMENUPERMISSIONS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserMenuPermissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserMenuPermissions] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [UserId] INT NOT NULL,
        [MenuId] INT NOT NULL,
        [CanView] BIT NOT NULL DEFAULT 1,
        [CanCreate] BIT NOT NULL DEFAULT 0,
        [CanEdit] BIT NOT NULL DEFAULT 0,
        [CanDelete] BIT NOT NULL DEFAULT 0,
        [CanExport] BIT NOT NULL DEFAULT 0,
        [AssignedByUserId] INT NULL,
        [AssignedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_UserMenuPermissions_User] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserMenuPermissions_Menu] FOREIGN KEY ([MenuId]) REFERENCES [dbo].[AppMenus]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserMenuPermissions_AssignedByUser] FOREIGN KEY ([AssignedByUserId]) REFERENCES [dbo].[Users]([Id]),
        CONSTRAINT [UQ_UserMenuPermissions_User_Menu] UNIQUE ([UserId], [MenuId])
    );

    CREATE INDEX [IX_UserMenuPermissions_UserId] ON [dbo].[UserMenuPermissions]([UserId]);
    CREATE INDEX [IX_UserMenuPermissions_MenuId] ON [dbo].[UserMenuPermissions]([MenuId]);
END
GO

-- 1.4 CAMPAIGNRECORDS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CampaignRecords]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[CampaignRecords] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [CampaignName] NVARCHAR(100) NOT NULL,
        [TemplateId] INT NOT NULL DEFAULT 0,
        [TargetMobile] NVARCHAR(20) NOT NULL,
        [Cli] NVARCHAR(20) NULL,
        [UserId] INT NULL,
        [RequestPayload] NVARCHAR(MAX) NULL,
        [ApiResponse] NVARCHAR(MAX) NULL,
        [DispatchStatus] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        [DispatchedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_CampaignRecords_User] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
    );

    CREATE INDEX [IX_CampaignRecords_TargetMobile] ON [dbo].[CampaignRecords]([TargetMobile]);
    CREATE INDEX [IX_CampaignRecords_DispatchedAt] ON [dbo].[CampaignRecords]([DispatchedAt]);
END
GO

-- 1.5 LEADRECORDS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LeadRecords]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[LeadRecords] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Mobile] NVARCHAR(20) NOT NULL,
        [CustomerName] NVARCHAR(100) NULL,
        [TemplateId] INT NULL DEFAULT 0,
        [LeadStatus] NVARCHAR(200) NOT NULL DEFAULT 'New',
        [CallDuration] INT NOT NULL DEFAULT 0,
        [PressedDtmf] NVARCHAR(50) NULL,
        [LastEventType] NVARCHAR(50) NULL,
        [UserId] INT NULL,
        [AssignedToUserId] INT NULL,
        [Cli] NVARCHAR(20) NULL,
        [Notes] NVARCHAR(1000) NULL,
        [CustomData] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_LeadRecords_User] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]),
        CONSTRAINT [FK_LeadRecords_AssignedToUser] FOREIGN KEY ([AssignedToUserId]) REFERENCES [dbo].[Users]([Id])
    );

    CREATE INDEX [IX_LeadRecords_Mobile] ON [dbo].[LeadRecords]([Mobile]);
    CREATE INDEX [IX_LeadRecords_LeadStatus] ON [dbo].[LeadRecords]([LeadStatus]);
    CREATE INDEX [IX_LeadRecords_TemplateId] ON [dbo].[LeadRecords]([TemplateId]);
    CREATE INDEX [IX_LeadRecords_UpdatedAt] ON [dbo].[LeadRecords]([UpdatedAt]);
END
GO

-- 1.6 WEBHOOKLOGS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[WebhookLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[WebhookLogs] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Mobile] NVARCHAR(20) NULL,
        [TemplateId] INT NULL,
        [EventType] NVARCHAR(50) NULL,
        [PressedKey] NVARCHAR(50) NULL,
        [Duration] INT NOT NULL DEFAULT 0,
        [ComputedLeadStatus] NVARCHAR(200) NULL,
        [RawPayload] NVARCHAR(MAX) NULL,
        [ReceivedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [IsSuccess] BIT NOT NULL DEFAULT 1,
        [ErrorMessage] NVARCHAR(500) NULL
    );

    CREATE INDEX [IX_WebhookLogs_Mobile] ON [dbo].[WebhookLogs]([Mobile]);
    CREATE INDEX [IX_WebhookLogs_ReceivedAt] ON [dbo].[WebhookLogs]([ReceivedAt]);
    CREATE INDEX [IX_WebhookLogs_TemplateId] ON [dbo].[WebhookLogs]([TemplateId]);
END
GO

-- 1.7 RCSTRANSACTIONLOGS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RcsTransactionLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RcsTransactionLogs] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [TransactionCode] NVARCHAR(50) NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UserId] INT NOT NULL,
        [Username] NVARCHAR(100) NOT NULL,
        [PerformedByUserId] INT NULL,
        [PerformedByUsername] NVARCHAR(100) NULL,
        [ServiceType] NVARCHAR(20) NOT NULL DEFAULT 'RCS',
        [ActionType] NVARCHAR(50) NOT NULL DEFAULT 'Credit',
        [Credits] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [PricePerCredit] DECIMAL(18,4) NOT NULL DEFAULT 0,
        [TotalAmount] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [Notes] NVARCHAR(500) NULL,
        [BalanceAfter] DECIMAL(18,2) NOT NULL DEFAULT 0,
        CONSTRAINT [FK_RcsTransactionLogs_User] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
    );

    CREATE INDEX [IX_RcsTransactionLogs_UserId] ON [dbo].[RcsTransactionLogs]([UserId]);
END
GO

-- ==============================================================================
-- 2. STORED PROCEDURES
-- ==============================================================================

-- 2.1 USER STORED PROCEDURES
CREATE OR ALTER PROCEDURE [dbo].[sp_GetUserByUsername]
    @Username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[Users] WHERE [Username] = @Username;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetUserById]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[Users] WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllUsers]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[Users] ORDER BY [Id] DESC;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetSubordinateUsers]
    @ParentUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[Users] 
    WHERE [ParentUserId] = @ParentUserId 
    ORDER BY [Id] DESC;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_CreateUser]
    @Username NVARCHAR(50),
    @Email NVARCHAR(100),
    @PasswordHash NVARCHAR(255),
    @FullName NVARCHAR(100),
    @PhoneNumber NVARCHAR(20),
    @Role INT,
    @ParentUserId INT = NULL,
    @VoiceCredits INT = 0,
    @WhatsAppCredits INT = 0,
    @RcsCredits INT = 0,
    @SmsCredits INT = 0,
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[Users] (
        [Username], [Email], [PasswordHash], [FullName], [PhoneNumber],
        [Role], [ParentUserId], [VoiceCredits], [WhatsAppCredits],
        [RcsCredits], [SmsCredits], [IsActive], [CreatedAt], [UpdatedAt]
    )
    VALUES (
        @Username, @Email, @PasswordHash, @FullName, @PhoneNumber,
        @Role, @ParentUserId, @VoiceCredits, @WhatsAppCredits,
        @RcsCredits, @SmsCredits, @IsActive, GETUTCDATE(), GETUTCDATE()
    );

    SELECT SCOPE_IDENTITY() AS NewUserId;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateUser]
    @Id INT,
    @Email NVARCHAR(100),
    @FullName NVARCHAR(100),
    @PhoneNumber NVARCHAR(20),
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Users]
    SET [Email] = @Email,
        [FullName] = @FullName,
        [PhoneNumber] = @PhoneNumber,
        [IsActive] = @IsActive,
        [UpdatedAt] = GETUTCDATE()
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateUserCredits]
    @Id INT,
    @VoiceCredits DECIMAL(18,2),
    @WhatsAppCredits DECIMAL(18,2),
    @RcsCredits DECIMAL(18,2),
    @SmsCredits DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Users]
    SET [VoiceCredits] = @VoiceCredits,
        [WhatsAppCredits] = @WhatsAppCredits,
        [RcsCredits] = @RcsCredits,
        [SmsCredits] = @SmsCredits,
        [UpdatedAt] = GETUTCDATE()
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateLastLogin]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Users]
    SET [LastLoginAt] = GETUTCDATE()
    WHERE [Id] = @Id;
END
GO

-- 2.2 MENU STORED PROCEDURES
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllMasterMenus]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[AppMenus] 
    ORDER BY [ServiceCode], [SortOrder];
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetMenusByUserId]
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserRole INT;
    SELECT @UserRole = [Role] FROM [dbo].[Users] WHERE [Id] = @UserId;

    IF @UserRole = 1 -- SuperAdmin has access to all active menus
    BEGIN
        SELECT 
            m.[Id], m.[ServiceCode], m.[MenuKey], m.[Title], m.[RoutePath],
            m.[Icon], m.[ParentMenuId], m.[SortOrder], m.[IsActive],
            1 AS [CanView], 1 AS [CanCreate], 1 AS [CanEdit], 1 AS [CanDelete], 1 AS [CanExport]
        FROM [dbo].[AppMenus] m
        WHERE m.[IsActive] = 1
        ORDER BY m.[SortOrder];
    END
    ELSE
    BEGIN
        SELECT 
            m.[Id], m.[ServiceCode], m.[MenuKey], m.[Title], m.[RoutePath],
            m.[Icon], m.[ParentMenuId], m.[SortOrder], m.[IsActive],
            p.[CanView], p.[CanCreate], p.[CanEdit], p.[CanDelete], p.[CanExport]
        FROM [dbo].[AppMenus] m
        INNER JOIN [dbo].[UserMenuPermissions] p ON m.[Id] = p.[MenuId]
        WHERE p.[UserId] = @UserId AND p.[CanView] = 1 AND m.[IsActive] = 1
        ORDER BY m.[SortOrder];
    END
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_CreateMasterMenu]
    @ServiceCode NVARCHAR(50),
    @MenuKey NVARCHAR(50),
    @Title NVARCHAR(100),
    @RoutePath NVARCHAR(100),
    @Icon NVARCHAR(50) = NULL,
    @ParentMenuId INT = NULL,
    @SortOrder INT = 0,
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[AppMenus] (
        [ServiceCode], [MenuKey], [Title], [RoutePath], [Icon], [ParentMenuId], [SortOrder], [IsActive]
    )
    VALUES (
        @ServiceCode, @MenuKey, @Title, @RoutePath, @Icon, @ParentMenuId, @SortOrder, @IsActive
    );

    DECLARE @NewMenuId INT = SCOPE_IDENTITY();

    -- Auto-grant to SuperAdmins
    INSERT INTO [dbo].[UserMenuPermissions] ([UserId], [MenuId], [CanView], [CanCreate], [CanEdit], [CanDelete], [CanExport], [AssignedAt])
    SELECT [Id], @NewMenuId, 1, 1, 1, 1, 1, GETUTCDATE()
    FROM [dbo].[Users]
    WHERE [Role] = 1;

    SELECT * FROM [dbo].[AppMenus] WHERE [Id] = @NewMenuId;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateMasterMenu]
    @Id INT,
    @ServiceCode NVARCHAR(50),
    @MenuKey NVARCHAR(50) = NULL,
    @Title NVARCHAR(100),
    @RoutePath NVARCHAR(100),
    @Icon NVARCHAR(50) = NULL,
    @ParentMenuId INT = NULL,
    @SortOrder INT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[AppMenus]
    SET [ServiceCode] = @ServiceCode,
        [MenuKey] = COALESCE(@MenuKey, [MenuKey]),
        [Title] = @Title,
        [RoutePath] = @RoutePath,
        [Icon] = @Icon,
        [ParentMenuId] = @ParentMenuId,
        [SortOrder] = @SortOrder,
        [IsActive] = @IsActive
    WHERE [Id] = @Id;

    SELECT * FROM [dbo].[AppMenus] WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteMasterMenu]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM [dbo].[UserMenuPermissions] WHERE [MenuId] = @Id;
    DELETE FROM [dbo].[AppMenus] WHERE [Id] = @Id;
    SELECT @@ROWCOUNT AS RowsDeleted;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetUserMenuPermissions]
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[UserMenuPermissions] WHERE [UserId] = @UserId;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_SaveUserMenuPermission]
    @UserId INT,
    @MenuId INT,
    @CanView BIT,
    @CanCreate BIT,
    @CanEdit BIT,
    @CanDelete BIT,
    @CanExport BIT,
    @AssignedByUserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM [dbo].[UserMenuPermissions] WHERE [UserId] = @UserId AND [MenuId] = @MenuId)
    BEGIN
        UPDATE [dbo].[UserMenuPermissions]
        SET [CanView] = @CanView,
            [CanCreate] = @CanCreate,
            [CanEdit] = @CanEdit,
            [CanDelete] = @CanDelete,
            [CanExport] = @CanExport,
            [AssignedByUserId] = @AssignedByUserId,
            [AssignedAt] = GETUTCDATE()
        WHERE [UserId] = @UserId AND [MenuId] = @MenuId;
    END
    ELSE
    BEGIN
        INSERT INTO [dbo].[UserMenuPermissions] (
            [UserId], [MenuId], [CanView], [CanCreate], [CanEdit], [CanDelete], [CanExport], [AssignedByUserId], [AssignedAt]
        )
        VALUES (
            @UserId, @MenuId, @CanView, @CanCreate, @CanEdit, @CanDelete, @CanExport, @AssignedByUserId, GETUTCDATE()
        );
    END
END
GO

-- 2.3 LEADS & ANALYTICS STORED PROCEDURES
CREATE OR ALTER PROCEDURE [dbo].[sp_GetLeads]
    @Status NVARCHAR(50) = NULL,
    @TemplateId INT = NULL,
    @Mobile NVARCHAR(20) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT * FROM [dbo].[LeadRecords]
    WHERE (@Status IS NULL OR [LeadStatus] = @Status)
      AND (@TemplateId IS NULL OR [TemplateId] = @TemplateId)
      AND (@Mobile IS NULL OR [Mobile] LIKE '%' + @Mobile + '%')
    ORDER BY [UpdatedAt] DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_CreateOrUpdateLead]
    @Mobile NVARCHAR(20),
    @CustomerName NVARCHAR(100) = NULL,
    @TemplateId INT = NULL,
    @LeadStatus NVARCHAR(200) = 'New',
    @CallDuration INT = 0,
    @PressedDtmf NVARCHAR(50) = NULL,
    @LastEventType NVARCHAR(50) = NULL,
    @UserId INT = NULL,
    @AssignedToUserId INT = NULL,
    @Cli NVARCHAR(20) = NULL,
    @Notes NVARCHAR(1000) = NULL,
    @CustomData NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM [dbo].[LeadRecords] WHERE [Mobile] = @Mobile)
    BEGIN
        UPDATE [dbo].[LeadRecords]
        SET [CustomerName] = COALESCE(@CustomerName, [CustomerName]),
            [TemplateId] = COALESCE(@TemplateId, [TemplateId]),
            [LeadStatus] = @LeadStatus,
            [CallDuration] = @CallDuration,
            [PressedDtmf] = @PressedDtmf,
            [LastEventType] = @LastEventType,
            [UserId] = COALESCE(@UserId, [UserId]),
            [AssignedToUserId] = COALESCE(@AssignedToUserId, [AssignedToUserId]),
            [Cli] = COALESCE(@Cli, [Cli]),
            [Notes] = COALESCE(@Notes, [Notes]),
            [CustomData] = COALESCE(@CustomData, [CustomData]),
            [UpdatedAt] = GETUTCDATE()
        WHERE [Mobile] = @Mobile;

        SELECT [Id] FROM [dbo].[LeadRecords] WHERE [Mobile] = @Mobile;
    END
    ELSE
    BEGIN
        INSERT INTO [dbo].[LeadRecords] (
            [Mobile], [CustomerName], [TemplateId], [LeadStatus], [CallDuration],
            [PressedDtmf], [LastEventType], [UserId], [AssignedToUserId], [Cli],
            [Notes], [CustomData], [CreatedAt], [UpdatedAt]
        )
        VALUES (
            @Mobile, @CustomerName, @TemplateId, @LeadStatus, @CallDuration,
            @PressedDtmf, @LastEventType, @UserId, @AssignedToUserId, @Cli,
            @Notes, @CustomData, GETUTCDATE(), GETUTCDATE()
        );

        SELECT SCOPE_IDENTITY() AS [Id];
    END
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetLeadAnalytics]
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Total count by status
    SELECT [LeadStatus], COUNT(*) AS [Count]
    FROM [dbo].[LeadRecords]
    GROUP BY [LeadStatus];

    -- Total count by template
    SELECT [TemplateId], COUNT(*) AS [Count]
    FROM [dbo].[LeadRecords]
    GROUP BY [TemplateId];
END
GO

-- 2.4 CAMPAIGN & WEBHOOK STORED PROCEDURES
CREATE OR ALTER PROCEDURE [dbo].[sp_CreateCampaign]
    @CampaignName NVARCHAR(100),
    @TemplateId INT = 0,
    @TargetMobile NVARCHAR(20),
    @Cli NVARCHAR(20) = NULL,
    @UserId INT = NULL,
    @RequestPayload NVARCHAR(MAX) = NULL,
    @ApiResponse NVARCHAR(MAX) = NULL,
    @DispatchStatus NVARCHAR(50) = 'Pending'
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[CampaignRecords] (
        [CampaignName], [TemplateId], [TargetMobile], [Cli], [UserId],
        [RequestPayload], [ApiResponse], [DispatchStatus], [DispatchedAt]
    )
    VALUES (
        @CampaignName, @TemplateId, @TargetMobile, @Cli, @UserId,
        @RequestPayload, @ApiResponse, @DispatchStatus, GETUTCDATE()
    );

    SELECT SCOPE_IDENTITY() AS [CampaignId];
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetCampaigns]
    @Limit INT = 100
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@Limit) * 
    FROM [dbo].[CampaignRecords]
    ORDER BY [DispatchedAt] DESC;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_InsertWebhookLog]
    @Mobile NVARCHAR(20) = NULL,
    @TemplateId INT = NULL,
    @EventType NVARCHAR(50) = NULL,
    @PressedKey NVARCHAR(50) = NULL,
    @Duration INT = 0,
    @ComputedLeadStatus NVARCHAR(200) = NULL,
    @RawPayload NVARCHAR(MAX) = NULL,
    @IsSuccess BIT = 1,
    @ErrorMessage NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[WebhookLogs] (
        [Mobile], [TemplateId], [EventType], [PressedKey], [Duration],
        [ComputedLeadStatus], [RawPayload], [ReceivedAt], [IsSuccess], [ErrorMessage]
    )
    VALUES (
        @Mobile, @TemplateId, @EventType, @PressedKey, @Duration,
        @ComputedLeadStatus, @RawPayload, GETUTCDATE(), @IsSuccess, @ErrorMessage
    );

    SELECT SCOPE_IDENTITY() AS [LogId];
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetWebhookLogs]
    @Limit INT = 100
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@Limit) * 
    FROM [dbo].[WebhookLogs]
    ORDER BY [ReceivedAt] DESC;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_InsertRcsTransaction]
    @TransactionCode NVARCHAR(50),
    @UserId INT,
    @Username NVARCHAR(100),
    @PerformedByUserId INT = NULL,
    @PerformedByUsername NVARCHAR(100) = NULL,
    @ServiceType NVARCHAR(20) = 'RCS',
    @ActionType NVARCHAR(50) = 'Credit',
    @Credits DECIMAL(18,2) = 0,
    @PricePerCredit DECIMAL(18,4) = 0,
    @TotalAmount DECIMAL(18,2) = 0,
    @Notes NVARCHAR(500) = NULL,
    @BalanceAfter DECIMAL(18,2) = 0
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[RcsTransactionLogs] (
        [TransactionCode], [CreatedAt], [UserId], [Username],
        [PerformedByUserId], [PerformedByUsername], [ServiceType], [ActionType],
        [Credits], [PricePerCredit], [TotalAmount], [Notes], [BalanceAfter]
    )
    VALUES (
        @TransactionCode, GETUTCDATE(), @UserId, @Username,
        @PerformedByUserId, @PerformedByUsername, @ServiceType, @ActionType,
        @Credits, @PricePerCredit, @TotalAmount, @Notes, @BalanceAfter
    );

    SELECT SCOPE_IDENTITY() AS [TransactionId];
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetRcsTransactionsByUserId]
    @UserId INT,
    @Limit INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@Limit) *
    FROM [dbo].[RcsTransactionLogs]
    WHERE [UserId] = @UserId
    ORDER BY [CreatedAt] DESC;
END
GO

-- ==============================================================================
-- 3. SEED INITIAL DATA
-- ==============================================================================

-- 3.1 DEFAULT SUPERADMIN (Username: Abhishaarod / Password: admin@@123)
-- Hash generated using SHA-256 PBKDF2
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Username] = 'Abhishaarod')
BEGIN
    INSERT INTO [dbo].[Users] (
        [Username], [Email], [PasswordHash], [FullName], [PhoneNumber],
        [Role], [ParentUserId], [VoiceCredits], [WhatsAppCredits],
        [RcsCredits], [SmsCredits], [IsActive], [CreatedAt], [UpdatedAt]
    )
    VALUES (
        'Abhishaarod', 'Abhishaarod@rcsflow.io', 
        '1vamnhZezWXosmOFtnAsFQ==:QoE4vlU2sxwsWP/JDcCyCHjlnfyqz5bjWKT0+x/IFH0=', -- PasswordHasher format for admin@@123
        'Abhishaarod', '9999900000',
        1, NULL, 100000, 100000, 100000, 100000, 1, GETUTCDATE(), GETUTCDATE()
    );
END
GO

-- 3.2 ROOT SERVICE MENUS
MERGE [dbo].[AppMenus] AS Target
USING (VALUES
    ('DASHBOARD', 'DASHBOARD', 'Dashboard', '/dashboard', 'fa-tachometer-alt', NULL, 1, 1),
    ('VOICE', 'VOICE_OBD', 'Voice OBD Calls', '/voice', 'fa-phone-volume', NULL, 2, 1),
    ('WHATSAPP', 'WHATSAPP', 'WhatsApp Messaging', '/whatsapp', 'fab fa-whatsapp', NULL, 3, 1),
    ('RCS', 'RCS_MESSAGING', 'RCS Messaging', '/rcs', 'fa-comment-alt', NULL, 4, 1),
    ('SMS', 'SMS_GATEWAY', 'SMS Gateway', '/sms', 'fa-sms', NULL, 5, 1),
    ('LEADS_CRM', 'LEADS_CRM', 'Leads CRM', '/leads', 'fa-users-cog', NULL, 6, 1),
    ('USER_MANAGEMENT', 'USER_MANAGEMENT', 'Users & Resellers', '/users', 'fa-user-friends', NULL, 7, 1),
    ('REPORTS', 'REPORTS', 'Reports & Analytics', '/analytics', 'fa-chart-pie', NULL, 8, 1)
) AS Source ([ServiceCode], [MenuKey], [Title], [RoutePath], [Icon], [ParentMenuId], [SortOrder], [IsActive])
ON Target.[MenuKey] = Source.[MenuKey]
WHEN MATCHED THEN
    UPDATE SET 
        Target.[Title] = Source.[Title],
        Target.[RoutePath] = Source.[RoutePath],
        Target.[Icon] = Source.[Icon],
        Target.[SortOrder] = Source.[SortOrder],
        Target.[IsActive] = Source.[IsActive]
WHEN NOT MATCHED THEN
    INSERT ([ServiceCode], [MenuKey], [Title], [RoutePath], [Icon], [ParentMenuId], [SortOrder], [IsActive])
    VALUES (Source.[ServiceCode], Source.[MenuKey], Source.[Title], Source.[RoutePath], Source.[Icon], Source.[ParentMenuId], Source.[SortOrder], Source.[IsActive]);
GO

-- 3.3 SUBMENUS (Dynamic linking with parent menus)
DECLARE @VoiceId INT = (SELECT [Id] FROM [dbo].[AppMenus] WHERE [MenuKey] = 'VOICE_OBD');
DECLARE @RcsId INT = (SELECT [Id] FROM [dbo].[AppMenus] WHERE [MenuKey] = 'RCS_MESSAGING');
DECLARE @WaId INT = (SELECT [Id] FROM [dbo].[AppMenus] WHERE [MenuKey] = 'WHATSAPP');
DECLARE @SmsId INT = (SELECT [Id] FROM [dbo].[AppMenus] WHERE [MenuKey] = 'SMS_GATEWAY');
DECLARE @CrmId INT = (SELECT [Id] FROM [dbo].[AppMenus] WHERE [MenuKey] = 'LEADS_CRM');
DECLARE @UserId INT = (SELECT [Id] FROM [dbo].[AppMenus] WHERE [MenuKey] = 'USER_MANAGEMENT');
DECLARE @RepId INT = (SELECT [Id] FROM [dbo].[AppMenus] WHERE [MenuKey] = 'REPORTS');

MERGE [dbo].[AppMenus] AS Target
USING (VALUES
    -- Voice Submenus (Single, Bulk, Templates 0-9, and Call Logs)
    ('VOICE', 'VOICE_SINGLE_CALL', 'Single OBD Call Reports', '/voice/single-call', 'fa-phone', @VoiceId, 1, 1),
    ('VOICE', 'VOICE_BULK_OBD', 'Bulk OBD Call Reports', '/voice/bulk-call', 'fa-broadcast-tower', @VoiceId, 2, 1),
    ('VOICE', 'VOICE_T0_REPORT', 'Template 0: Simple Campaign Reports', '/voice/template-0', 'fa-file-alt', @VoiceId, 3, 1),
    ('VOICE', 'VOICE_T1_REPORT', 'Template 1: DTMF Campaign Reports', '/voice/template-1', 'fa-keyboard', @VoiceId, 4, 1),
    ('VOICE', 'VOICE_T2_REPORT', 'Template 2: Call Patch Reports', '/voice/template-2', 'fa-headset', @VoiceId, 5, 1),
    ('VOICE', 'VOICE_T3_REPORT', 'Template 3: Custom IVR Reports', '/voice/template-3', 'fa-sitemap', @VoiceId, 6, 1),
    ('VOICE', 'VOICE_T4_REPORT', 'Template 4: Nextar Multi-Level IVR Reports', '/voice/template-4', 'fa-layer-group', @VoiceId, 7, 1),
    ('VOICE', 'VOICE_T5_REPORT', 'Template 5: OTP Verification Reports', '/voice/template-5', 'fa-key', @VoiceId, 8, 1),
    ('VOICE', 'VOICE_T7_REPORT', 'Template 7: TTS Simple IVR Reports', '/voice/template-7', 'fa-robot', @VoiceId, 9, 1),
    ('VOICE', 'VOICE_T8_REPORT', 'Template 8: TTS DTMF Campaign Reports', '/voice/template-8', 'fa-microphone', @VoiceId, 10, 1),
    ('VOICE', 'VOICE_T9_REPORT', 'Template 9: TTS Call Patch Reports', '/voice/template-9', 'fa-user-astronaut', @VoiceId, 11, 1),
    ('VOICE', 'VOICE_CALL_LOGS', 'Voice Call Logs (Audit Feed)', '/voice/logs', 'fa-history', @VoiceId, 12, 1),

    -- RCS Submenus
    ('RCS', 'RCS_DASHBOARD', 'RCS Overview & Balance Ledger', '/rcs/dashboard', 'fa-wallet', @RcsId, 1, 1),
    ('RCS', 'RCS_CAMPAIGNS', 'RCS Campaigns', '/rcs/campaigns', 'fa-bullhorn', @RcsId, 2, 1),
    ('RCS', 'RCS_TEMPLATES', 'Manage Templates', '/rcs/templates', 'fa-layer-group', @RcsId, 3, 1),
    ('RCS', 'RCS_BOTS', 'RCS Bots', '/rcs/bots', 'Bot', @RcsId, 4, 1),
    ('RCS', 'RCS_REPORTS', 'RCS Delivery Reports', '/rcs/reports', 'fa-chart-line', @RcsId, 5, 1),
    ('RCS', 'RCS_DLR_DOWNLOAD', 'DLR Export & Downloads', '/rcs/dlr-export', 'Download', @RcsId, 6, 1),

    -- WhatsApp Submenus
    ('WHATSAPP', 'WHATSAPP_BROADCAST', 'WhatsApp Broadcast', '/whatsapp/broadcast', 'fa-paper-plane', @WaId, 1, 1),
    ('WHATSAPP', 'WHATSAPP_TEMPLATES', 'Message Templates', '/whatsapp/templates', 'fa-file-alt', @WaId, 2, 1),
    ('WHATSAPP', 'WHATSAPP_REPORTS', 'WhatsApp Reports', '/whatsapp/reports', 'fa-chart-line', @WaId, 3, 1),

    -- SMS Submenus
    ('SMS', 'SMS_QUICK_SEND', 'Quick SMS', '/sms/send', 'fa-envelope', @SmsId, 1, 1),
    ('SMS', 'SMS_BULK_SEND', 'Bulk SMS Campaign', '/sms/bulk', 'fa-mail-bulk', @SmsId, 2, 1),
    ('SMS', 'SMS_DLT_TEMPLATES', 'DLT Templates', '/sms/templates', 'fa-stamp', @SmsId, 3, 1),

    -- Leads CRM Submenus
    ('LEADS_CRM', 'LEADS_ALL', 'All Leads', '/leads/all', 'fa-list', @CrmId, 1, 1),
    ('LEADS_CRM', 'LEADS_HOT', 'Super Hot Leads', '/leads/hot', 'fa-fire', @CrmId, 2, 1),
    ('LEADS_CRM', 'LEADS_EXPORT', 'Export Leads (CSV)', '/leads/export', 'fa-file-excel', @CrmId, 3, 1),

    -- User Management Submenus (including Dynamic Menu Management!)
    ('USER_MANAGEMENT', 'USERS_LIST', 'Subordinates List', '/users/list', 'fa-users', @UserId, 1, 1),
    ('USER_MANAGEMENT', 'USERS_CREATE', 'Create User / Reseller', '/users/create', 'fa-user-plus', @UserId, 2, 1),
    ('USER_MANAGEMENT', 'MENUS_MANAGE', 'Dynamic Menu Management', '/users/menu-management', 'fa-bars', @UserId, 3, 1),

    -- Reports Submenus
    ('REPORTS', 'REPORTS_OVERVIEW', 'Campaign Overview', '/analytics/overview', 'fa-chart-bar', @RepId, 1, 1),
    ('REPORTS', 'REPORTS_WEBHOOK_LOGS', 'Live Webhook Logs', '/analytics/webhook-logs', 'fa-stream', @RepId, 2, 1)
) AS Source ([ServiceCode], [MenuKey], [Title], [RoutePath], [Icon], [ParentMenuId], [SortOrder], [IsActive])
ON Target.[MenuKey] = Source.[MenuKey]
WHEN MATCHED THEN
    UPDATE SET 
        Target.[Title] = Source.[Title],
        Target.[RoutePath] = Source.[RoutePath],
        Target.[Icon] = Source.[Icon],
        Target.[ParentMenuId] = Source.[ParentMenuId],
        Target.[SortOrder] = Source.[SortOrder],
        Target.[IsActive] = Source.[IsActive]
WHEN NOT MATCHED THEN
    INSERT ([ServiceCode], [MenuKey], [Title], [RoutePath], [Icon], [ParentMenuId], [SortOrder], [IsActive])
    VALUES (Source.[ServiceCode], Source.[MenuKey], Source.[Title], Source.[RoutePath], Source.[Icon], Source.[ParentMenuId], Source.[SortOrder], Source.[IsActive]);
GO

-- 3.4 ASSIGN ALL MENUS TO SUPERADMIN
DECLARE @SuperAdminUserId INT = (SELECT [Id] FROM [dbo].[Users] WHERE [Role] = 1);

IF @SuperAdminUserId IS NOT NULL
BEGIN
    INSERT INTO [dbo].[UserMenuPermissions] ([UserId], [MenuId], [CanView], [CanCreate], [CanEdit], [CanDelete], [CanExport], [AssignedAt])
    SELECT @SuperAdminUserId, m.[Id], 1, 1, 1, 1, 1, GETUTCDATE()
    FROM [dbo].[AppMenus] m
    WHERE NOT EXISTS (
        SELECT 1 FROM [dbo].[UserMenuPermissions] p 
        WHERE p.[UserId] = @SuperAdminUserId AND p.[MenuId] = m.[Id]
    );
END
GO

PRINT '==============================================================================';
PRINT 'LeadsManagementDb successfully initialized with all tables, SPs, and seed data.';
PRINT '==============================================================================';
GO

