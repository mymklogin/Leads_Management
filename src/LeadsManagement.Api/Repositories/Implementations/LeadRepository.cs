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

public class LeadRepository : ILeadRepository
{
    private readonly string _Connection;

    public LeadRepository(DbConnectionHelpers Helpers)
    {
        _Connection = Helpers.Getdbconnection();
    }

    public async Task<List<LeadRecord>> GetLeadsAsync(
        string? status, int? templateId, string? mobile, int pageNumber = 1, int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var list = new List<LeadRecord>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_GetLeads", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Status", (object?)status ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@TemplateId", (object?)templateId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Mobile", (object?)mobile ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PageNumber", pageNumber);
        cmd.Parameters.AddWithValue("@PageSize", pageSize);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(MapLead(dr));
        }
        return list;
    }

    public async Task<int> CreateOrUpdateLeadAsync(LeadRecord lead, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_CreateOrUpdateLead", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Mobile", lead.Mobile);
        cmd.Parameters.AddWithValue("@CustomerName", (object?)lead.CustomerName ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@TemplateId", (object?)lead.TemplateId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@LeadStatus", lead.LeadStatus);
        cmd.Parameters.AddWithValue("@CallDuration", lead.CallDuration);
        cmd.Parameters.AddWithValue("@PressedDtmf", (object?)lead.PressedDtmf ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@LastEventType", (object?)lead.LastEventType ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@UserId", (object?)lead.UserId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@AssignedToUserId", (object?)lead.AssignedToUserId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Cli", (object?)lead.Cli ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Notes", (object?)lead.Notes ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@CustomData", (object?)lead.CustomData ?? DBNull.Value);

        object? result = await cmd.ExecuteScalarAsync(cancellationToken);
        return result != null && int.TryParse(result.ToString(), out int id) ? id : 0;
    }

    public async Task<LeadRecord?> GetLeadByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "SELECT * FROM [dbo].[LeadRecords] WHERE [Id] = @Id";
        using SqlCommand cmd = new SqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", id);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapLead(dr);
        }
        return null;
    }

    public async Task<bool> DeleteLeadAsync(int id, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "DELETE FROM [dbo].[LeadRecords] WHERE [Id] = @Id";
        using SqlCommand cmd = new SqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", id);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<List<LeadRecord>> GetAllLeadsRawAsync(CancellationToken cancellationToken = default)
    {
        var list = new List<LeadRecord>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "SELECT * FROM [dbo].[LeadRecords] ORDER BY [UpdatedAt] DESC";
        using SqlCommand cmd = new SqlCommand(query, con);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(MapLead(dr));
        }
        return list;
    }

    public async Task<LeadRecord?> GetLeadByMobileAsync(string mobile, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "SELECT * FROM [dbo].[LeadRecords] WHERE [Mobile] = @Mobile";
        using SqlCommand cmd = new SqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Mobile", mobile);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapLead(dr);
        }
        return null;
    }

    public async Task<Dictionary<string, int>> GetLeadCountByStatusAsync(CancellationToken cancellationToken = default)
    {
        var dict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "SELECT [LeadStatus], COUNT(1) AS [Count] FROM [dbo].[LeadRecords] GROUP BY [LeadStatus]";
        using SqlCommand cmd = new SqlCommand(query, con);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            string status = Convert.ToString(dr["LeadStatus"]) ?? "Unknown";
            int count = Convert.ToInt32(dr["Count"]);
            dict[status] = count;
        }
        return dict;
    }

    public async Task<Dictionary<int, int>> GetLeadCountByTemplateAsync(CancellationToken cancellationToken = default)
    {
        var dict = new Dictionary<int, int>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "SELECT ISNULL([TemplateId], 0) AS [TemplateId], COUNT(1) AS [Count] FROM [dbo].[LeadRecords] GROUP BY [TemplateId]";
        using SqlCommand cmd = new SqlCommand(query, con);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            int tid = Convert.ToInt32(dr["TemplateId"]);
            int count = Convert.ToInt32(dr["Count"]);
            dict[tid] = count;
        }
        return dict;
    }

    private static LeadRecord MapLead(SqlDataReader dr)
    {
        return new LeadRecord
        {
            Id = Convert.ToInt32(dr["Id"]),
            Mobile = Convert.ToString(dr["Mobile"]) ?? string.Empty,
            CustomerName = dr["CustomerName"] == DBNull.Value ? null : Convert.ToString(dr["CustomerName"]),
            TemplateId = dr["TemplateId"] == DBNull.Value ? null : Convert.ToInt32(dr["TemplateId"]),
            LeadStatus = Convert.ToString(dr["LeadStatus"]) ?? "New",
            CallDuration = Convert.ToInt32(dr["CallDuration"]),
            PressedDtmf = dr["PressedDtmf"] == DBNull.Value ? null : Convert.ToString(dr["PressedDtmf"]),
            LastEventType = dr["LastEventType"] == DBNull.Value ? null : Convert.ToString(dr["LastEventType"]),
            UserId = dr["UserId"] == DBNull.Value ? null : Convert.ToInt32(dr["UserId"]),
            AssignedToUserId = dr["AssignedToUserId"] == DBNull.Value ? null : Convert.ToInt32(dr["AssignedToUserId"]),
            Cli = dr["Cli"] == DBNull.Value ? null : Convert.ToString(dr["Cli"]),
            Notes = dr["Notes"] == DBNull.Value ? null : Convert.ToString(dr["Notes"]),
            CustomData = dr["CustomData"] == DBNull.Value ? null : Convert.ToString(dr["CustomData"]),
            CreatedAt = Convert.ToDateTime(dr["CreatedAt"]),
            UpdatedAt = Convert.ToDateTime(dr["UpdatedAt"])
        };
    }
}

