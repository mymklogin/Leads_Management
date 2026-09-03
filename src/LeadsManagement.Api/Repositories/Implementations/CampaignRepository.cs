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

public class CampaignRepository : ICampaignRepository
{
    private readonly string _Connection;

    public CampaignRepository(DbConnectionHelpers Helpers)
    {
        _Connection = Helpers.Getdbconnection();
    }

    public async Task<int> CreateCampaignAsync(CampaignRecord campaign, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_CreateCampaign", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@CampaignName", campaign.CampaignName);
        cmd.Parameters.AddWithValue("@TemplateId", campaign.TemplateId);
        cmd.Parameters.AddWithValue("@TargetMobile", campaign.TargetMobile);
        cmd.Parameters.AddWithValue("@Cli", (object?)campaign.Cli ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@UserId", (object?)campaign.UserId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@RequestPayload", (object?)campaign.RequestPayload ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@ApiResponse", (object?)campaign.ApiResponse ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@DispatchStatus", campaign.DispatchStatus);

        object? result = await cmd.ExecuteScalarAsync(cancellationToken);
        return result != null && int.TryParse(result.ToString(), out int id) ? id : 0;
    }

    public async Task<List<CampaignRecord>> GetCampaignsAsync(int limit = 100, CancellationToken cancellationToken = default)
    {
        var list = new List<CampaignRecord>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_GetCampaigns", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Limit", limit);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(MapCampaign(dr));
        }
        return list;
    }

    public async Task<CampaignRecord?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "SELECT * FROM [dbo].[CampaignRecords] WHERE [Id] = @Id";
        using SqlCommand cmd = new SqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", id);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapCampaign(dr);
        }
        return null;
    }

    public async Task<bool> UpdateStatusAsync(int id, string status, string? responseData = null, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "UPDATE [dbo].[CampaignRecords] SET [DispatchStatus] = @Status, [ApiResponse] = COALESCE(@ResponseData, [ApiResponse]) WHERE [Id] = @Id";
        using SqlCommand cmd = new SqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", id);
        cmd.Parameters.AddWithValue("@Status", status);
        cmd.Parameters.AddWithValue("@ResponseData", (object?)responseData ?? DBNull.Value);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    private static CampaignRecord MapCampaign(SqlDataReader dr)
    {
        return new CampaignRecord
        {
            Id = Convert.ToInt32(dr["Id"]),
            CampaignName = Convert.ToString(dr["CampaignName"]) ?? string.Empty,
            TemplateId = Convert.ToInt32(dr["TemplateId"]),
            TargetMobile = Convert.ToString(dr["TargetMobile"]) ?? string.Empty,
            Cli = dr["Cli"] == DBNull.Value ? null : Convert.ToString(dr["Cli"]),
            UserId = dr["UserId"] == DBNull.Value ? null : Convert.ToInt32(dr["UserId"]),
            RequestPayload = dr["RequestPayload"] == DBNull.Value ? null : Convert.ToString(dr["RequestPayload"]),
            ApiResponse = dr["ApiResponse"] == DBNull.Value ? null : Convert.ToString(dr["ApiResponse"]),
            DispatchStatus = Convert.ToString(dr["DispatchStatus"]) ?? "Pending",
            DispatchedAt = Convert.ToDateTime(dr["DispatchedAt"])
        };
    }
}

