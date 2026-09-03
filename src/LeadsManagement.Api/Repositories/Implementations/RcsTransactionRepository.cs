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

public class RcsTransactionRepository : IRcsTransactionRepository
{
    private readonly string _Connection;

    public RcsTransactionRepository(DbConnectionHelpers Helpers)
    {
        _Connection = Helpers.Getdbconnection();
    }

    public async Task<int> InsertTransactionAsync(RcsTransactionLog tx, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_InsertRcsTransaction", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@TransactionCode", tx.TransactionCode);
        cmd.Parameters.AddWithValue("@UserId", tx.UserId);
        cmd.Parameters.AddWithValue("@Username", tx.Username);
        cmd.Parameters.AddWithValue("@PerformedByUserId", (object?)tx.PerformedByUserId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PerformedByUsername", (object?)tx.PerformedByUsername ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@ServiceType", tx.ServiceType);
        cmd.Parameters.AddWithValue("@ActionType", tx.ActionType);
        cmd.Parameters.AddWithValue("@Credits", tx.Credits);
        cmd.Parameters.AddWithValue("@PricePerCredit", tx.PricePerCredit);
        cmd.Parameters.AddWithValue("@TotalAmount", tx.TotalAmount);
        cmd.Parameters.AddWithValue("@Notes", (object?)tx.Notes ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@BalanceAfter", tx.BalanceAfter);

        object? result = await cmd.ExecuteScalarAsync(cancellationToken);
        return result != null && int.TryParse(result.ToString(), out int id) ? id : 0;
    }

    public async Task<List<RcsTransactionLog>> GetTransactionsByUserIdAsync(int userId, int limit = 50, CancellationToken cancellationToken = default)
    {
        var list = new List<RcsTransactionLog>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_GetRcsTransactionsByUserId", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@UserId", userId);
        cmd.Parameters.AddWithValue("@Limit", limit);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(new RcsTransactionLog
            {
                Id = Convert.ToInt32(dr["Id"]),
                TransactionCode = Convert.ToString(dr["TransactionCode"]) ?? string.Empty,
                CreatedAt = Convert.ToDateTime(dr["CreatedAt"]),
                UserId = Convert.ToInt32(dr["UserId"]),
                Username = Convert.ToString(dr["Username"]) ?? string.Empty,
                PerformedByUserId = dr["PerformedByUserId"] == DBNull.Value ? null : Convert.ToInt32(dr["PerformedByUserId"]),
                PerformedByUsername = dr["PerformedByUsername"] == DBNull.Value ? null : Convert.ToString(dr["PerformedByUsername"]),
                ServiceType = Convert.ToString(dr["ServiceType"]) ?? "RCS",
                ActionType = Convert.ToString(dr["ActionType"]) ?? "Credit",
                Credits = Convert.ToDecimal(dr["Credits"]),
                PricePerCredit = Convert.ToDecimal(dr["PricePerCredit"]),
                TotalAmount = Convert.ToDecimal(dr["TotalAmount"]),
                Notes = dr["Notes"] == DBNull.Value ? null : Convert.ToString(dr["Notes"]),
                BalanceAfter = Convert.ToDecimal(dr["BalanceAfter"])
            });
        }
        return list;
    }

    public async Task<List<RcsTransactionLog>> GetAllTransactionsAsync(CancellationToken cancellationToken = default)
    {
        var list = new List<RcsTransactionLog>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "SELECT * FROM [dbo].[RcsTransactionLogs] ORDER BY [CreatedAt] DESC";
        using SqlCommand cmd = new SqlCommand(query, con);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(new RcsTransactionLog
            {
                Id = Convert.ToInt32(dr["Id"]),
                TransactionCode = Convert.ToString(dr["TransactionCode"]) ?? string.Empty,
                CreatedAt = Convert.ToDateTime(dr["CreatedAt"]),
                UserId = Convert.ToInt32(dr["UserId"]),
                Username = Convert.ToString(dr["Username"]) ?? string.Empty,
                PerformedByUserId = dr["PerformedByUserId"] == DBNull.Value ? null : Convert.ToInt32(dr["PerformedByUserId"]),
                PerformedByUsername = dr["PerformedByUsername"] == DBNull.Value ? null : Convert.ToString(dr["PerformedByUsername"]),
                ServiceType = Convert.ToString(dr["ServiceType"]) ?? "RCS",
                ActionType = Convert.ToString(dr["ActionType"]) ?? "Credit",
                Credits = Convert.ToDecimal(dr["Credits"]),
                PricePerCredit = Convert.ToDecimal(dr["PricePerCredit"]),
                TotalAmount = Convert.ToDecimal(dr["TotalAmount"]),
                Notes = dr["Notes"] == DBNull.Value ? null : Convert.ToString(dr["Notes"]),
                BalanceAfter = Convert.ToDecimal(dr["BalanceAfter"])
            });
        }
        return list;
    }
}


