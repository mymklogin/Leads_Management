using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Repositories.Interfaces;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Services.Implementations;

public class ExpressIvrClient : IExpressIvrClient
{
    private readonly HttpClient _httpClient;
    private readonly ICampaignRepository _campaignRepository;
    private readonly ILeadRepository _leadRepository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ExpressIvrClient> _logger;

    private const string DefaultSmsConfig = "{\"CALL_CONNECTED\":{\"url\":\"https://api.XXXXXX.io/api/v1/send?username=XXXXXXXXXX&password=XXXXXX&to={PHONE}&from=XXXXXX&dltPrincipalEntityId=1201161304403738311&dltContentId=XXXXXXXX&corelationId=XXXXXXXX&text=XXXXXXXXXXXXXXXXXXXXXXXXXX&unicode=false&issurl=true\",\"duration\":8,\"sms_text\":\"hello connect\"},\"CALL_FAILED\":{\"url\":\"https://api.XXXXXXXXXX.io/api/v1/send?username=XXXXXXXXX&password=XXXXXXXX&to={PHONE}&from=XXXXXX&dltPrincipalEntityId=XXXXXXXXXX&dltContentId=XXXXXXXX&corelationId=XXXXXXXX&text=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&unicode=false&issurl=true\",\"duration\":0,\"sms_text\":\"hello failed\"}}";

    public ExpressIvrClient(
        HttpClient httpClient,
        ICampaignRepository campaignRepository,
        ILeadRepository leadRepository,
        IConfiguration configuration,
        ILogger<ExpressIvrClient> logger)
    {
        _httpClient = httpClient;
        _campaignRepository = campaignRepository;
        _leadRepository = leadRepository;
        _configuration = configuration;
        _logger = logger;
    }

    public ExpressIvrSingleCallPayload BuildSimplePayload(SimpleCallRequestDto request)
    {
        return BuildPayload(new AdvancedCallRequestDto
        {
            TemplateId = request.TemplateId,
            Mobile = request.Mobile,
            CustomerName = request.CustomerName
        });
    }

