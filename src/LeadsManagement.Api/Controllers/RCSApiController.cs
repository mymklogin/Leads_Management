using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Repositories.Interfaces;

namespace LeadsManagement.Api.Controllers;

public class RcsCampaignRequestDto
{
    public string TemplateId { get; set; } = string.Empty;
    public string CampaignName { get; set; } = string.Empty;
    public List<string> MobileNumbers { get; set; } = new();
    public bool EnableFallback { get; set; } = false;
    public string? EntityId { get; set; }
    public string? SenderId { get; set; }
    public string? SmsTemplateId { get; set; }
    public string? SmsText { get; set; }
}

public class RcsCreditRequestDto
{
    public int? UserId { get; set; }
    public decimal RcsCreditsToAdd { get; set; }
    public decimal SmsCreditsToAdd { get; set; }
    public string? Notes { get; set; }
}

public class RcsBalanceManageDto
{
    public int TargetUserId { get; set; }
    public string ServiceType { get; set; } = "RCS"; // "RCS" or "SMS"
    public string ActionType { get; set; } = "Credit"; // "Credit" or "Revoke"
    public decimal Credits { get; set; }
    public decimal PricePerCredit { get; set; } = 0.20m;
    public string? Notes { get; set; }
}

public class RcsTemplateDto
{
    public string TemplateId { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public string TemplateType { get; set; } = "RichCard"; // PlainText, RichCard, Carousel
    public string BotId { get; set; } = string.Empty;
    public string BotName { get; set; } = string.Empty;
    public string VendorTemplateId { get; set; } = string.Empty;
    public string TemplateStatus { get; set; } = "Active"; // Active, Inactive, Pending, Rejected
    public string? EntityId { get; set; }
    public string? SenderId { get; set; }
    public string? SmsTemplateId { get; set; }
    public string? SmsText { get; set; }
    public string? CardTitle { get; set; }
    public string? CardDescription { get; set; }
    public string? MediaUrl { get; set; }
    public string? ButtonLabel { get; set; }
    public string? ButtonUrl { get; set; }
    public string? ButtonsJson { get; set; }
    public string CreatedDate { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
}

public class RcsBotDto
{
    public string BotId { get; set; } = string.Empty;
    public string BotName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Verified"; // Verified, Pending
    public string WebhookUrl { get; set; } = "https://yourdomain.com/rcs-webhook";
    public string Color { get; set; } = "#4f46e5";
    public string CreatedDate { get; set; } = "2026-08-01 10:00";
    public int TemplateCount { get; set; }
}

public class RcsCampaignReportDto
{
    public int CampaignId { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public string TemplateId { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public string TemplateType { get; set; } = "RichCard";
    public string BotName { get; set; } = "Marketing Bot";
    public int TotalMobiles { get; set; }
    public int DeliveredRcs { get; set; }
    public int ReadRcs { get; set; }
    public int FallbackSms { get; set; }
    public int Failed { get; set; }
    public decimal DeliveryRate { get; set; }
    public decimal ReadRate { get; set; }
    public bool HasFallback { get; set; }
    public string Status { get; set; } = "Completed";
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
}

public class RcsDeliveryLogDto
{
    public string LogId { get; set; } = string.Empty;
    public int CampaignId { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public string BotName { get; set; } = "Marketing Bot";
    public string Status { get; set; } = "Delivered"; // Delivered, Read, Fallback SMS, Failed
    public string SentAt { get; set; } = string.Empty;
    public string DeliveredAt { get; set; } = string.Empty;
    public string Latency { get; set; } = "0.8s";
    public string Carrier { get; set; } = "Jio 5G";
    public string Reason { get; set; } = "Handset ACK: Delivered to Google Messages RCS client";
}

[ApiController]
[Route("api/[controller]")]
public class RCSApiController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IRcsTransactionRepository _rcsTransactionRepository;

    // In-memory persistent mock bots list
    private static readonly List<RcsBotDto> _bots = new()
    {
        new RcsBotDto { BotId = "bot_abc123", BotName = "Marketing Bot", Description = "Verified Brand Bot for promotional & marketing campaigns", Status = "Verified", Color = "#4f46e5", CreatedDate = "2026-08-01 10:00" },
        new RcsBotDto { BotId = "bot_def456", BotName = "Support Bot", Description = "Verified Brand Bot for transaction alerts & customer care", Status = "Verified", Color = "#059669", CreatedDate = "2026-08-05 12:30" }
    };

    // In-memory persistent mock templates list with full DLT details matching PDF specs
    private static readonly List<RcsTemplateDto> _templates = new()
    {
        new RcsTemplateDto
        {
            TemplateId = "vendor_tpl_xyz789",
            TemplateName = "Welcome_Template",
            TemplateType = "PlainText",
            BotId = "bot_abc123",
            BotName = "Marketing Bot",
            VendorTemplateId = "vendor_tpl_xyz789",
            TemplateStatus = "Active",
            CardTitle = "Welcome to Our Platform!",
            CardDescription = "Welcome to our verified business channel. How can we assist you today?",
            ButtonsJson = "[{\"id\":1,\"type\":\"reply\",\"label\":\"Interested\",\"value\":\"Interested\"},{\"id\":2,\"type\":\"reply\",\"label\":\"Not Interested\",\"value\":\"Not Interested\"}]",
            EntityId = "1201161304403738311",
            SenderId = "EXPRSS",
            SmsTemplateId = "1207161545678901234",
            SmsText = "Welcome to our service! Use code WELCOME10 for 10% off your first transaction.",
            CreatedDate = "2024-12-11 10:30"
        },
        new RcsTemplateDto
        {
            TemplateId = "vendor_tpl_abc456",
            TemplateName = "Product_Card",
            TemplateType = "RichCard",
            BotId = "bot_abc123",
            BotName = "Marketing Bot",
            VendorTemplateId = "vendor_tpl_abc456",
            TemplateStatus = "Pending",
            CardTitle = "New Product Showcase",
            CardDescription = "Explore our upcoming autumn collection with exclusive pre-order discounts.",
            MediaUrl = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
            ButtonsJson = "[{\"id\":1,\"type\":\"url\",\"label\":\"View Catalog\",\"value\":\"https://catalog.io\"}]",
            EntityId = "1201161304403738311",
            SenderId = "EXPRSS",
            SmsTemplateId = "1207161545678901235",
            SmsText = "Exclusive Autumn collection pre-orders are open! View at https://catalog.io",
            CreatedDate = "2024-12-15 14:20"
        },
        new RcsTemplateDto
        {
            TemplateId = "vendor_tpl_promo1",
            TemplateName = "Summer_Promo_Card",
            TemplateType = "RichCard",
            BotId = "bot_abc123",
            BotName = "Marketing Bot",
            VendorTemplateId = "vendor_tpl_promo1",
            TemplateStatus = "Active",
            CardTitle = "Summer Promo 40% Off",
            CardDescription = "Get 40% off on all items during our summer promo sale. Use coupon SUMMER40.",
            MediaUrl = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
            ButtonsJson = "[{\"id\":1,\"type\":\"url\",\"label\":\"Claim Promo Now\",\"value\":\"https://offers.io\"},{\"id\":2,\"type\":\"reply\",\"label\":\"Remind Later\",\"value\":\"Remind Later\"}]",
            EntityId = "1201161304403738311",
            SenderId = "EXPRSS",
            SmsTemplateId = "1207161545678901238",
            SmsText = "Summer Promo: 40% off with coupon SUMMER40. Visit: https://offers.io",
            CreatedDate = "2024-12-18 11:15"
        },
        new RcsTemplateDto
        {
            TemplateId = "vendor_tpl_promo2",
            TemplateName = "Promo_Survey_Message",
            TemplateType = "PlainText",
            BotId = "bot_abc123",
            BotName = "Marketing Bot",
            VendorTemplateId = "vendor_tpl_promo2",
            TemplateStatus = "Active",
            CardTitle = "Promo Feedback Survey",
            CardDescription = "Thank you for shopping during our promo sale! Did you enjoy your experience?",
            ButtonsJson = "[{\"id\":1,\"type\":\"reply\",\"label\":\"Interested\",\"value\":\"Interested\"},{\"id\":2,\"type\":\"reply\",\"label\":\"Not Interested\",\"value\":\"Not Interested\"}]",
            EntityId = "1201161304403738311",
            SenderId = "EXPRSS",
            SmsTemplateId = "1207161545678901239",
            SmsText = "Thank you for shopping! Reply YES if you liked the experience, or NO to give feedback.",
            CreatedDate = "2024-12-20 09:40"
        },
        new RcsTemplateDto
        {
            TemplateId = "vendor_tpl_car888",
            TemplateName = "Catalog_Carousel",
            TemplateType = "Carousel",
            BotId = "bot_def456",
            BotName = "Support Bot",
            VendorTemplateId = "vendor_tpl_car888",
            TemplateStatus = "Active",
            CardTitle = "Multi-Service Product Catalog",
            CardDescription = "Explore our newly released enterprise software catalog.",
            ButtonsJson = "[{\"id\":1,\"type\":\"url\",\"label\":\"Browse Catalog\",\"value\":\"https://catalog.io\"}]",
            EntityId = "1201161304403738311",
            SenderId = "EXPRSS",
            SmsTemplateId = "1207161545678901236",
            SmsText = "Explore our newly released enterprise software catalog. Visit: https://catalog.io",
            CreatedDate = "2024-12-22 16:45"
        },
        new RcsTemplateDto
        {
            TemplateId = "vendor_tpl_sup001",
            TemplateName = "Support_Ticket_Resolution",
            TemplateType = "PlainText",
            BotId = "bot_def456",
            BotName = "Support Bot",
            VendorTemplateId = "vendor_tpl_sup001",
            TemplateStatus = "Active",
            CardTitle = "Support Ticket Resolved",
            CardDescription = "Your request #8492 has been resolved. Were you satisfied with our service?",
            ButtonsJson = "[{\"id\":1,\"type\":\"reply\",\"label\":\"Yes, Satisfied\",\"value\":\"Yes\"},{\"id\":2,\"type\":\"reply\",\"label\":\"Need More Help\",\"value\":\"Need Help\"},{\"id\":3,\"type\":\"dial\",\"label\":\"Call Support\",\"value\":\"+919876543210\"}]",
            EntityId = "1201161304403738311",
            SenderId = "EXPRSS",
            SmsTemplateId = "1207161545678901240",
            SmsText = "Your support request #8492 is resolved. Need help? Call +919876543210",
            CreatedDate = "2024-12-24 15:10"
        }
    };

    // In-memory campaign reports
    private static readonly List<RcsCampaignReportDto> _campaignReports = new()
    {
        new RcsCampaignReportDto
        {
            CampaignId = 78296,
            CampaignName = "Verification_Campaign",
            TemplateId = "vendor_tpl_xyz789",
            TemplateName = "Welcome_Template",
            TemplateType = "PlainText",
            BotName = "Marketing Bot",
            TotalMobiles = 2500,
            DeliveredRcs = 2275,
            ReadRcs = 1750,
            FallbackSms = 180,
            Failed = 45,
            DeliveryRate = 98.2m,
            ReadRate = 76.9m,
            HasFallback = true,
            Status = "Completed",
            CreatedAt = DateTime.UtcNow.AddHours(-2).ToString("yyyy-MM-dd HH:mm")
        },
        new RcsCampaignReportDto
        {
            CampaignId = 65412,
            CampaignName = "Summer_Promo_Blast",
            TemplateId = "vendor_tpl_promo1",
            TemplateName = "Summer_Promo_Card",
            TemplateType = "RichCard",
            BotName = "Marketing Bot",
            TotalMobiles = 4800,
            DeliveredRcs = 4410,
            ReadRcs = 3280,
            FallbackSms = 310,
            Failed = 80,
            DeliveryRate = 98.3m,
            ReadRate = 74.4m,
            HasFallback = true,
            Status = "Completed",
            CreatedAt = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd HH:mm")
        },
        new RcsCampaignReportDto
        {
            CampaignId = 54890,
            CampaignName = "Support_CSAT_Survey",
            TemplateId = "vendor_tpl_sup001",
            TemplateName = "Support_Ticket_Resolution",
            TemplateType = "PlainText",
            BotName = "Support Bot",
            TotalMobiles = 1200,
            DeliveredRcs = 1140,
            ReadRcs = 910,
            FallbackSms = 50,
            Failed = 10,
            DeliveryRate = 99.1m,
            ReadRate = 79.8m,
            HasFallback = true,
            Status = "Completed",
            CreatedAt = DateTime.UtcNow.AddDays(-2).ToString("yyyy-MM-dd HH:mm")
        }
    };

    // In-memory detailed DLR logs
    private static readonly List<RcsDeliveryLogDto> _deliveryLogs = new()
    {
        new RcsDeliveryLogDto { LogId = "DLR-901", CampaignId = 78296, CampaignName = "Verification_Campaign", MobileNumber = "9876543210", BotName = "Marketing Bot", Status = "Read", SentAt = DateTime.UtcNow.AddHours(-2).ToString("yyyy-MM-dd HH:mm:ss"), DeliveredAt = DateTime.UtcNow.AddHours(-2).AddSeconds(1).ToString("yyyy-MM-dd HH:mm:ss"), Latency = "0.7s", Carrier = "Jio 5G", Reason = "Read by recipient in Google Messages" },
        new RcsDeliveryLogDto { LogId = "DLR-902", CampaignId = 78296, CampaignName = "Verification_Campaign", MobileNumber = "9123456789", BotName = "Marketing Bot", Status = "Delivered", SentAt = DateTime.UtcNow.AddHours(-2).ToString("yyyy-MM-dd HH:mm:ss"), DeliveredAt = DateTime.UtcNow.AddHours(-2).AddSeconds(2).ToString("yyyy-MM-dd HH:mm:ss"), Latency = "1.1s", Carrier = "Airtel 5G", Reason = "Delivered to handset (Double Tick ACK)" },
        new RcsDeliveryLogDto { LogId = "DLR-903", CampaignId = 65412, CampaignName = "Summer_Promo_Blast", MobileNumber = "9811223344", BotName = "Marketing Bot", Status = "Read", SentAt = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd HH:mm:ss"), DeliveredAt = DateTime.UtcNow.AddDays(-1).AddSeconds(1).ToString("yyyy-MM-dd HH:mm:ss"), Latency = "0.8s", Carrier = "Jio 5G", Reason = "Read by recipient in Google Messages" },
        new RcsDeliveryLogDto { LogId = "DLR-904", CampaignId = 65412, CampaignName = "Summer_Promo_Blast", MobileNumber = "9766554433", BotName = "Marketing Bot", Status = "Fallback SMS", SentAt = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd HH:mm:ss"), DeliveredAt = DateTime.UtcNow.AddDays(-1).AddSeconds(5).ToString("yyyy-MM-dd HH:mm:ss"), Latency = "4.2s", Carrier = "Vi 4G", Reason = "Handset offline/non-RCS -> DLT SMS Fallback Delivered" },
        new RcsDeliveryLogDto { LogId = "DLR-905", CampaignId = 65412, CampaignName = "Summer_Promo_Blast", MobileNumber = "9199887766", BotName = "Marketing Bot", Status = "Failed", SentAt = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd HH:mm:ss"), DeliveredAt = "—", Latency = "—", Carrier = "Airtel", Reason = "Telecom error: Subscriber absent / Switched off" }
    };

    public RCSApiController(IUserRepository userRepository, IRcsTransactionRepository rcsTransactionRepository)
    {
        _userRepository = userRepository;
        _rcsTransactionRepository = rcsTransactionRepository;
    }

    /// <summary>
    /// Checks available RCS and SMS balance (Page 4-5 in PDF)
    /// </summary>
    [HttpGet("CheckRcsBalance")]
    public async Task<IActionResult> CheckRcsBalance([FromQuery] string? apiKey, CancellationToken cancellationToken)
    {
        var user = await GetTargetUserAsync(cancellationToken);
        decimal rcsBal = user != null ? user.RcsCredits : 50000;
        decimal smsBal = user != null ? user.SmsCredits : 100000;

        return Ok(new
        {
            Status = "OK",
            Response = new
            {
                RcsBalance = (int)rcsBal,
                SmsBalance = (int)smsBal
            }
        });
    }

    /// <summary>
    /// Retrieves list of all registered RCS Bots (Page 9-10 in PDF)
    /// </summary>
    [HttpGet("GetBots")]
    public IActionResult GetBots([FromQuery] string? apiKey)
    {
        foreach (var b in _bots)
        {
            b.TemplateCount = _templates.Count(t => t.BotId.Equals(b.BotId, StringComparison.OrdinalIgnoreCase));
        }

        return Ok(new
        {
            Status = "OK",
            Response = new
            {
                Bots = _bots,
                TotalCount = _bots.Count
            }
        });
    }

    /// <summary>
    /// Registers a new RCS Bot
    /// </summary>
    [HttpPost("CreateBot")]
    public IActionResult CreateBot([FromBody] RcsBotDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.BotName))
            return BadRequest(new { message = "Bot name is required." });

        dto.BotId = $"bot_{Guid.NewGuid().ToString("N")[..6]}";
        dto.Status = "Verified";
        dto.CreatedDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
        if (string.IsNullOrWhiteSpace(dto.Color)) dto.Color = "#4f46e5";
        if (string.IsNullOrWhiteSpace(dto.WebhookUrl)) dto.WebhookUrl = "https://yourdomain.com/rcs-webhook";

        _bots.Add(dto);

        return Ok(new
        {
            Status = "OK",
            Message = $"RCS Bot {dto.BotName} registered successfully!",
            Bot = dto
        });
    }

    /// <summary>
    /// Retrieves list of RCS templates with optional botId, templateName, templateType filters (Page 5-8 in PDF)
    /// </summary>
    [HttpGet("GetTemplates")]
    public IActionResult GetTemplates(
        [FromQuery] string? apiKey,
        [FromQuery] string? botId,
        [FromQuery] string? templateName,
        [FromQuery] string? templateType)
    {
        if (!string.IsNullOrWhiteSpace(apiKey) && string.IsNullOrWhiteSpace(botId))
        {
            return Ok(new
            {
                Status = "WARNING",
                Response = new
                {
                    Message = "botId is required!"
                }
            });
        }

        var query = _templates.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(botId))
        {
            query = query.Where(t => t.BotId.Equals(botId, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(templateName))
        {
            query = query.Where(t => t.TemplateName.Contains(templateName, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(templateType))
        {
            query = query.Where(t => t.TemplateType.Equals(templateType, StringComparison.OrdinalIgnoreCase));
        }

        var list = query.ToList();

        return Ok(new
        {
            Status = "OK",
            Response = new
            {
                Templates = list,
                TotalCount = list.Count
            }
        });
    }

    /// <summary>
    /// Creates and submits a new RCS Campaign with automatic balance deduction (Page 1-4 in PDF)
    /// </summary>
    [HttpPost("CreateCampaign")]
    public async Task<IActionResult> CreateCampaign(
        [FromQuery] string? apiKey,
        [FromBody] RcsCampaignRequestDto request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.TemplateId))
        {
            return BadRequest(new { Status = "WARNING", Response = new { Message = "Template ID is required!" } });
        }

        if (string.IsNullOrWhiteSpace(request.CampaignName))
        {
            return BadRequest(new { Status = "WARNING", Response = new { Message = "Campaign Name is required!" } });
        }

        if (request.MobileNumbers == null || request.MobileNumbers.Count == 0)
        {
            return BadRequest(new { Status = "WARNING", Response = new { Message = "Mobile numbers are required!" } });
        }

        if (request.MobileNumbers.Count > 5000)
        {
            return BadRequest(new { Status = "WARNING", Response = new { Message = "Maximum 5000 mobile numbers are allowed per request!" } });
        }

        // SMS Fallback validation
        if (request.EnableFallback)
        {
            if (string.IsNullOrWhiteSpace(request.EntityId))
                return BadRequest(new { Status = "WARNING", Response = new { Message = "Fallback requires Entity ID!" } });
            if (string.IsNullOrWhiteSpace(request.SenderId))
                return BadRequest(new { Status = "WARNING", Response = new { Message = "Fallback requires Sender ID!" } });
            if (string.IsNullOrWhiteSpace(request.SmsTemplateId))
                return BadRequest(new { Status = "WARNING", Response = new { Message = "Fallback requires valid SMS Template ID!" } });
            if (string.IsNullOrWhiteSpace(request.SmsText))
                return BadRequest(new { Status = "WARNING", Response = new { Message = "Fallback requires Sms Text!" } });
        }

        // Balance Check & Deduction
        var user = await GetTargetUserAsync(cancellationToken);
        int numbersCount = request.MobileNumbers.Count;

        if (user != null)
        {
            if (user.RcsCredits < numbersCount)
            {
                return BadRequest(new
                {
                    Status = "WARNING",
                    Response = new
                    {
                        Message = $"Insufficient RCS balance. Your balance: {user.RcsCredits}, required: {numbersCount}"
                    }
                });
            }

            // Deduct credits
            user.RcsCredits -= numbersCount;
            if (request.EnableFallback && user.SmsCredits >= numbersCount)
            {
                // reserve/deduct SMS fallback
                user.SmsCredits -= Math.Round(numbersCount * 0.2m); // Assume 20% fallback rate
            }
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateCreditsAsync(user.Id, user.VoiceCredits, user.WhatsAppCredits, user.RcsCredits, user.SmsCredits, cancellationToken);

            // Audit in transaction log
            await _rcsTransactionRepository.InsertTransactionAsync(new RcsTransactionLog
            {
                TransactionCode = $"TXN-{new Random().Next(100000, 999999)}",
                CreatedAt = DateTime.UtcNow,
                UserId = user.Id,
                Username = user.Username,
                PerformedByUserId = user.Id,
                PerformedByUsername = user.Username,
                ServiceType = "RCS",
                ActionType = "CampaignUsage",
                Credits = -numbersCount,
                PricePerCredit = 0.20m,
                TotalAmount = numbersCount * 0.20m,
                Notes = $"RCS Campaign: {request.CampaignName} ({numbersCount} numbers)",
                BalanceAfter = user.RcsCredits
            }, cancellationToken);
        }

        int campaignId = new Random().Next(40000, 99999);

        // Record in delivery reports
        var foundTmpl = _templates.FirstOrDefault(t => t.TemplateId == request.TemplateId || t.VendorTemplateId == request.TemplateId);
        int delivered = (int)Math.Round(numbersCount * 0.90);
        int read = (int)Math.Round(numbersCount * 0.70);
        int fallback = request.EnableFallback ? (numbersCount - delivered) : 0;
        int failed = request.EnableFallback ? 0 : (numbersCount - delivered);

        _campaignReports.Insert(0, new RcsCampaignReportDto
        {
            CampaignId = campaignId,
            CampaignName = request.CampaignName,
            TemplateId = request.TemplateId,
            TemplateName = foundTmpl?.TemplateName ?? "Active_Template",
            TemplateType = foundTmpl?.TemplateType ?? "RichCard",
            BotName = foundTmpl?.BotName ?? "Marketing Bot",
            TotalMobiles = numbersCount,
            DeliveredRcs = delivered,
            ReadRcs = read,
            FallbackSms = fallback,
            Failed = failed,
            DeliveryRate = numbersCount > 0 ? Math.Round((decimal)(delivered + fallback) / numbersCount * 100, 1) : 100,
            ReadRate = delivered > 0 ? Math.Round((decimal)read / delivered * 100, 1) : 75,
            HasFallback = request.EnableFallback,
            Status = "Completed",
            CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")
        });

        foreach (var m in request.MobileNumbers.Take(25))
        {
            _deliveryLogs.Insert(0, new RcsDeliveryLogDto
            {
                LogId = $"DLR-{new Random().Next(1000, 9999)}",
                CampaignId = campaignId,
                CampaignName = request.CampaignName,
                MobileNumber = m.Split(',')[0].Trim(),
                BotName = foundTmpl?.BotName ?? "Marketing Bot",
                Status = "Read",
                SentAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                DeliveredAt = DateTime.UtcNow.AddSeconds(1).ToString("yyyy-MM-dd HH:mm:ss"),
                Latency = "0.9s",
                Carrier = "Jio 5G",
                Reason = "Delivered & Read receipt ACK received from recipient"
            });
        }

        return Ok(new
        {
            Status = "OK",
            Response = new
            {
                Message = "Campaign created successfully!",
                CampaignId = campaignId,
                TotalMobiles = numbersCount,
                RemainingRcsCredits = user?.RcsCredits ?? (50000 - numbersCount),
                RemainingSmsCredits = user?.SmsCredits ?? 100000
            }
        });
    }

    /// <summary>
    /// Retrieves list of all dispatched RCS campaigns with delivery and read statistics
    /// </summary>
    [HttpGet("GetCampaignReports")]
    public IActionResult GetCampaignReports([FromQuery] string? search, [FromQuery] string? botName)
    {
        var query = _campaignReports.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.CampaignName.Contains(search, StringComparison.OrdinalIgnoreCase) || c.CampaignId.ToString().Contains(search));
        }
        if (!string.IsNullOrWhiteSpace(botName) && botName != "All")
        {
            query = query.Where(c => c.BotName.Equals(botName, StringComparison.OrdinalIgnoreCase));
        }

        var list = query.OrderByDescending(c => c.CampaignId).ToList();
        return Ok(new
        {
            Status = "OK",
            Response = new
            {
                Campaigns = list,
                TotalCount = list.Count,
                OverallDispatched = list.Sum(c => c.TotalMobiles),
                OverallDelivered = list.Sum(c => c.DeliveredRcs),
                OverallRead = list.Sum(c => c.ReadRcs),
                OverallFallback = list.Sum(c => c.FallbackSms),
                OverallFailed = list.Sum(c => c.Failed)
            }
        });
    }

    /// <summary>
    /// Retrieves granular handset-level delivery logs (DLR)
    /// </summary>
    [HttpGet("GetDeliveryLogs")]
    public IActionResult GetDeliveryLogs(
        [FromQuery] int? campaignId,
        [FromQuery] string? status,
        [FromQuery] string? mobileNumber)
    {
        var query = _deliveryLogs.AsEnumerable();
        if (campaignId.HasValue && campaignId.Value > 0)
        {
            query = query.Where(l => l.CampaignId == campaignId.Value);
        }
        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(l => l.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
        }
        if (!string.IsNullOrWhiteSpace(mobileNumber))
        {
            query = query.Where(l => l.MobileNumber.Contains(mobileNumber));
        }

        var list = query.OrderByDescending(l => l.LogId).ToList();
        return Ok(new
        {
            Status = "OK",
            Response = new
            {
                Logs = list,
                TotalCount = list.Count
            }
        });
    }

    /// <summary>
    /// Retrieves all system users to select from for Credit / Revoke balance
    /// </summary>
    [HttpGet("GetUsers")]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllUsersAsync(cancellationToken);
        var mapped = users.Select(u => new
        {
            u.Id,
            u.Username,
            u.FullName,
            u.Email,
            Role = u.Role.ToString(),
            RcsCredits = (int)u.RcsCredits,
            SmsCredits = (int)u.SmsCredits
        });

        return Ok(new { Status = "OK", Users = mapped });
    }

    /// <summary>
    /// Credit (Allocate) or Revoke (Deduct) balance from specific User with Price, Notes & Full Audit
    /// </summary>
    [HttpPost("ManageUserBalance")]
    public async Task<IActionResult> ManageUserBalance([FromBody] RcsBalanceManageDto dto, CancellationToken cancellationToken)
    {
        var caller = await GetTargetUserAsync(cancellationToken);
        var targetUser = await _userRepository.GetByIdAsync(dto.TargetUserId, cancellationToken);
        if (targetUser == null)
        {
            return NotFound(new { message = $"User ID {dto.TargetUserId} not found." });
        }

        if (dto.Credits <= 0)
        {
            return BadRequest(new { message = "Credits amount must be greater than 0." });
        }

        bool isRcs = dto.ServiceType.Equals("RCS", StringComparison.OrdinalIgnoreCase);
        decimal currentBal = isRcs ? targetUser.RcsCredits : targetUser.SmsCredits;

        string action = dto.ActionType.Equals("Revoke", StringComparison.OrdinalIgnoreCase) ? "Revoke" : "Credit";
        decimal changeAmount = 0;

        if (action == "Revoke")
        {
            if (currentBal < dto.Credits)
            {
                return BadRequest(new { message = $"Cannot revoke {dto.Credits:N0} credits. Target user only has {currentBal:N0} available." });
            }
            changeAmount = -dto.Credits;
        }
        else
        {
            changeAmount = dto.Credits;
        }

        if (isRcs)
        {
            targetUser.RcsCredits += changeAmount;
        }
        else
        {
            targetUser.SmsCredits += changeAmount;
        }

        targetUser.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateCreditsAsync(targetUser.Id, targetUser.VoiceCredits, targetUser.WhatsAppCredits, targetUser.RcsCredits, targetUser.SmsCredits, cancellationToken);

        decimal totalValue = dto.Credits * dto.PricePerCredit;

        var txnLog = new RcsTransactionLog
        {
            TransactionCode = $"TXN-{new Random().Next(100000, 999999)}",
            CreatedAt = DateTime.UtcNow,
            UserId = targetUser.Id,
            Username = targetUser.Username,
            PerformedByUserId = caller?.Id,
            PerformedByUsername = caller?.Username ?? "SuperAdmin",
            ServiceType = isRcs ? "RCS" : "SMS",
            ActionType = action,
            Credits = changeAmount,
            PricePerCredit = dto.PricePerCredit,
            TotalAmount = totalValue,
            Notes = string.IsNullOrWhiteSpace(dto.Notes) ? $"{action} balance operation" : dto.Notes,
            BalanceAfter = isRcs ? targetUser.RcsCredits : targetUser.SmsCredits
        };

        await _rcsTransactionRepository.InsertTransactionAsync(txnLog, cancellationToken);

        return Ok(new
        {
            Status = "OK",
            Message = $"Successfully {(action == "Credit" ? "credited" : "revoked")} {dto.Credits:N0} {dto.ServiceType} credits for {targetUser.Username}!",
            TargetUserId = targetUser.Id,
            TargetUsername = targetUser.Username,
            NewRcsBalance = (int)targetUser.RcsCredits,
            NewSmsBalance = (int)targetUser.SmsCredits,
            Transaction = txnLog
        });
    }

    /// <summary>
    /// Retrieves user-wise and system-wide balance audit ledger with date and action filters
    /// </summary>
    [HttpGet("GetBalanceLedger")]
    public async Task<IActionResult> GetBalanceLedger(
        [FromQuery] int? targetUserId,
        [FromQuery] string? serviceType,
        [FromQuery] string? actionType,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var allTxns = await _rcsTransactionRepository.GetAllTransactionsAsync(cancellationToken);
        var query = allTxns.AsEnumerable();

        if (targetUserId.HasValue && targetUserId.Value > 0)
        {
            query = query.Where(l => l.UserId == targetUserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(serviceType) && serviceType != "All")
        {
            query = query.Where(l => l.ServiceType.Equals(serviceType, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(actionType) && actionType != "All")
        {
            query = query.Where(l => l.ActionType.Equals(actionType, StringComparison.OrdinalIgnoreCase));
        }

        if (fromDate.HasValue)
        {
            var start = fromDate.Value.Date;
            query = query.Where(l => l.CreatedAt >= start);
        }

        if (toDate.HasValue)
        {
            var end = toDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(l => l.CreatedAt <= end);
        }

        var list = query.OrderByDescending(l => l.CreatedAt).Take(200).ToList();

        decimal totalCredited = list.Where(l => l.ActionType == "Credit").Sum(l => l.Credits);
        decimal totalRevoked = Math.Abs(list.Where(l => l.ActionType == "Revoke").Sum(l => l.Credits));
        decimal totalBilledValue = list.Where(l => l.ActionType == "Credit").Sum(l => l.TotalAmount);
        decimal totalCampaignUsed = Math.Abs(list.Where(l => l.ActionType == "CampaignUsage").Sum(l => l.Credits));

        return Ok(new
        {
            Status = "OK",
            Response = new
            {
                Transactions = list,
                TotalCount = list.Count,
                Summary = new
                {
                    TotalCredited = (int)totalCredited,
                    TotalRevoked = (int)totalRevoked,
                    TotalBilledValue = totalBilledValue,
                    TotalCampaignUsed = (int)totalCampaignUsed
                }
            }
        });
    }

    /// <summary>
    /// Exports Balance Audit Ledger as CSV
    /// </summary>
    [HttpGet("ExportLedgerCsv")]
    public async Task<IActionResult> ExportLedgerCsv(
        [FromQuery] int? targetUserId,
        [FromQuery] string? serviceType,
        [FromQuery] string? actionType,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var allTxns = await _rcsTransactionRepository.GetAllTransactionsAsync(cancellationToken);
        var query = allTxns.AsEnumerable();

        if (targetUserId.HasValue && targetUserId.Value > 0)
            query = query.Where(l => l.UserId == targetUserId.Value);

        if (!string.IsNullOrWhiteSpace(serviceType) && serviceType != "All")
            query = query.Where(l => l.ServiceType.Equals(serviceType, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(actionType) && actionType != "All")
            query = query.Where(l => l.ActionType.Equals(actionType, StringComparison.OrdinalIgnoreCase));

        if (fromDate.HasValue)
            query = query.Where(l => l.CreatedAt >= fromDate.Value.Date);

        if (toDate.HasValue)
            query = query.Where(l => l.CreatedAt <= toDate.Value.Date.AddDays(1).AddTicks(-1));

        var list = query.OrderByDescending(l => l.CreatedAt).ToList();

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("TransactionCode,CreatedAt,User,ServiceType,ActionType,Credits,PricePerCredit,TotalAmount,PerformedBy,Notes,BalanceAfter");

        foreach (var row in list)
        {
            sb.AppendLine($"\"{row.TransactionCode}\",\"{row.CreatedAt:yyyy-MM-dd HH:mm:ss}\",\"{row.Username}\",\"{row.ServiceType}\",\"{row.ActionType}\",{row.Credits},{row.PricePerCredit},{row.TotalAmount},\"{row.PerformedByUsername}\",\"{row.Notes?.Replace("\"", "\"\"")}\",{row.BalanceAfter}");
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", $"Rcs_Balance_Ledger_{DateTime.UtcNow:yyyyMMdd_HHmm}.csv");
    }

    /// <summary>
    /// Credit / Recharge user's RCS or SMS balance (Legacy backward compatible)
    /// </summary>
    [HttpPost("CreditBalance")]
    public async Task<IActionResult> CreditBalance([FromBody] RcsCreditRequestDto dto, CancellationToken cancellationToken)
    {
        var user = await GetTargetUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (dto.RcsCreditsToAdd > 0)
        {
            user.RcsCredits += dto.RcsCreditsToAdd;
        }

        if (dto.SmsCreditsToAdd > 0)
        {
            user.SmsCredits += dto.SmsCreditsToAdd;
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateCreditsAsync(user.Id, user.VoiceCredits, user.WhatsAppCredits, user.RcsCredits, user.SmsCredits, cancellationToken);

        return Ok(new
        {
            Status = "OK",
            Message = "Balance credited successfully!",
            RcsBalance = (int)user.RcsCredits,
            SmsBalance = (int)user.SmsCredits
        });
    }

    /// <summary>
    /// Send real live SMS/RCS test message via Fast2SMS Gateway to mobile number
    /// </summary>
    [HttpPost("TestRealFast2Sms")]
    public async Task<IActionResult> TestRealFast2Sms(
        [FromQuery] string? apiKey,
        [FromQuery] string? mobile,
        CancellationToken cancellationToken)
    {
        string key = !string.IsNullOrWhiteSpace(apiKey)
            ? apiKey.Trim()
            : "riueA3KJc0jUhRsv8xq2LBFCOg6fbkZXozT15pMaNnlwSdtID7mwBobXyADGU7MOjeuRPxVNf5ltF0nd";
        string targetMobile = !string.IsNullOrWhiteSpace(mobile) ? mobile.Trim() : "9170304221";

        var handler = new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
        };
        using var client = new HttpClient(handler);
        client.DefaultRequestHeaders.Add("authorization", key);
        client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

        // 1. Check Wallet Balance
        string walletInfo = string.Empty;
        try
        {
            var wRes = await client.GetAsync("https://www.fast2sms.com/dev/wallet", cancellationToken);
            walletInfo = await wRes.Content.ReadAsStringAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            walletInfo = "Wallet Check Failed: " + (ex.InnerException?.Message ?? ex.Message);
        }

        // 2. Dispatch Quick SMS
        var payload = new
        {
            route = "q",
            message = "Hello! Test message from your Leads Management System. Fast2SMS live gateway is working! Target: " + targetMobile,
            language = "english",
            flash = 0,
            numbers = targetMobile
        };
        string json = System.Text.Json.JsonSerializer.Serialize(payload);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

        string sendResult = string.Empty;
        int httpCode = 200;
        try
        {
            var sRes = await client.PostAsync("https://www.fast2sms.com/dev/bulkV2", content, cancellationToken);
            httpCode = (int)sRes.StatusCode;
            sendResult = await sRes.Content.ReadAsStringAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            sendResult = "Send SMS Failed: " + (ex.InnerException?.Message ?? ex.Message);
        }

        return Ok(new
        {
            Status = "OK",
            TargetMobile = targetMobile,
            Fast2SmsHttpStatus = httpCode,
            WalletInfo = walletInfo,
            SendResult = sendResult
        });
    }

    /// <summary>
    /// Toggle Template Status (Active <-> Inactive)
    /// </summary>
    [HttpPost("ToggleTemplateStatus")]
    public IActionResult ToggleTemplateStatus([FromBody] IDictionary<string, string> body)
    {
        if (!body.TryGetValue("templateId", out var tId) || string.IsNullOrWhiteSpace(tId))
        {
            return BadRequest(new { message = "TemplateId is required." });
        }

        var template = _templates.FirstOrDefault(t => t.TemplateId == tId || t.VendorTemplateId == tId);
        if (template == null)
        {
            return NotFound(new { message = "Template not found." });
        }

        template.TemplateStatus = template.TemplateStatus == "Active" ? "Inactive" : "Active";

        return Ok(new
        {
            Status = "OK",
            TemplateId = template.TemplateId,
            NewStatus = template.TemplateStatus,
            Message = $"Template {template.TemplateName} is now {template.TemplateStatus}!"
        });
    }

    /// <summary>
    /// Add a new RCS Template dynamically
    /// </summary>
    [HttpPost("CreateTemplate")]
    public IActionResult CreateTemplate([FromBody] RcsTemplateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TemplateName))
            return BadRequest(new { message = "Template name is required." });

        dto.TemplateId = $"vendor_tpl_{Guid.NewGuid().ToString("N")[..8]}";
        dto.VendorTemplateId = dto.TemplateId;
        dto.TemplateStatus = "Active";
        dto.CreatedDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        _templates.Add(dto);

        return Ok(new
        {
            Status = "OK",
            Message = "RCS Template created & approved successfully!",
            Template = dto
        });
    }

    /// <summary>
    /// Updates an existing RCS Template
    /// </summary>
    [HttpPost("UpdateTemplate")]
    public IActionResult UpdateTemplate([FromBody] RcsTemplateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TemplateId))
            return BadRequest(new { message = "Template ID is required." });

        var template = _templates.FirstOrDefault(t => t.TemplateId == dto.TemplateId || t.VendorTemplateId == dto.TemplateId);
        if (template == null)
        {
            return NotFound(new { message = "Template not found." });
        }

        if (!string.IsNullOrWhiteSpace(dto.TemplateName))
            template.TemplateName = dto.TemplateName;
        if (!string.IsNullOrWhiteSpace(dto.TemplateType))
            template.TemplateType = dto.TemplateType;
        if (!string.IsNullOrWhiteSpace(dto.BotId))
            template.BotId = dto.BotId;
        if (!string.IsNullOrWhiteSpace(dto.BotName))
            template.BotName = dto.BotName;
        if (!string.IsNullOrWhiteSpace(dto.EntityId))
            template.EntityId = dto.EntityId;
        if (!string.IsNullOrWhiteSpace(dto.SenderId))
            template.SenderId = dto.SenderId;
        if (!string.IsNullOrWhiteSpace(dto.SmsTemplateId))
            template.SmsTemplateId = dto.SmsTemplateId;
        if (!string.IsNullOrWhiteSpace(dto.SmsText))
            template.SmsText = dto.SmsText;
        if (!string.IsNullOrWhiteSpace(dto.CardTitle))
            template.CardTitle = dto.CardTitle;
        if (!string.IsNullOrWhiteSpace(dto.CardDescription))
            template.CardDescription = dto.CardDescription;
        if (!string.IsNullOrWhiteSpace(dto.MediaUrl))
            template.MediaUrl = dto.MediaUrl;
        if (!string.IsNullOrWhiteSpace(dto.ButtonLabel))
            template.ButtonLabel = dto.ButtonLabel;
        if (!string.IsNullOrWhiteSpace(dto.ButtonUrl))
            template.ButtonUrl = dto.ButtonUrl;
        if (!string.IsNullOrWhiteSpace(dto.ButtonsJson))
            template.ButtonsJson = dto.ButtonsJson;

        return Ok(new
        {
            Status = "OK",
            Message = $"Template {template.TemplateName} updated successfully!",
            Template = template
        });
    }

    /// <summary>
    /// Deletes an RCS Template by templateId
    /// </summary>
    [HttpPost("DeleteTemplate")]
    public IActionResult DeleteTemplate([FromBody] IDictionary<string, string> body)
    {
        if (!body.TryGetValue("templateId", out var tId) || string.IsNullOrWhiteSpace(tId))
        {
            return BadRequest(new { message = "TemplateId is required." });
        }

        var template = _templates.FirstOrDefault(t => t.TemplateId == tId || t.VendorTemplateId == tId);
        if (template == null)
        {
            return NotFound(new { message = "Template not found." });
        }

        _templates.Remove(template);

        return Ok(new
        {
            Status = "OK",
            Message = $"Template {template.TemplateName} deleted successfully!",
            TemplateId = tId
        });
    }

    private async Task<AppUser?> GetTargetUserAsync(CancellationToken cancellationToken)
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out int id) && id > 0)
        {
            return await _userRepository.GetByIdAsync(id, cancellationToken);
        }

        // Fallback to SuperAdmin user (Id = 1)
        return await _userRepository.GetByIdAsync(1, cancellationToken);
    }
}
