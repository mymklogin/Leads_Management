using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LeadsManagement.Api.Data;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Models.Enums;
using LeadsManagement.Api.Services.Implementations;
using Xunit;

namespace LeadsManagement.Tests;

public class UserHierarchyAndMenuTests
{
    private LeadDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<LeadDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var context = new LeadDbContext(options);
        LeadDbContext.SeedInitialData(context);
        return context;
    }

    [Fact]
    public async Task HierarchyValidation_ResellerCannotCreateAdmin_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var hasher = new PasswordHasher();
        var menuService = new MenuService(context);
        var userService = new UserManagementService(context, hasher, menuService);

        // Create an Admin under SuperAdmin (ID 1)
        var admin = await userService.CreateUserAsync(1, new CreateUserDto
        {
            Username = "admin1",
            Email = "admin1@test.com",
            Password = "Password@123",
            FullName = "Admin One",
            Role = UserRole.Admin
        });

        // Create a Reseller under Admin
        var reseller = await userService.CreateUserAsync(admin.Id, new CreateUserDto
        {
            Username = "reseller1",
            Email = "reseller1@test.com",
            Password = "Password@123",
            FullName = "Reseller One",
            Role = UserRole.Reseller
        });

        // Act & Assert: Reseller tries to create an Admin -> should fail!
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            userService.CreateUserAsync(reseller.Id, new CreateUserDto
            {
                Username = "illegal_admin",
                Email = "illegal@test.com",
                Password = "Password@123",
                FullName = "Illegal Admin",
                Role = UserRole.Admin
            })
        );
    }

    [Fact]
    public async Task DynamicMenu_UserOnlySeesAllowedMenusInSidebarTree()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var hasher = new PasswordHasher();
        var menuService = new MenuService(context);
        var userService = new UserManagementService(context, hasher, menuService);

        // SuperAdmin creates a User and only grants WhatsApp Service and Broadcast
        var waRoot = context.AppMenus.First(m => m.MenuKey == "WHATSAPP");
        var waSub = context.AppMenus.First(m => m.MenuKey == "WHATSAPP_BROADCAST");

        var user = await userService.CreateUserAsync(1, new CreateUserDto
        {
            Username = "whatsapp_agent",
            Email = "wa@test.com",
            Password = "Password@123",
            FullName = "WhatsApp Agent",
            Role = UserRole.User,
            InitialMenuIds = new List<int> { waRoot.Id, waSub.Id }
        });

        // Act
        var sidebarMenus = await menuService.GetMyMenusAsync(user.Id);

        // Assert
        Assert.NotNull(sidebarMenus);
        // Should only contain 1 root menu: WhatsApp
        Assert.Single(sidebarMenus);
        Assert.Equal("WHATSAPP", sidebarMenus[0].ServiceCode);
        Assert.Single(sidebarMenus[0].SubMenus);
        Assert.Equal("WHATSAPP_BROADCAST", sidebarMenus[0].SubMenus[0].MenuKey);
    }

    [Fact]
    public async Task CascadingRevocation_WhenParentLosesMenu_DownlineUsersLoseMenuAutomatically()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var hasher = new PasswordHasher();
        var menuService = new MenuService(context);
        var userService = new UserManagementService(context, hasher, menuService);

        var waRoot = context.AppMenus.First(m => m.MenuKey == "WHATSAPP");
        var waSub = context.AppMenus.First(m => m.MenuKey == "WHATSAPP_BROADCAST");
        var voiceRoot = context.AppMenus.First(m => m.MenuKey == "VOICE_OBD");
        var voiceSub = context.AppMenus.First(m => m.MenuKey == "VOICE_SINGLE_CALL");

        // 1. SuperAdmin creates Admin with WhatsApp and Voice
        var admin = await userService.CreateUserAsync(1, new CreateUserDto
        {
            Username = "admin_corp",
            Email = "admin_corp@test.com",
            Password = "Password@123",
            FullName = "Admin Corp",
            Role = UserRole.Admin,
            InitialMenuIds = new List<int> { waRoot.Id, waSub.Id, voiceRoot.Id, voiceSub.Id }
        });

        // 2. Admin creates Reseller with WhatsApp
        var reseller = await userService.CreateUserAsync(admin.Id, new CreateUserDto
        {
            Username = "reseller_hub",
            Email = "reseller_hub@test.com",
            Password = "Password@123",
            FullName = "Reseller Hub",
            Role = UserRole.Reseller,
            InitialMenuIds = new List<int> { waRoot.Id, waSub.Id }
        });

        // 3. Reseller creates User with WhatsApp
        var agent = await userService.CreateUserAsync(reseller.Id, new CreateUserDto
        {
            Username = "agent_wa",
            Email = "agent_wa@test.com",
            Password = "Password@123",
            FullName = "Agent WA",
            Role = UserRole.User,
            InitialMenuIds = new List<int> { waRoot.Id, waSub.Id }
        });

        // Verify initial state: Agent has WhatsApp
        var agentMenusBefore = await menuService.GetMyMenusAsync(agent.Id);
        Assert.Single(agentMenusBefore);
        Assert.Equal("WHATSAPP", agentMenusBefore[0].ServiceCode);

        // 4. 🔥 Admin REVOKES WhatsApp from Reseller (unchecks 6 & 7, leaves empty or other)
        await menuService.AssignPermissionsAsync(admin.Id, new AssignMenuPermissionsDto
        {
            TargetUserId = reseller.Id,
            Permissions = new List<MenuPermissionItemDto>() // All unchecked!
        });

        // 5. Assert: Reseller lost WhatsApp
        var resellerMenusAfter = await menuService.GetMyMenusAsync(reseller.Id);
        Assert.Empty(resellerMenusAfter);

        // 6. 🔥 AUTOMATIC CASCADE CHECK: Agent under Reseller MUST ALSO AUTOMATICALLY LOSE WHATSAPP!
        var agentMenusAfter = await menuService.GetMyMenusAsync(agent.Id);
        Assert.Empty(agentMenusAfter);
    }

    [Fact]
    public async Task DataScoping_UserOnlySeesAssignedLeads_WhileSuperAdminSeesAllLeads()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var leadService = new LeadService(context);
        var hasher = new PasswordHasher();
        var menuService = new MenuService(context);
        var userService = new UserManagementService(context, hasher, menuService);

        // Create User 1 & User 2
        var user1 = await userService.CreateUserAsync(1, new CreateUserDto
        {
            Username = "telecaller1",
            Email = "tc1@test.com",
            Password = "Password@123",
            FullName = "Telecaller 1",
            Role = UserRole.User
        });

        var user2 = await userService.CreateUserAsync(1, new CreateUserDto
        {
            Username = "telecaller2",
            Email = "tc2@test.com",
            Password = "Password@123",
            FullName = "Telecaller 2",
            Role = UserRole.User
        });

        // Add lead for User 1
        await leadService.CreateLeadAsync(new CreateLeadDto
        {
            Mobile = "9876543210",
            CustomerName = "Lead For User 1",
            LeadStatus = "Hot Lead"
        }, user1.Id);

        // Add lead for User 2
        await leadService.CreateLeadAsync(new CreateLeadDto
        {
            Mobile = "9123456780",
            CustomerName = "Lead For User 2",
            LeadStatus = "Warm Lead"
        }, user2.Id);

        // Act & Assert
        // User 1 only sees their lead
        var user1Leads = await leadService.GetLeadsAsync(new LeadFilterDto(), user1.Id);
        Assert.Equal(1, user1Leads.TotalCount);
        Assert.Equal("9876543210", user1Leads.Items.First().Mobile);

        // User 2 only sees their lead
        var user2Leads = await leadService.GetLeadsAsync(new LeadFilterDto(), user2.Id);
        Assert.Equal(1, user2Leads.TotalCount);
        Assert.Equal("9123456780", user2Leads.Items.First().Mobile);

        // SuperAdmin (ID = 1) sees ALL leads
        var superAdminLeads = await leadService.GetLeadsAsync(new LeadFilterDto(), 1);
        Assert.Equal(2, superAdminLeads.TotalCount);
    }
}