    public ExpressIvrSingleCallPayload BuildPayload(AdvancedCallRequestDto request)
    {
        string webhookBase = request.WebhookBaseUrl
            ?? _configuration["ExpressIvr:WebhookBaseUrl"]
            ?? "http://localhost:2014";

        string webhookUrl = $"{webhookBase.TrimEnd('/')}/api/v1/GetRoutingInfo";
        string webhooksJson = $"{{\"HANGUP\":{{\"url\":\"{webhookUrl}\"}},\"DTMF\":{{\"url\":\"{webhookUrl}\"}},\"CONNECTED_CALLS\":{{\"url\":\"{webhookUrl}\"}}}}";

        int defaultUserId = request.TemplateId >= 7 ? 500002 : _configuration.GetValue<int>("ExpressIvr:DefaultUserId", 50002);
        string defaultCli = request.TemplateId >= 7 ? "" : (_configuration["ExpressIvr:DefaultCli"] ?? "9999900119");

        var payload = new ExpressIvrSingleCallPayload
        {
            UserId = request.UserId ?? defaultUserId,
            TemplateId = request.TemplateId,
            Mobile = request.Mobile,
            Cli = request.Cli ?? defaultCli,
            CountryCode = "91",
            Sms = DefaultSmsConfig,
            Webhooks = webhooksJson
        };

        switch (request.TemplateId)
        {
            case 0: // Simple Campaign
                payload.WelcomePId = request.WelcomePId ?? 238;
                payload.MenuPId = request.MenuPId ?? 0;
                payload.ThanksPId = request.ThanksPId ?? 0;
                payload.WrongInputPId = request.WrongInputPId ?? 0;
                payload.NoInputPId = request.NoInputPId ?? 0;
                payload.RePrompt = request.RePrompt ?? 0;
                payload.MenuWaitTime = request.MenuWaitTime ?? 0;
                payload.Otp = 0;
                break;

            case 1: // DTMF Campaign
                payload.Dtmf = request.Dtmf ?? "1";
                payload.WelcomePId = request.WelcomePId ?? 0;
                payload.MenuPId = request.MenuPId ?? 240;
                payload.ThanksPId = request.ThanksPId ?? 1203;
                payload.WrongInputPId = request.WrongInputPId ?? 1204;
                payload.NoInputPId = request.NoInputPId ?? 1205;
                payload.RePrompt = request.RePrompt ?? 1;
                payload.MenuWaitTime = request.MenuWaitTime ?? 3;
                payload.Otp = 0;
                break;

            case 2: // Call Patch Campaign
                payload.WelcomePId = request.WelcomePId ?? 0;
                payload.MenuPId = request.MenuPId ?? 240;
                payload.ThanksPId = request.ThanksPId ?? 1203;
                payload.WrongInputPId = request.WrongInputPId ?? 1204;
                payload.NoInputPId = request.NoInputPId ?? 1205;
                payload.MenuWaitTime = request.MenuWaitTime ?? 1;
                payload.AgentRows = request.AgentRows ?? "{\"patchList\":[{\"agentGroup\":\"8\",\"agentDtmf\":\"1\"}]}";
                payload.Otp = 0;
                break;

            case 3: // Custom IVR
                payload.IvrId = request.IvrId ?? 18;
                payload.WelcomePId = request.WelcomePId ?? 0;
                payload.MenuPId = request.MenuPId ?? 0;
                payload.ThanksPId = request.ThanksPId ?? 0;
                payload.WrongInputPId = request.WrongInputPId ?? 1204;
                payload.NoInputPId = request.NoInputPId ?? 1205;
                payload.RePrompt = request.RePrompt ?? 1;
                payload.MenuWaitTime = request.MenuWaitTime ?? 3;
                payload.Otp = 0;
                payload.Sms = "{}";
                break;

            case 4: // Multi Level Nextar
                payload.WelcomePId = request.WelcomePId ?? 0;
                payload.MenuPId = request.MenuPId ?? 0;
                payload.ThanksPId = request.ThanksPId ?? 0;
                payload.WrongInputPId = request.WrongInputPId ?? 0;
                payload.NoInputPId = request.NoInputPId ?? 0;
                payload.RePrompt = request.RePrompt ?? 1;
                payload.MenuWaitTime = request.MenuWaitTime ?? 5;
                payload.Menus = request.Menus ?? "{ \"1\": { \"prompt\": 241, \"dtmf\": \"5|6|7|8\" }, \"2\": { \"prompt\": 238, \"dtmf\": \"5|6|7\" }, \"3\": { \"prompt\": 240, \"dtmf\": \"1|2|3|4\" } }";
                payload.Otp = 0;
                break;

            case 5: // OTP Case
                payload.WelcomePId = request.WelcomePId ?? 240;
                payload.Otp = request.Otp ?? "123456";
                payload.Sms = "{}";
                break;

            case 7: // TTS Simple IVR
                payload.TtsRows = request.TtsRows ?? "{\"ttsList\":[{\"ttsType\":\"prompt\",\"value\":\"1366\",\"variableType\":\"\"},{\"ttsType\":\"variable\",\"value\":\"1\",\"variableType\":\"text\"},{\"ttsType\":\"prompt\",\"value\":\"1362\",\"variableType\":\"\"},{\"ttsType\":\"variable\",\"value\":\"2\",\"variableType\":\"number\"}]}";
                payload.Gender = request.Gender ?? "MALE";
                payload.Language = request.Language ?? "en-IN";
                break;

            case 8: // TTS DTMF
                payload.Dtmf = request.Dtmf ?? "1";
                payload.MenuPId = request.MenuPId ?? 19;
                payload.ThanksPId = request.ThanksPId ?? 1203;
                payload.WrongInputPId = request.WrongInputPId ?? 1204;
                payload.NoInputPId = request.NoInputPId ?? 1205;
                payload.RePrompt = request.RePrompt ?? 1;
                payload.MenuWaitTime = request.MenuWaitTime ?? 3;
                payload.TtsRows = request.TtsRows ?? "{\"ttsList\":[{\"ttsType\":\"prompt\",\"value\":\"19\",\"variableType\":\"\"},{\"ttsType\":\"variable\",\"value\":\"1\",\"variableType\":\"text\"},{\"ttsType\":\"prompt\",\"value\":\"88\",\"variableType\":\"\"},{\"ttsType\":\"variable\",\"value\":\"2\",\"variableType\":\"number\"}]}";
                payload.Gender = request.Gender ?? "MALE";
                payload.Language = request.Language ?? "en-IN";
                break;

            case 9: // TTS Call Patch
                payload.MenuPId = request.MenuPId ?? 19;
                payload.ThanksPId = request.ThanksPId ?? 1203;
                payload.WrongInputPId = request.WrongInputPId ?? 1204;
                payload.NoInputPId = request.NoInputPId ?? 1205;
                payload.NoAgentId = 19;
                payload.MenuWaitTime = request.MenuWaitTime ?? 1;
                payload.AgentRows = request.AgentRows ?? "{\"patchList\":[{\"agentGroup\":\"8\",\"agentDtmf\":\"1\"}]}";
                payload.TtsRows = request.TtsRows ?? "{\"ttsList\":[{\"ttsType\":\"prompt\",\"value\":\"19\",\"variableType\":\"\"},{\"ttsType\":\"variable\",\"value\":\"1\",\"variableType\":\"text\"},{\"ttsType\":\"prompt\",\"value\":\"88\",\"variableType\":\"\"},{\"ttsType\":\"variable\",\"value\":\"2\",\"variableType\":\"number\"}]}";
                payload.Gender = request.Gender ?? "MALE";
                payload.Language = request.Language ?? "en-IN";
                break;
        }

        return payload;
    }

