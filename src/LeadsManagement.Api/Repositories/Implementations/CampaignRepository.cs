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

public class CampaignRepository : ICampaignRepository
{
    private readonly string _connection;

    public CampaignRepository(DbConnectionHelpers helpers)
    {
        _connection = helpers.Getdbconnection();
    }

    public async Task<int> CreateCampaignAsync(CampaignRecord campaign, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            INSERT INTO campaignrecords (
                campaignname, templateid, targetmobile, cli, userid, 
                requestpayload, apiresponse, dispatchstatus, dispatchedat
            )
            VALUES (
                @CampaignName, @TemplateId, @TargetMobile, @Cli, @UserId, 
                @RequestPayload, @ApiResponse, @DispatchStatus, CURRENT_TIMESTAMP
            )
            RETURNING id;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@CampaignName", campaign.CampaignName);
        cmd.Parameters.AddWithValue("@TemplateId", campaign.TemplateId);
        cmd.Parameters.AddWithValue("@TargetMobile", campaign.TargetMobile);
        cmd.Parameters.AddWithValue("@Cli", (object?)campaign.Cli ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@UserId", (object?)campaign.UserId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@RequestPayload", (object?)campaign.RequestPayload ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@ApiResponse", (object?)campaign.ApiResponse ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@DispatchStatus", campaign.DispatchStatus);

        var result = await cmd.ExecuteScalarAsync(cancellationToken);
        return result != null && int.TryParse(result.ToString(), out int id) ? id : 0;
    }

    public async Task<List<CampaignRecord>> GetCampaignsAsync(int limit = 100, CancellationToken cancellationToken = default)
    {
        var list = new List<CampaignRecord>();
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, campaignname, templateid, targetmobile, cli, userid, 
                   requestpayload, apiresponse, dispatchstatus, dispatchedat
            FROM campaignrecords
            ORDER BY dispatchedat DESC
            LIMIT @Limit;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Limit", limit);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(MapCampaign(dr));
        }
        return list;
    }

    public async Task<CampaignRecord?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, campaignname, templateid, targetmobile, cli, userid, 
                   requestpayload, apiresponse, dispatchstatus, dispatchedat
            FROM campaignrecords
            WHERE id = @Id;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", id);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapCampaign(dr);
        }
        return null;
    }

    public async Task<bool> UpdateStatusAsync(int id, string status, string? responseData = null, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            UPDATE campaignrecords
            SET dispatchstatus = @Status,
                apiresponse = COALESCE(@ResponseData, apiresponse)
            WHERE id = @Id;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", id);
        cmd.Parameters.AddWithValue("@Status", status);
        cmd.Parameters.AddWithValue("@ResponseData", (object?)responseData ?? DBNull.Value);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    private static CampaignRecord MapCampaign(NpgsqlDataReader dr)
    {
        return new CampaignRecord
        {
            Id = Convert.ToInt32(dr["id"]),
            CampaignName = Convert.ToString(dr["campaignname"]) ?? string.Empty,
            TemplateId = Convert.ToInt32(dr["templateid"]),
            TargetMobile = Convert.ToString(dr["targetmobile"]) ?? string.Empty,
            Cli = dr["cli"] == DBNull.Value ? null : Convert.ToString(dr["cli"]),
            UserId = dr["userid"] == DBNull.Value ? null : Convert.ToInt32(dr["userid"]),
            RequestPayload = dr["requestpayload"] == DBNull.Value ? null : Convert.ToString(dr["requestpayload"]),
            ApiResponse = dr["apiresponse"] == DBNull.Value ? null : Convert.ToString(dr["apiresponse"]),
            DispatchStatus = Convert.ToString(dr["dispatchstatus"]) ?? "Pending",
            DispatchedAt = Convert.ToDateTime(dr["dispatchedat"])
        };
    }
}
