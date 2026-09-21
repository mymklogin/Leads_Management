using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Services.Implementations;
using LeadsManagement.Api.Services.Interfaces;
using LeadsManagement.Api.Services.Strategies;
using Xunit;

namespace LeadsManagement.Tests;

public class WebhookProcessorServiceTests
{
    [Fact]
    public async Task ProcessWebhook_RoutesToCorrectStrategyAndLogsAuditTrail()
    {
        var webhookLogRepo = new FakeWebhookLogRepository();
        var leadRepo = new FakeLeadRepository();
        var cache = new MemoryCache(new MemoryCacheOptions());

        var strategies = new List<ITemplateWebhookStrategy>
        {
            new Template0SimpleStrategy(),
            new Template1DtmfStrategy(),
            new Template2CallPatchStrategy(),
            new Template3CustomIvrStrategy(),
            new Template4NextarStrategy(cache),
            new Template5OtpStrategy(cache),
            new Template7TtsSimpleStrategy(cache),
            new Template8TtsDtmfStrategy(),
            new Template9TtsCallPatchStrategy()
        };

        var processor = new WebhookProcessorService(
            webhookLogRepo,
            leadRepo,
            strategies,
            NullLogger<WebhookProcessorService>.Instance);

        var payload = new ExpressIvrWebhookDto
        {
            Mobile = "9112233445",
            TemplateId = 1,
            EventType = "DTMF",
            PressedKey = "1",
            Duration = 10
        };

        var result = await processor.ProcessWebhookAsync(payload, cancellationToken: CancellationToken.None);

        Assert.Equal("success", result.Status);
        Assert.Equal(1, result.TemplateId);
        Assert.Equal("Interested Lead - Pressed 1", result.LeadStatus);

        // Verify WebhookLog is saved
        var log = webhookLogRepo.Logs.FirstOrDefault(x => x.Mobile == "9112233445");
        Assert.NotNull(log);
        Assert.True(log.IsSuccess);
        Assert.Equal("Interested Lead - Pressed 1", log.ComputedLeadStatus);
    }
}
