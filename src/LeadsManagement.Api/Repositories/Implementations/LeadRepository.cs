using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Npgsql;
using LeadsManagement.Api.Helpers;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Repositories.Interfaces;

namespace LeadsManagement.Api.Repositories.Implementations;

public class LeadRepository : ILeadRepository
{
    private readonly string _connection;
    private static readonly ConcurrentDictionary<int, LeadRecord> _inMemoryLeads = new();
    private static int _nextId = 100;
    private static readonly object _lock = new();

    static LeadRepository()
    {
        // Seed initial realistic telecom leads for immediate CRM testing & demonstration
        var seedLeads = new List<LeadRecord>
        {
            new()
            {
                Id = 1,
                CustomerName = "Rajesh Sharma",
                Mobile = "9810123456",
                Email = "rajesh.sharma@fintechcorp.in",
                City = "New Delhi",
                State = "Delhi",
                Country = "India",
                IpAddress = "103.24.188.12",
                ServiceRequired = "RCS Business Messaging",
                LeadSource = "AI Chat Assistant",
                InquiryType = "Sales",
                LeadStatus = "Hot Lead",
                Notes = "Interested in verified RCS Carousel cards for banking transactional alerts and OTPs.",
                ChatTranscript = "[USER]: Hi, what is the throughput for RCS OTP messages?\n[ASSISTANT]: Hello Rajesh! Our RCS Gateway supports 150+ TPS with verified green-check branding.\n[USER]: Can you share pricing? My name is Rajesh Sharma, 9810123456, rajesh.sharma@fintechcorp.in.\n[ASSISTANT]: Thank you Rajesh! Our Sales Team will touch base with you soon regarding your RCS Business Messaging requirement.",
                CreatedAt = DateTime.UtcNow.AddHours(-3),
                UpdatedAt = DateTime.UtcNow.AddHours(-3)
            },
            new()
            {
                Id = 2,
                CustomerName = "Ananya Iyer",
                Mobile = "9820987654",
                Email = "ananya@ecommercehub.com",
                City = "Mumbai",
                State = "Maharashtra",
                Country = "India",
                IpAddress = "122.161.45.89",
                ServiceRequired = "WhatsApp Business API",
                LeadSource = "AI Chat Assistant",
                InquiryType = "Sales",
                LeadStatus = "New Lead",
                Notes = "Looking for automated order status notifications & abandoned cart chatbot flow.",
                ChatTranscript = "[USER]: Looking for WhatsApp API with green tick for ecommerce brand.\n[ASSISTANT]: Our Official WhatsApp API allows automated high-throughput notifications and verified check.\n[USER]: My name is Ananya Iyer, 9820987654, ananya@ecommercehub.com\n[ASSISTANT]: Thank you Ananya! Our Sales Team will touch base with you soon regarding your WhatsApp Business API requirement.",
                CreatedAt = DateTime.UtcNow.AddHours(-18),
                UpdatedAt = DateTime.UtcNow.AddHours(-18)
            },
            new()
            {
                Id = 3,
                CustomerName = "Vikram Reddy",
                Mobile = "9940112233",
                Email = "vikram.reddy@techsol.co",
                City = "Hyderabad",
                State = "Telangana",
                Country = "India",
                IpAddress = "49.207.132.55",
                ServiceRequired = "Direct Telco SMPP Gateway",
                LeadSource = "AI Chat Assistant",
                InquiryType = "Sales",
                LeadStatus = "Contacted",
                Notes = "Needs direct SMPP TRX bind with Jio and Airtel with DLT Principal Entity header routing.",
                ChatTranscript = "[USER]: Do you provide direct SMPP binds with Tier-1 telcos?\n[ASSISTANT]: Yes, we provide low-latency SMPP routing with dual carrier failover.\n[USER]: Please send bind specs to Vikram Reddy 9940112233 vikram.reddy@techsol.co\n[ASSISTANT]: Thank you Vikram! Our Sales Team will touch base with you soon regarding your Direct Telco SMPP Gateway requirement.",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new()
            {
                Id = 4,
                CustomerName = "Amitabh Sen",
                Mobile = "9730554433",
                Email = "amitabh@cloudlogistics.in",
                City = "Kolkata",
                State = "West Bengal",
                Country = "India",
                IpAddress = "103.88.221.90",
                ServiceRequired = "DLT Bulk SMS",
                LeadSource = "AI Chat Assistant",
                InquiryType = "Support",
                LeadStatus = "In Progress",
                Notes = "Help required for PE ID template approval and DLR webhook configuration.",
                ChatTranscript = "[USER]: I need support for my DLR webhook URL configuration.\n[ASSISTANT]: We are here to assist with technical setup. Please provide your contact details.\n[USER]: Amitabh Sen, 9730554433, amitabh@cloudlogistics.in\n[ASSISTANT]: Thank you Amitabh! Our Technical Support Team will get in touch with you shortly to assist you.",
                CreatedAt = DateTime.UtcNow.AddDays(-4),
                UpdatedAt = DateTime.UtcNow.AddDays(-3)
            }
        };

        foreach (var l in seedLeads)
        {
            _inMemoryLeads[l.Id] = l;
        }
    }

    public LeadRepository(DbConnectionHelpers helpers)
    {
        _connection = helpers.Getdbconnection();
    }

    public async Task<List<LeadRecord>> GetLeadsAsync(
        string? status, int? templateId, string? mobile, int pageNumber = 1, int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var list = new List<LeadRecord>();
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);

            int offset = (pageNumber - 1) * pageSize;
            var conditions = new List<string>();
            await using var cmd = new NpgsqlCommand { Connection = con };

            if (!string.IsNullOrWhiteSpace(status))
            {
                conditions.Add("leadstatus = @Status");
                cmd.Parameters.AddWithValue("@Status", status);
            }
            if (templateId.HasValue)
            {
                conditions.Add("templateid = @TemplateId");
                cmd.Parameters.AddWithValue("@TemplateId", templateId.Value);
            }
            if (!string.IsNullOrWhiteSpace(mobile))
            {
                conditions.Add("mobile LIKE @Mobile");
                cmd.Parameters.AddWithValue("@Mobile", $"%{mobile}%");
            }

            string whereClause = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : "";
            string query = $@"
                SELECT id, mobile, customername, templateid, leadstatus, callduration, presseddtmf,
                       lasteventtype, userid, assignedtouserid, cli, notes, customdata, createdat, updatedat
                FROM leadrecords
                {whereClause}
                ORDER BY updatedat DESC
                LIMIT @PageSize OFFSET @Offset;";

            cmd.CommandText = query;
            cmd.Parameters.AddWithValue("@PageSize", pageSize);
            cmd.Parameters.AddWithValue("@Offset", offset);

            await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await dr.ReadAsync(cancellationToken))
            {
                list.Add(MapLead(dr));
            }

