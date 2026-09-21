using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Npgsql;
using LeadsManagement.Api.Helpers;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Repositories.Interfaces;

namespace LeadsManagement.Api.Repositories.Implementations;

public class RcsAssetRepository : IRcsAssetRepository
{
    private readonly string _connection;
    private readonly ILogger<RcsAssetRepository> _logger;
    private readonly string _storagePath;
    private readonly object _lock = new();

    private readonly ConcurrentDictionary<string, RcsBotRecord> _bots = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, RcsTemplateRecord> _templates = new(StringComparer.OrdinalIgnoreCase);

    public RcsAssetRepository(DbConnectionHelpers helpers, ILogger<RcsAssetRepository> logger)
    {
        _connection = helpers.Getdbconnection();
        _logger = logger;
        _storagePath = Path.Combine(AppContext.BaseDirectory, "rcs_assets_data.json");

        LoadLocalState();
        _ = Task.Run(() => EnsureTablesAndSyncAsync(CancellationToken.None));
    }

    private void LoadLocalState()
    {
        try
        {
            if (File.Exists(_storagePath))
            {
                var json = File.ReadAllText(_storagePath);
                var bundle = JsonSerializer.Deserialize<RcsAssetBundle>(json);
                if (bundle != null)
                {
                    if (bundle.Bots != null)
                    {
                        foreach (var b in bundle.Bots)
                        {
                            if (!string.IsNullOrWhiteSpace(b.BotId))
                                _bots[b.BotId] = b;
                        }
                    }
                    if (bundle.Templates != null)
                    {
                        foreach (var t in bundle.Templates)
                        {
                            if (!string.IsNullOrWhiteSpace(t.TemplateId))
                                _templates[t.TemplateId] = t;
                        }
                    }
                }
            }

            // Ensure the verified carrier bot exists in table storage for live testing
            if (!_bots.ContainsKey("3c4fa9a066274cd2"))
            {
                var pbgBot = new RcsBotRecord
                {
                    BotId = "3c4fa9a066274cd2",
                    BotName = "PBG INFO",
                    BrandName = "PBG INFO TECH PVT LTD",
                    MessageType = "Transactional",
                    Description = "Official Google-Verified Brand Bot for PBG Account Updates & Service Alerts",
                    Status = "Verified",
                    Color = "#0a66c2",
                    LogoUrl = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=512",
                    ContactPhone = "9876543210",
                    ContactEmail = "support@rcsflow.io",
                    WebsiteUrl = "https://rcsflow.io",
                    TermsUrl = "https://rcsflow.io/terms",
                    PrivacyUrl = "https://rcsflow.io/privacy",
                    ContactPerson = "PBG Authorized Signatory",
                    ContactDesignation = "Director - Compliance",
                    DltEntityId = "1201161304403738311",
                    CreatedDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")
                };
                _bots[pbgBot.BotId] = pbgBot;
            }

            if (!_templates.ContainsKey("YCSLPB_vg"))
            {
                var pbgTemplate = new RcsTemplateRecord
                {
                    TemplateId = "YCSLPB_vg",
                    TemplateName = "pbg_account_status_u",
                    TemplateType = "PlainText",
                    BotId = "3c4fa9a066274cd2",
                    BotName = "PBG INFO",
                    VendorTemplateId = "YCSLPB_vg",
                    TemplateStatus = "Active",
                    EntityId = "1201161304403738311",
                    SenderId = "PBGACC",
                    SmsTemplateId = "1207161545678901235",
                    SmsText = "Dear User, your PBG account status has been updated. Please log in to your dashboard to review your current details.",
                    CardTitle = "pbg_account_status_u",
                    CardDescription = "Dear User, your PBG account status has been updated. Please log in to your dashboard to review your current details.",
                    ButtonLabel = "View Status",
                    ButtonsJson = "[{\"Label\":\"View Status\",\"Type\":\"REPLY\"}]",
                    CreatedDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")
                };
                _templates[pbgTemplate.TemplateId] = pbgTemplate;
            }

            SaveLocalState();
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to load local RCS assets bundle: {Message}", ex.Message);
        }
    }

