using System;
using System.Collections.Generic;
using System.Data;
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

    public LeadRepository(DbConnectionHelpers helpers)
    {
        _connection = helpers.Getdbconnection();
    }

    public async Task<List<LeadRecord>> GetLeadsAsync(
        string? status, int? templateId, string? mobile, int pageNumber = 1, int pageSize = 50,
        CancellationToken cancellationToken = default)
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
        return list;
    }

    public async Task<int> CreateOrUpdateLeadAsync(LeadRecord lead, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        // Check if lead exists for this mobile
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
            // Update existing
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
            return existingId;
        }
        else
        {
            // Insert new
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

            var result = await inCmd.ExecuteScalarAsync(cancellationToken);
            return result != null && int.TryParse(result.ToString(), out int newId) ? newId : 0;
        }
    }

    public async Task<LeadRecord?> GetLeadByIdAsync(int id, CancellationToken cancellationToken = default)
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

    public async Task<bool> DeleteLeadAsync(int id, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = "DELETE FROM leadrecords WHERE id = @Id;";
        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", id);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<List<LeadRecord>> GetAllLeadsRawAsync(CancellationToken cancellationToken = default)
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
        return list;
    }

    public async Task<LeadRecord?> GetLeadByMobileAsync(string mobile, CancellationToken cancellationToken = default)
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

    public async Task<Dictionary<string, int>> GetLeadCountByStatusAsync(CancellationToken cancellationToken = default)
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

    public async Task<Dictionary<int, int>> GetLeadCountByTemplateAsync(CancellationToken cancellationToken = default)
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
