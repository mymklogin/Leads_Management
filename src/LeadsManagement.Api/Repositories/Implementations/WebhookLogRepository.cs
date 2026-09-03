using System;
using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using LeadsManagement.Api.Helpers;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Repositories.Interfaces;

namespace LeadsManagement.Api.Repositories.Implementations;

public class WebhookLogRepository : IWebhookLogRepository
{
    private readonly string _Connection;

    public WebhookLogRepository(DbConnectionHelpers Helpers)
    {
        _Connection = Helpers.Getdbconnection();
    }

    public async Task<int> InsertWebhookLogAsync(WebhookLog log, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_InsertWebhookLog", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Mobile", (object?)log.Mobile ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@TemplateId", (object?)log.TemplateId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@EventType", (object?)log.EventType ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PressedKey", (object?)log.PressedKey ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Duration", log.Duration);
        cmd.Parameters.AddWithValue("@ComputedLeadStatus", (object?)log.ComputedLeadStatus ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@RawPayload", (object?)log.RawPayload ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@IsSuccess", log.IsSuccess);
        cmd.Parameters.AddWithValue("@ErrorMessage", (object?)log.ErrorMessage ?? DBNull.Value);

        object? result = await cmd.ExecuteScalarAsync(cancellationToken);
        return result != null && int.TryParse(result.ToString(), out int id) ? id : 0;
    }

    public async Task<List<WebhookLog>> GetRecentLogsAsync(int limit = 100, CancellationToken cancellationToken = default)
    {
        var list = new List<WebhookLog>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_GetWebhookLogs", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Limit", limit);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(new WebhookLog
            {
                Id = Convert.ToInt32(dr["Id"]),
                Mobile = dr["Mobile"] == DBNull.Value ? null : Convert.ToString(dr["Mobile"]),
                TemplateId = dr["TemplateId"] == DBNull.Value ? null : Convert.ToInt32(dr["TemplateId"]),
                EventType = dr["EventType"] == DBNull.Value ? null : Convert.ToString(dr["EventType"]),
                PressedKey = dr["PressedKey"] == DBNull.Value ? null : Convert.ToString(dr["PressedKey"]),
                Duration = Convert.ToInt32(dr["Duration"]),
                ComputedLeadStatus = dr["ComputedLeadStatus"] == DBNull.Value ? null : Convert.ToString(dr["ComputedLeadStatus"]),
                RawPayload = dr["RawPayload"] == DBNull.Value ? null : Convert.ToString(dr["RawPayload"]),
                ReceivedAt = Convert.ToDateTime(dr["ReceivedAt"]),
                IsSuccess = Convert.ToBoolean(dr["IsSuccess"]),
                ErrorMessage = dr["ErrorMessage"] == DBNull.Value ? null : Convert.ToString(dr["ErrorMessage"])
            });
        }
        return list;
    }
}

