using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using LeadsManagement.Api.Data;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Services.Strategies;
using Xunit;

namespace LeadsManagement.Tests;

public class TemplateWebhookTests
{
    private LeadDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<LeadDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new LeadDbContext(options);
    }

    private IMemoryCache CreateMemoryCache()
    {
        return new MemoryCache(new MemoryCacheOptions());
    }

    // ==========================================
    // TEMPLATE 0: Simple Campaign Tests
    // ==========================================
    [Fact]
    public async Task Template0_ConnectedCalls_SetsDtmfConnectedStatus()
    {
        using var context = CreateInMemoryDbContext();
        var strategy = new Template0SimpleStrategy();

        var payload = new ExpressIvrWebhookDto
        {
            Mobile = "9876543210",
            EventType = "CONNECTED_CALLS",
            Duration = 0
        };

        var result = await strategy.ProcessWebhookAsync(payload, context, CancellationToken.None);

        Assert.Equal("DTMF Call Connected", result.LeadStatus);
        var lead = await context.LeadRecords.FirstOrDefaultAsync(x => x.Mobile == "9876543210");
        Assert.NotNull(lead);
        Assert.Equal("DTMF Call Connected", lead.LeadStatus);
    }

    [Fact]
    public async Task Template0_DtmfKey2_SetsNotInterested()
    {
        using var context = CreateInMemoryDbContext();
        var strategy = new Template0SimpleStrategy();

        var payload = new ExpressIvrWebhookDto
        {
            Mobile = "9876543210",
            EventType = "DTMF",
            PressedKey = "2",
            Duration = 5
        };

        var result = await strategy.ProcessWebhookAsync(payload, context, CancellationToken.None);

        Assert.Equal("Not Interested (Pressed 2)", result.LeadStatus);
    }

    [Fact]
    public async Task Template0_Hangup_PreservesPriorDtmfAndBucketsDuration()
    {
        using var context = CreateInMemoryDbContext();
        var strategy = new Template0SimpleStrategy();

        // 1. Send DTMF event
        await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9876543210",
            EventType = "DTMF",
            PressedKey = "5"
        }, context, CancellationToken.None);

        // 2. Send HANGUP event without pressedKey in payload
        var result = await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9876543210",
            EventType = "HANGUP",
            Duration = 48
        }, context, CancellationToken.None);

        Assert.Equal("Super Hot Interaction (Pressed 5 | 45-60+ sec)", result.LeadStatus);
        var lead = await context.LeadRecords.FirstOrDefaultAsync(x => x.Mobile == "9876543210");
        Assert.NotNull(lead);
        Assert.Equal(48, lead.CallDuration);
        Assert.Equal("5", lead.PressedDtmf);
    }

    // ==========================================
    // TEMPLATE 1: DTMF Campaign Tests
    // ==========================================
    [Fact]
    public async Task Template1_HangupWithKey1AndLongCall_SetsSuperHotLead()
    {
        using var context = CreateInMemoryDbContext();
        var strategy = new Template1DtmfStrategy();

        var payload = new ExpressIvrWebhookDto
        {
            Mobile = "9988776655",
            EventType = "HANGUP",
            PressedKey = "1",
            Duration = 35
        };

        var result = await strategy.ProcessWebhookAsync(payload, context, CancellationToken.None);

        Assert.Equal("Super Hot Lead - Pressed 1 & Long Call", result.LeadStatus);
    }

    [Fact]
    public async Task Template1_HangupLongCallWithoutKey_SetsWarmLead()
    {
        using var context = CreateInMemoryDbContext();
        var strategy = new Template1DtmfStrategy();

        var payload = new ExpressIvrWebhookDto
        {
            Mobile = "9988776655",
            EventType = "HANGUP",
            PressedKey = "",
            Duration = 26
        };

        var result = await strategy.ProcessWebhookAsync(payload, context, CancellationToken.None);

        Assert.Equal("Warm Lead - Long Call Without Target Key", result.LeadStatus);
    }

    // ==========================================
    // TEMPLATE 2: Call Patch Campaign Tests
    // ==========================================
    [Fact]
    public async Task Template2_DtmfAndHangup_SetsVeryHotLead()
    {
        using var context = CreateInMemoryDbContext();
        var strategy = new Template2CallPatchStrategy();

        var result = await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9123456780",
            EventType = "HANGUP",
            PressedKey = "1",
            Duration = 70
        }, context, CancellationToken.None);

        Assert.Equal("Very Hot Lead - Agent Connection & Long Conversation", result.LeadStatus);
    }

    // ==========================================
    // TEMPLATE 3: Custom IVR Campaign Tests
    // ==========================================
    [Fact]
    public async Task Template3_CustomIvrKeyAndDuration_SetsHotLead()
    {
        using var context = CreateInMemoryDbContext();
        var strategy = new Template3CustomIvrStrategy();

        var result = await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9811122233",
            EventType = "HANGUP",
            PressedKey = "3",
            Duration = 65
        }, context, CancellationToken.None);

        Assert.Equal("Hot Lead - Custom IVR Deep Engagement - Key 3", result.LeadStatus);
    }

    // ==========================================
    // TEMPLATE 4: Multi Level Nextar Tests (Cache & Hangup)
    // ==========================================
    [Fact]
    public async Task Template4_NextarDtmfCached_AndEvaluatedAtHangup()
    {
        using var context = CreateInMemoryDbContext();
        var cache = CreateMemoryCache();
        var strategy = new Template4NextarStrategy(cache);

        // DTMF Event - should only cache, no DB lead created yet
        var dtmfResult = await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9800011122",
            EventType = "DTMF",
            PressedKey = "2" // High intent key
        }, context, CancellationToken.None);

        Assert.Contains("temporarily stored", dtmfResult.Message);
        Assert.Null(await context.LeadRecords.FirstOrDefaultAsync(x => x.Mobile == "9800011122"));

        // HANGUP Event - should retrieve cached key 2 and duration 65s
        var hangupResult = await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9800011122",
            EventType = "HANGUP",
            Duration = 65
        }, context, CancellationToken.None);

        Assert.Equal("Very Hot Lead - High Intent Key 2 + Deep Engagement", hangupResult.LeadStatus);
        var lead = await context.LeadRecords.FirstOrDefaultAsync(x => x.Mobile == "9800011122");
        Assert.NotNull(lead);
        Assert.Equal("2", lead.PressedDtmf);
    }

    // ==========================================
    // TEMPLATE 5: OTP Case Tests (Cache & Hangup)
    // ==========================================
    [Fact]
    public async Task Template5_OtpVerification_CalculatesCorrectStatus()
    {
        using var context = CreateInMemoryDbContext();
        var cache = CreateMemoryCache();
        var strategy = new Template5OtpStrategy(cache);

        // 1. DTMF with OTP
        await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9700011122",
            EventType = "DTMF",
            PressedKey = "654321"
        }, context, CancellationToken.None);

        // 2. HANGUP
        var hangupResult = await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9700011122",
            EventType = "HANGUP",
            Duration = 45
        }, context, CancellationToken.None);

        Assert.Equal("OTP Verification Completed - Input 654321", hangupResult.LeadStatus);
    }

    // ==========================================
    // TEMPLATE 7: TTS Simple IVR Tests
    // ==========================================
    [Fact]
    public async Task Template7_TtsSimpleTargetKey1_SetsVeryHotLead()
    {
        using var context = CreateInMemoryDbContext();
        var cache = CreateMemoryCache();
        var strategy = new Template7TtsSimpleStrategy(cache);

        await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9600011122",
            EventType = "DTMF",
            PressedKey = "1"
        }, context, CancellationToken.None);

        var hangupResult = await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9600011122",
            EventType = "HANGUP",
            Duration = 65
        }, context, CancellationToken.None);

        Assert.Equal("Very Hot Lead - TTS Target Key 1 + Deep Engagement", hangupResult.LeadStatus);
    }

    // ==========================================
    // TEMPLATE 8: TTS DTMF Tests
    // ==========================================
    [Fact]
    public async Task Template8_TtsDtmfTargetKey1_SetsVeryHotLead()
    {
        using var context = CreateInMemoryDbContext();
        var strategy = new Template8TtsDtmfStrategy();

        await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9500011122",
            EventType = "DTMF",
            PressedKey = "1"
        }, context, CancellationToken.None);

        var hangupResult = await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9500011122",
            EventType = "HANGUP",
            Duration = 65
        }, context, CancellationToken.None);

        Assert.Equal("Very Hot Lead - TTS Target Key 1 + Long Engagement", hangupResult.LeadStatus);
    }

    // ==========================================
    // TEMPLATE 9: TTS Call Patch Tests
    // ==========================================
    [Fact]
    public async Task Template9_TtsCallPatch_SetsVeryHotLead()
    {
        using var context = CreateInMemoryDbContext();
        var strategy = new Template9TtsCallPatchStrategy();

        await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9400011122",
            EventType = "DTMF",
            PressedKey = "1"
        }, context, CancellationToken.None);

        var hangupResult = await strategy.ProcessWebhookAsync(new ExpressIvrWebhookDto
        {
            Mobile = "9400011122",
            EventType = "HANGUP",
            Duration = 65
        }, context, CancellationToken.None);

        Assert.Equal("Very Hot Lead - TTS Agent Connection + Long Engagement", hangupResult.LeadStatus);
    }
}