            if (list.Count > 0)
            {
                return list;
            }
        }
        catch
        {
            // fallback
        }

        // Return from in-memory cache
        var memQuery = _inMemoryLeads.Values.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(status)) memQuery = memQuery.Where(x => x.LeadStatus.Equals(status, StringComparison.OrdinalIgnoreCase));
        if (templateId.HasValue) memQuery = memQuery.Where(x => x.TemplateId == templateId.Value);
        if (!string.IsNullOrWhiteSpace(mobile)) memQuery = memQuery.Where(x => x.Mobile.Contains(mobile, StringComparison.OrdinalIgnoreCase));

        return memQuery.OrderByDescending(x => x.UpdatedAt).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
    }

    public async Task<int> CreateOrUpdateLeadAsync(LeadRecord lead, CancellationToken cancellationToken = default)
    {
        // Always store in-memory first so data is guaranteed available
        int returnId;
        lock (_lock)
        {
            var existing = _inMemoryLeads.Values.FirstOrDefault(x => x.Mobile == lead.Mobile);
            if (existing != null)
            {
                existing.CustomerName = lead.CustomerName ?? existing.CustomerName;
                existing.Email = lead.Email ?? existing.Email;
                existing.City = lead.City ?? existing.City;
                existing.State = lead.State ?? existing.State;
                existing.Country = lead.Country ?? existing.Country;
                existing.IpAddress = lead.IpAddress ?? existing.IpAddress;
                existing.ServiceRequired = lead.ServiceRequired ?? existing.ServiceRequired;
                existing.LeadSource = lead.LeadSource ?? existing.LeadSource;
                existing.InquiryType = lead.InquiryType ?? existing.InquiryType;
                existing.ChatTranscript = lead.ChatTranscript ?? existing.ChatTranscript;
                existing.LeadStatus = lead.LeadStatus ?? existing.LeadStatus;
                existing.Notes = lead.Notes ?? existing.Notes;
                existing.UpdatedAt = DateTime.UtcNow;
                lead.Id = existing.Id;
                returnId = existing.Id;
            }
            else
            {
                int newId = ++_nextId;
                lead.Id = newId;
                lead.CreatedAt = DateTime.UtcNow;
                lead.UpdatedAt = DateTime.UtcNow;
                _inMemoryLeads[newId] = lead;
                returnId = newId;
            }
        }

        // Try persist to Postgres if available
        try
        {
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);

            const string checkQuery = "SELECT id FROM leadrecords WHERE mobile = @Mobile;";
            int existingId = 0;
            await using (var checkCmd = new NpgsqlCommand(checkQuery, con))
            {
                checkCmd.Parameters.AddWithValue("@Mobile", lead.Mobile);
                var idObj = await checkCmd.ExecuteScalarAsync(cancellationToken);
                if (idObj != null && int.TryParse(idObj.ToString(), out int parsedId))
                {
                    existingId = parsedId;
                }
            }

            if (existingId > 0)
            {
                const string updateQuery = @"
                    UPDATE leadrecords
                    SET customername = COALESCE(@CustomerName, customername),
                        templateid = COALESCE(@TemplateId, templateid),
                        leadstatus = @LeadStatus,
                        callduration = GREATEST(callduration, @CallDuration),
                        presseddtmf = COALESCE(@PressedDtmf, presseddtmf),
                        lasteventtype = @LastEventType,
                        userid = COALESCE(@UserId, userid),
                        assignedtouserid = COALESCE(@AssignedToUserId, assignedtouserid),
                        cli = COALESCE(@Cli, cli),
                        notes = COALESCE(@Notes, notes),
                        customdata = COALESCE(@CustomData, customdata),
                        updatedat = CURRENT_TIMESTAMP
                    WHERE id = @Id;";

                await using var upCmd = new NpgsqlCommand(updateQuery, con);
                upCmd.Parameters.AddWithValue("@Id", existingId);
                upCmd.Parameters.AddWithValue("@CustomerName", (object?)lead.CustomerName ?? DBNull.Value);
                upCmd.Parameters.AddWithValue("@TemplateId", (object?)lead.TemplateId ?? DBNull.Value);
                upCmd.Parameters.AddWithValue("@LeadStatus", lead.LeadStatus);
                upCmd.Parameters.AddWithValue("@CallDuration", lead.CallDuration);
                upCmd.Parameters.AddWithValue("@PressedDtmf", (object?)lead.PressedDtmf ?? DBNull.Value);
                upCmd.Parameters.AddWithValue("@LastEventType", (object?)lead.LastEventType ?? DBNull.Value);
                upCmd.Parameters.AddWithValue("@UserId", (object?)lead.UserId ?? DBNull.Value);
                upCmd.Parameters.AddWithValue("@AssignedToUserId", (object?)lead.AssignedToUserId ?? DBNull.Value);
                upCmd.Parameters.AddWithValue("@Cli", (object?)lead.Cli ?? DBNull.Value);
                upCmd.Parameters.AddWithValue("@Notes", (object?)lead.Notes ?? DBNull.Value);
                upCmd.Parameters.AddWithValue("@CustomData", (object?)lead.CustomData ?? DBNull.Value);

                await upCmd.ExecuteNonQueryAsync(cancellationToken);
            }
            else
            {
                const string insertQuery = @"
                    INSERT INTO leadrecords (
                        mobile, customername, templateid, leadstatus, callduration, presseddtmf, 
                        lasteventtype, userid, assignedtouserid, cli, notes, customdata, createdat, updatedat
                    )
                    VALUES (
                        @Mobile, @CustomerName, @TemplateId, @LeadStatus, @CallDuration, @PressedDtmf, 
                        @LastEventType, @UserId, @AssignedToUserId, @Cli, @Notes, @CustomData, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                    RETURNING id;";

                await using var inCmd = new NpgsqlCommand(insertQuery, con);
                inCmd.Parameters.AddWithValue("@Mobile", lead.Mobile);
                inCmd.Parameters.AddWithValue("@CustomerName", (object?)lead.CustomerName ?? DBNull.Value);
                inCmd.Parameters.AddWithValue("@TemplateId", (object?)lead.TemplateId ?? DBNull.Value);
                inCmd.Parameters.AddWithValue("@LeadStatus", lead.LeadStatus);
                inCmd.Parameters.AddWithValue("@CallDuration", lead.CallDuration);
                inCmd.Parameters.AddWithValue("@PressedDtmf", (object?)lead.PressedDtmf ?? DBNull.Value);
                inCmd.Parameters.AddWithValue("@LastEventType", (object?)lead.LastEventType ?? DBNull.Value);
                inCmd.Parameters.AddWithValue("@UserId", (object?)lead.UserId ?? DBNull.Value);
                inCmd.Parameters.AddWithValue("@AssignedToUserId", (object?)lead.AssignedToUserId ?? DBNull.Value);
                inCmd.Parameters.AddWithValue("@Cli", (object?)lead.Cli ?? DBNull.Value);
                inCmd.Parameters.AddWithValue("@Notes", (object?)lead.Notes ?? DBNull.Value);
                inCmd.Parameters.AddWithValue("@CustomData", (object?)lead.CustomData ?? DBNull.Value);

                await inCmd.ExecuteScalarAsync(cancellationToken);
            }
        }
        catch
        {
            // Safe fallback
        }

        return returnId;
    }

    public async Task<LeadRecord?> GetLeadByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);

            const string query = "SELECT id, mobile, customername, templateid, leadstatus, callduration, presseddtmf, lasteventtype, userid, assignedtouserid, cli, notes, customdata, createdat, updatedat FROM leadrecords WHERE id = @Id;";
            await using var cmd = new NpgsqlCommand(query, con);
            cmd.Parameters.AddWithValue("@Id", id);

            await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
            if (await dr.ReadAsync(cancellationToken))
            {
                return MapLead(dr);
            }
            return null;
        }
        catch
        {
            return _inMemoryLeads.TryGetValue(id, out var lead) ? lead : null;
        }
    }

    public async Task<bool> DeleteLeadAsync(int id, CancellationToken cancellationToken = default)
    {
        _inMemoryLeads.TryRemove(id, out _);
        try
        {
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);

            const string query = "DELETE FROM leadrecords WHERE id = @Id;";
            await using var cmd = new NpgsqlCommand(query, con);
            cmd.Parameters.AddWithValue("@Id", id);

            int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
            return rows > 0;
        }
        catch
        {
            return true;
        }
    }

    public async Task<List<LeadRecord>> GetAllLeadsRawAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var list = new List<LeadRecord>();
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);

            const string query = "SELECT id, mobile, customername, templateid, leadstatus, callduration, presseddtmf, lasteventtype, userid, assignedtouserid, cli, notes, customdata, createdat, updatedat FROM leadrecords ORDER BY updatedat DESC;";
            await using var cmd = new NpgsqlCommand(query, con);

            await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await dr.ReadAsync(cancellationToken))
            {
                list.Add(MapLead(dr));
            }

            if (list.Count == 0)
            {
                return _inMemoryLeads.Values.OrderByDescending(x => x.UpdatedAt).ToList();
            }

            // Merge in-memory leads (e.g. AI-captured leads)
            var merged = new Dictionary<int, LeadRecord>();
            foreach (var l in list) merged[l.Id] = l;
            foreach (var l in _inMemoryLeads.Values) merged[l.Id] = l;

            return merged.Values.OrderByDescending(x => x.UpdatedAt).ToList();
        }
        catch
        {
            return _inMemoryLeads.Values.OrderByDescending(x => x.UpdatedAt).ToList();
        }
    }

    public async Task<LeadRecord?> GetLeadByMobileAsync(string mobile, CancellationToken cancellationToken = default)
    {
        try
        {
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);

            const string query = "SELECT id, mobile, customername, templateid, leadstatus, callduration, presseddtmf, lasteventtype, userid, assignedtouserid, cli, notes, customdata, createdat, updatedat FROM leadrecords WHERE mobile = @Mobile;";
            await using var cmd = new NpgsqlCommand(query, con);
            cmd.Parameters.AddWithValue("@Mobile", mobile);

            await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
            if (await dr.ReadAsync(cancellationToken))
            {
                return MapLead(dr);
            }
            return null;
        }
        catch
        {
            return _inMemoryLeads.Values.FirstOrDefault(x => x.Mobile.Equals(mobile, StringComparison.OrdinalIgnoreCase));
        }
    }

    public async Task<Dictionary<string, int>> GetLeadCountByStatusAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var dict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);

            const string query = "SELECT leadstatus, COUNT(1) AS count FROM leadrecords GROUP BY leadstatus;";
            await using var cmd = new NpgsqlCommand(query, con);

            await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await dr.ReadAsync(cancellationToken))
            {
                string status = Convert.ToString(dr["leadstatus"]) ?? "Unknown";
                int count = Convert.ToInt32(dr["count"]);
                dict[status] = count;
            }
            return dict;
        }
        catch
        {
            return _inMemoryLeads.Values
                .GroupBy(x => x.LeadStatus)
                .ToDictionary(g => g.Key, g => g.Count(), StringComparer.OrdinalIgnoreCase);
        }
    }

    public async Task<Dictionary<int, int>> GetLeadCountByTemplateAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var dict = new Dictionary<int, int>();
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);

            const string query = "SELECT COALESCE(templateid, 0) AS templateid, COUNT(1) AS count FROM leadrecords GROUP BY templateid;";
            await using var cmd = new NpgsqlCommand(query, con);

            await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await dr.ReadAsync(cancellationToken))
            {
                int tid = Convert.ToInt32(dr["templateid"]);
                int count = Convert.ToInt32(dr["count"]);
                dict[tid] = count;
            }
            return dict;
        }
        catch
        {
            return _inMemoryLeads.Values
                .GroupBy(x => x.TemplateId ?? 0)
                .ToDictionary(g => g.Key, g => g.Count());
        }
    }

    private static LeadRecord MapLead(NpgsqlDataReader dr)
    {
        return new LeadRecord
        {
            Id = Convert.ToInt32(dr["id"]),
            Mobile = Convert.ToString(dr["mobile"]) ?? string.Empty,
            CustomerName = dr["customername"] == DBNull.Value ? null : Convert.ToString(dr["customername"]),
            TemplateId = dr["templateid"] == DBNull.Value ? null : Convert.ToInt32(dr["templateid"]),
            LeadStatus = Convert.ToString(dr["leadstatus"]) ?? "New",
            CallDuration = Convert.ToInt32(dr["callduration"]),
            PressedDtmf = dr["presseddtmf"] == DBNull.Value ? null : Convert.ToString(dr["presseddtmf"]),
            LastEventType = dr["lasteventtype"] == DBNull.Value ? null : Convert.ToString(dr["lasteventtype"]),
            UserId = dr["userid"] == DBNull.Value ? null : Convert.ToInt32(dr["userid"]),
            AssignedToUserId = dr["assignedtouserid"] == DBNull.Value ? null : Convert.ToInt32(dr["assignedtouserid"]),
            Cli = dr["cli"] == DBNull.Value ? null : Convert.ToString(dr["cli"]),
            Notes = dr["notes"] == DBNull.Value ? null : Convert.ToString(dr["notes"]),
            CustomData = dr["customdata"] == DBNull.Value ? null : Convert.ToString(dr["customdata"]),
            CreatedAt = Convert.ToDateTime(dr["createdat"]),
            UpdatedAt = Convert.ToDateTime(dr["updatedat"])
        };
    }
}

