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

public class WebhookLogRepository : IWebhookLogRepository
{
    private readonly string _connection;

    public WebhookLogRepository(DbConnectionHelpers helpers)
    {
        _connection = helpers.Getdbconnection();
    }

    public async Task<int> InsertWebhookLogAsync(WebhookLog log, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            INSERT INTO webhooklogs (
                mobile, templateid, eventtype, pressedkey, duration, 
                computedleadstatus, rawpayload, receivedat, issuccess, errormessage
            )
            VALUES (
                @Mobile, @TemplateId, @EventType, @PressedKey, @Duration, 
                @ComputedLeadStatus, @RawPayload, CURRENT_TIMESTAMP, @IsSuccess, @ErrorMessage
            )
            RETURNING id;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Mobile", (object?)log.Mobile ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@TemplateId", (object?)log.TemplateId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@EventType", (object?)log.EventType ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PressedKey", (object?)log.PressedKey ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Duration", log.Duration);
        cmd.Parameters.AddWithValue("@ComputedLeadStatus", (object?)log.ComputedLeadStatus ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@RawPayload", (object?)log.RawPayload ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@IsSuccess", log.IsSuccess);
        cmd.Parameters.AddWithValue("@ErrorMessage", (object?)log.ErrorMessage ?? DBNull.Value);

        var result = await cmd.ExecuteScalarAsync(cancellationToken);
        return result != null && int.TryParse(result.ToString(), out int id) ? id : 0;
    }

    public async Task<List<WebhookLog>> GetRecentLogsAsync(int limit = 100, CancellationToken cancellationToken = default)
    {
        var list = new List<WebhookLog>();
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, mobile, templateid, eventtype, pressedkey, duration, 
                   computedleadstatus, rawpayload, receivedat, issuccess, errormessage
            FROM webhooklogs
            ORDER BY receivedat DESC
            LIMIT @Limit;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Limit", limit);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(new WebhookLog
            {
                Id = Convert.ToInt32(dr["id"]),
                Mobile = dr["mobile"] == DBNull.Value ? null : Convert.ToString(dr["mobile"]),
                TemplateId = dr["templateid"] == DBNull.Value ? null : Convert.ToInt32(dr["templateid"]),
                EventType = dr["eventtype"] == DBNull.Value ? null : Convert.ToString(dr["eventtype"]),
                PressedKey = dr["pressedkey"] == DBNull.Value ? null : Convert.ToString(dr["pressedkey"]),
                Duration = Convert.ToInt32(dr["duration"]),
                ComputedLeadStatus = dr["computedleadstatus"] == DBNull.Value ? null : Convert.ToString(dr["computedleadstatus"]),
                RawPayload = dr["rawpayload"] == DBNull.Value ? null : Convert.ToString(dr["rawpayload"]),
                ReceivedAt = Convert.ToDateTime(dr["receivedat"]),
                IsSuccess = Convert.ToBoolean(dr["issuccess"]),
                ErrorMessage = dr["errormessage"] == DBNull.Value ? null : Convert.ToString(dr["errormessage"])
            });
        }
        return list;
    }

    public async Task<List<WebhookLog>> GetLogsByMobileAsync(string mobile, CancellationToken cancellationToken = default)
    {
        var list = new List<WebhookLog>();
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, mobile, templateid, eventtype, pressedkey, duration, 
                   computedleadstatus, rawpayload, receivedat, issuccess, errormessage
            FROM webhooklogs
            WHERE mobile = @Mobile
            ORDER BY receivedat DESC;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Mobile", mobile);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(new WebhookLog
            {
                Id = Convert.ToInt32(dr["id"]),
                Mobile = dr["mobile"] == DBNull.Value ? null : Convert.ToString(dr["mobile"]),
                TemplateId = dr["templateid"] == DBNull.Value ? null : Convert.ToInt32(dr["templateid"]),
                EventType = dr["eventtype"] == DBNull.Value ? null : Convert.ToString(dr["eventtype"]),
                PressedKey = dr["pressedkey"] == DBNull.Value ? null : Convert.ToString(dr["pressedkey"]),
                Duration = Convert.ToInt32(dr["duration"]),
                ComputedLeadStatus = dr["computedleadstatus"] == DBNull.Value ? null : Convert.ToString(dr["computedleadstatus"]),
                RawPayload = dr["rawpayload"] == DBNull.Value ? null : Convert.ToString(dr["rawpayload"]),
                ReceivedAt = Convert.ToDateTime(dr["receivedat"]),
                IsSuccess = Convert.ToBoolean(dr["issuccess"]),
                ErrorMessage = dr["errormessage"] == DBNull.Value ? null : Convert.ToString(dr["errormessage"])
            });
        }
        return list;
    }
}