    public async Task<SingleCallResponseDto> SendSingleCallAsync(
        SimpleCallRequestDto request,
        CancellationToken cancellationToken = default)
    {
        return await SendAdvancedSingleCallAsync(new AdvancedCallRequestDto
        {
            TemplateId = request.TemplateId,
            Mobile = request.Mobile,
            CustomerName = request.CustomerName
        }, cancellationToken);
    }

    public async Task<SingleCallResponseDto> SendAdvancedSingleCallAsync(
        AdvancedCallRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var payload = BuildPayload(request);
        string json = JsonSerializer.Serialize(payload);

        string apiUrl = _configuration["ExpressIvr:ApiUrl"] ?? "https://obd3api.expressivr.com/api/obd/singlecall";
        string apiKey = _configuration["ExpressIvr:ApiKey"] ?? "TEST_API_KEY";

        var campaignRecord = new CampaignRecord
        {
            CampaignName = $"OBD-Template-{request.TemplateId}-{DateTime.UtcNow:yyyyMMdd-HHmmss}",
            TemplateId = request.TemplateId,
            TargetMobile = request.Mobile,
            Cli = payload.Cli,
            UserId = payload.UserId,
            RequestPayload = json,
            DispatchedAt = DateTime.UtcNow
        };

        try
        {
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            httpRequest.Headers.Add("Api-Key", apiKey);
            httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
            string responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

            campaignRecord.ApiResponse = responseBody;
            campaignRecord.DispatchStatus = response.IsSuccessStatusCode ? "Sent" : "Failed";

            await _campaignRepository.CreateCampaignAsync(campaignRecord, cancellationToken);

            var lead = await _leadRepository.GetLeadByMobileAsync(request.Mobile, cancellationToken);
            if (lead == null)
            {
                await _leadRepository.CreateOrUpdateLeadAsync(new LeadRecord
                {
                    Mobile = request.Mobile,
                    CustomerName = request.CustomerName,
                    TemplateId = request.TemplateId,
                    LeadStatus = "Call Initiated",
                    Cli = payload.Cli,
                    UserId = payload.UserId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }, cancellationToken);
            }

            return new SingleCallResponseDto
            {
                Success = response.IsSuccessStatusCode,
                Message = response.IsSuccessStatusCode ? "OBD Call initiated successfully." : $"OBD Call failed with status code {response.StatusCode}.",
                ApiResponse = responseBody,
                PayloadSent = payload
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send single call to ExpressIVR for mobile {Mobile}", request.Mobile);
            campaignRecord.DispatchStatus = "Error";
            campaignRecord.ApiResponse = ex.Message;
            await _campaignRepository.CreateCampaignAsync(campaignRecord, cancellationToken);

            return new SingleCallResponseDto
            {
                Success = false,
                Message = $"Error dispatching OBD call: {ex.Message}",
                PayloadSent = payload
            };
        }
    }

    public IEnumerable<TemplateInfoDto> GetAllTemplateDefinitions(string? webhookBaseUrl = null)
    {
        var templates = new List<(int id, string name, string desc)>
        {
            (0, "Simple Campaign", "Standard Voice Broadcast with welcome prompt 238 and multi-tier duration status"),
            (1, "DTMF Campaign", "Interactive Menu (prompt 240) asking user to press 1 with thanks prompt 1203"),
            (2, "Call Patch Campaign", "Menu prompt 240 patching to agent group 8 when key 1 is pressed"),
            (3, "Custom IVR Campaign", "Custom IVR flow (ivrId: 18) with invalid/no input reprompting"),
            (4, "Multi Level IVR Nextar", "Multi-level IVR menu (1, 2, 3 prompts) with memory-cached key evaluation on hangup"),
            (5, "OTP Verification", "Plays OTP prompt 240, captures caller OTP digits into memory cache"),
            (7, "TTS Simple IVR", "Text-to-speech personalized prompts with variable names and prompt IDs"),
            (8, "TTS DTMF", "Text-to-speech prompt with DTMF key 1 capture"),
            (9, "TTS Call Patch", "Text-to-speech personalized greeting with agent patching")
        };

        return templates.Select(t => new TemplateInfoDto
        {
            TemplateId = t.id,
            Name = t.name,
            Description = t.desc,
            SamplePayload = BuildPayload(new AdvancedCallRequestDto
            {
                TemplateId = t.id,
                Mobile = t.id >= 7 ? "9065968937_Rohit,1232" : "8571844348",
                WebhookBaseUrl = webhookBaseUrl
            })
        });
    }

    public TemplateInfoDto? GetTemplateDefinition(int templateId, string? webhookBaseUrl = null)
    {
        return GetAllTemplateDefinitions(webhookBaseUrl).FirstOrDefault(x => x.TemplateId == templateId);
    }
}