    private void SaveLocalState()
    {
        lock (_lock)
        {
            try
            {
                var bundle = new RcsAssetBundle
                {
                    Bots = _bots.Values.ToList(),
                    Templates = _templates.Values.ToList()
                };
                var json = JsonSerializer.Serialize(bundle, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_storagePath, json);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Failed to write RCS assets to local storage: {Message}", ex.Message);
            }
        }
    }

    private async Task EnsureTablesAndSyncAsync(CancellationToken ct)
    {
        try
        {
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(ct);

            const string createTablesSql = @"
                CREATE TABLE IF NOT EXISTS rcs_bots (
                    id SERIAL PRIMARY KEY,
                    bot_id VARCHAR(100) UNIQUE NOT NULL,
                    bot_name VARCHAR(200) NOT NULL,
                    message_type VARCHAR(50) DEFAULT 'Transactional',
                    brand_name VARCHAR(200),
                    logo_url TEXT,
                    description TEXT,
                    status VARCHAR(50) DEFAULT 'Verified',
                    webhook_url TEXT,
                    color VARCHAR(20) DEFAULT '#0a66c2',
                    contact_phone VARCHAR(50),
                    contact_email VARCHAR(150),
                    website_url TEXT,
                    terms_url TEXT,
                    privacy_url TEXT,
                    contact_person VARCHAR(150),
                    contact_designation VARCHAR(150),
                    dlt_entity_id VARCHAR(100),
                    gst_url TEXT,
                    pan_url TEXT,
                    banner_url TEXT,
                    user_id INT DEFAULT 1,
                    created_date VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS rcs_templates (
                    id SERIAL PRIMARY KEY,
                    template_id VARCHAR(100) UNIQUE NOT NULL,
                    template_name VARCHAR(200) NOT NULL,
                    template_type VARCHAR(50) DEFAULT 'PlainText',
                    bot_id VARCHAR(100) NOT NULL,
                    bot_name VARCHAR(200),
                    vendor_template_id VARCHAR(100),
                    template_status VARCHAR(50) DEFAULT 'Active',
                    entity_id VARCHAR(100),
                    sender_id VARCHAR(50),
                    sms_template_id VARCHAR(100),
                    sms_text TEXT,
                    card_title VARCHAR(250),
                    card_description TEXT,
                    media_url TEXT,
                    button_label VARCHAR(100),
                    button_url TEXT,
                    buttons_json TEXT,
                    cards_json TEXT,
                    user_id INT DEFAULT 1,
                    created_date VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );";

            await using var cmd = new NpgsqlCommand(createTablesSql, con);
            await cmd.ExecuteNonQueryAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("PostgreSQL table init skipped (using local persistence): {Message}", ex.Message);
        }
    }

    // --- Bot Management ---

    public Task<List<RcsBotRecord>> GetAllBotsAsync(int? userId = null, CancellationToken cancellationToken = default)
    {
        var query = _bots.Values.AsEnumerable();
        if (userId.HasValue && userId.Value > 1)
        {
            query = query.Where(b => b.UserId == userId.Value);
        }
        return Task.FromResult(query.OrderByDescending(b => b.CreatedAt).ToList());
    }

    public Task<RcsBotRecord?> GetBotByIdAsync(string botId, CancellationToken cancellationToken = default)
    {
        _bots.TryGetValue(botId, out var bot);
        return Task.FromResult(bot);
    }

    public async Task<RcsBotRecord> SaveBotAsync(RcsBotRecord bot, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(bot.BotId))
        {
            bot.BotId = Guid.NewGuid().ToString("N")[..16];
        }

        bot.UpdatedAt = DateTime.UtcNow;
        _bots[bot.BotId] = bot;
        SaveLocalState();

        try
        {
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);

            const string sql = @"
                INSERT INTO rcs_bots (
                    bot_id, bot_name, message_type, brand_name, logo_url, description, status,
                    webhook_url, color, contact_phone, contact_email, website_url, terms_url,
                    privacy_url, contact_person, contact_designation, dlt_entity_id, gst_url,
                    pan_url, banner_url, user_id, created_date, updated_at
                ) VALUES (
                    @bot_id, @bot_name, @message_type, @brand_name, @logo_url, @description, @status,
                    @webhook_url, @color, @contact_phone, @contact_email, @website_url, @terms_url,
                    @privacy_url, @contact_person, @contact_designation, @dlt_entity_id, @gst_url,
                    @pan_url, @banner_url, @user_id, @created_date, CURRENT_TIMESTAMP
                )
                ON CONFLICT (bot_id) DO UPDATE SET
                    bot_name = EXCLUDED.bot_name,
                    brand_name = EXCLUDED.brand_name,
                    description = EXCLUDED.description,
                    webhook_url = EXCLUDED.webhook_url,
                    color = EXCLUDED.color,
                    contact_phone = EXCLUDED.contact_phone,
                    contact_email = EXCLUDED.contact_email,
                    website_url = EXCLUDED.website_url,
                    status = EXCLUDED.status,
                    updated_at = CURRENT_TIMESTAMP;";

            await using var cmd = new NpgsqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@bot_id", bot.BotId);
            cmd.Parameters.AddWithValue("@bot_name", bot.BotName ?? string.Empty);
            cmd.Parameters.AddWithValue("@message_type", bot.MessageType ?? "Transactional");
            cmd.Parameters.AddWithValue("@brand_name", (object?)bot.BrandName ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@logo_url", (object?)bot.LogoUrl ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@description", bot.Description ?? string.Empty);
            cmd.Parameters.AddWithValue("@status", bot.Status ?? "Verified");
            cmd.Parameters.AddWithValue("@webhook_url", bot.WebhookUrl ?? string.Empty);
            cmd.Parameters.AddWithValue("@color", bot.Color ?? "#0a66c2");
            cmd.Parameters.AddWithValue("@contact_phone", (object?)bot.ContactPhone ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@contact_email", (object?)bot.ContactEmail ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@website_url", (object?)bot.WebsiteUrl ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@terms_url", (object?)bot.TermsUrl ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@privacy_url", (object?)bot.PrivacyUrl ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@contact_person", (object?)bot.ContactPerson ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@contact_designation", (object?)bot.ContactDesignation ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@dlt_entity_id", (object?)bot.DltEntityId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@gst_url", (object?)bot.GstUrl ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@pan_url", (object?)bot.PanUrl ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@banner_url", (object?)bot.BannerUrl ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@user_id", bot.UserId);
            cmd.Parameters.AddWithValue("@created_date", bot.CreatedDate ?? DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm"));

            await cmd.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Postgres bot write failed (fallback to in-memory/JSON): {Message}", ex.Message);
        }

        return bot;
    }

    public Task<bool> UpdateBotStatusAsync(string botId, string status, string? reason = null, CancellationToken cancellationToken = default)
    {
        if (_bots.TryGetValue(botId, out var bot))
        {
            bot.Status = status;
            bot.UpdatedAt = DateTime.UtcNow;
            SaveLocalState();
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public Task<bool> DeleteBotAsync(string botId, CancellationToken cancellationToken = default)
    {
        var removed = _bots.TryRemove(botId, out _);
        if (removed) SaveLocalState();
        return Task.FromResult(removed);
    }

    // --- Template Management ---

    public Task<List<RcsTemplateRecord>> GetAllTemplatesAsync(int? userId = null, string? botId = null, CancellationToken cancellationToken = default)
    {
        var query = _templates.Values.AsEnumerable();
        if (userId.HasValue && userId.Value > 1)
        {
            query = query.Where(t => t.UserId == userId.Value);
        }
        if (!string.IsNullOrWhiteSpace(botId))
        {
            query = query.Where(t => t.BotId.Equals(botId, StringComparison.OrdinalIgnoreCase));
        }
        return Task.FromResult(query.OrderByDescending(t => t.CreatedAt).ToList());
    }

    public Task<RcsTemplateRecord?> GetTemplateByIdAsync(string templateId, CancellationToken cancellationToken = default)
    {
        _templates.TryGetValue(templateId, out var t);
        return Task.FromResult(t);
    }

    public async Task<RcsTemplateRecord> SaveTemplateAsync(RcsTemplateRecord template, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(template.TemplateId))
        {
            template.TemplateId = "tmpl_" + Guid.NewGuid().ToString("N")[..8];
        }

        template.UpdatedAt = DateTime.UtcNow;
        _templates[template.TemplateId] = template;
        SaveLocalState();

        try
        {
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);

            const string sql = @"
                INSERT INTO rcs_templates (
                    template_id, template_name, template_type, bot_id, bot_name,
                    vendor_template_id, template_status, entity_id, sender_id, sms_template_id,
                    sms_text, card_title, card_description, media_url, button_label,
                    button_url, buttons_json, cards_json, user_id, created_date, updated_at
                ) VALUES (
                    @template_id, @template_name, @template_type, @bot_id, @bot_name,
                    @vendor_template_id, @template_status, @entity_id, @sender_id, @sms_template_id,
                    @sms_text, @card_title, @card_description, @media_url, @button_label,
                    @button_url, @buttons_json, @cards_json, @user_id, @created_date, CURRENT_TIMESTAMP
                )
                ON CONFLICT (template_id) DO UPDATE SET
                    template_name = EXCLUDED.template_name,
                    template_status = EXCLUDED.template_status,
                    card_title = EXCLUDED.card_title,
                    card_description = EXCLUDED.card_description,
                    media_url = EXCLUDED.media_url,
                    button_label = EXCLUDED.button_label,
                    button_url = EXCLUDED.button_url,
                    buttons_json = EXCLUDED.buttons_json,
                    cards_json = EXCLUDED.cards_json,
                    updated_at = CURRENT_TIMESTAMP;";

            await using var cmd = new NpgsqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@template_id", template.TemplateId);
            cmd.Parameters.AddWithValue("@template_name", template.TemplateName ?? string.Empty);
            cmd.Parameters.AddWithValue("@template_type", template.TemplateType ?? "PlainText");
            cmd.Parameters.AddWithValue("@bot_id", template.BotId ?? string.Empty);
            cmd.Parameters.AddWithValue("@bot_name", (object?)template.BotName ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@vendor_template_id", (object?)template.VendorTemplateId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@template_status", template.TemplateStatus ?? "Active");
            cmd.Parameters.AddWithValue("@entity_id", (object?)template.EntityId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@sender_id", (object?)template.SenderId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@sms_template_id", (object?)template.SmsTemplateId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@sms_text", (object?)template.SmsText ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@card_title", (object?)template.CardTitle ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@card_description", (object?)template.CardDescription ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@media_url", (object?)template.MediaUrl ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@button_label", (object?)template.ButtonLabel ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@button_url", (object?)template.ButtonUrl ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@buttons_json", (object?)template.ButtonsJson ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@cards_json", (object?)template.CardsJson ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@user_id", template.UserId);
            cmd.Parameters.AddWithValue("@created_date", template.CreatedDate ?? DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm"));

            await cmd.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Postgres template write failed (fallback to in-memory/JSON): {Message}", ex.Message);
        }

        return template;
    }

    public Task<bool> UpdateTemplateStatusAsync(string templateId, string status, string? reason = null, CancellationToken cancellationToken = default)
    {
        if (_templates.TryGetValue(templateId, out var t))
        {
            t.TemplateStatus = status;
            t.UpdatedAt = DateTime.UtcNow;
            SaveLocalState();
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public Task<bool> DeleteTemplateAsync(string templateId, CancellationToken cancellationToken = default)
    {
        var removed = _templates.TryRemove(templateId, out _);
        if (removed) SaveLocalState();
        return Task.FromResult(removed);
    }

    private class RcsAssetBundle
    {
        public List<RcsBotRecord> Bots { get; set; } = new();
        public List<RcsTemplateRecord> Templates { get; set; } = new();
    }
}
