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

public class RcsTransactionRepository : IRcsTransactionRepository
{
    private readonly string _connection;

    public RcsTransactionRepository(DbConnectionHelpers helpers)
    {
        _connection = helpers.Getdbconnection();
    }

    public async Task<int> InsertTransactionAsync(RcsTransactionLog tx, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            INSERT INTO rcstransactionlogs (
                transactioncode, createdat, userid, username, performedbyuserid, performedbyusername,
                servicetype, actiontype, credits, pricepercredit, totalamount, notes, balanceafter
            )
            VALUES (
                @TransactionCode, CURRENT_TIMESTAMP, @UserId, @Username, @PerformedByUserId, @PerformedByUsername,
                @ServiceType, @ActionType, @Credits, @PricePerCredit, @TotalAmount, @Notes, @BalanceAfter
            )
            RETURNING id;";

        await using var cmd = new NpgsqlCommand(query, con);
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

        var result = await cmd.ExecuteScalarAsync(cancellationToken);
        return result != null && int.TryParse(result.ToString(), out int id) ? id : 0;
    }

    public async Task<List<RcsTransactionLog>> GetTransactionsByUserIdAsync(int userId, int limit = 50, CancellationToken cancellationToken = default)
    {
        var list = new List<RcsTransactionLog>();
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, transactioncode, createdat, userid, username, performedbyuserid, performedbyusername,
                   servicetype, actiontype, credits, pricepercredit, totalamount, notes, balanceafter
            FROM rcstransactionlogs
            WHERE userid = @UserId
            ORDER BY createdat DESC
            LIMIT @Limit;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@UserId", userId);
        cmd.Parameters.AddWithValue("@Limit", limit);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(new RcsTransactionLog
            {
                Id = Convert.ToInt32(dr["id"]),
                TransactionCode = Convert.ToString(dr["transactioncode"]) ?? string.Empty,
                CreatedAt = Convert.ToDateTime(dr["createdat"]),
                UserId = Convert.ToInt32(dr["userid"]),
                Username = Convert.ToString(dr["username"]) ?? string.Empty,
                PerformedByUserId = dr["performedbyuserid"] == DBNull.Value ? null : Convert.ToInt32(dr["performedbyuserid"]),
                PerformedByUsername = dr["performedbyusername"] == DBNull.Value ? null : Convert.ToString(dr["performedbyusername"]),
                ServiceType = Convert.ToString(dr["servicetype"]) ?? "RCS",
                ActionType = Convert.ToString(dr["actiontype"]) ?? "Credit",
                Credits = Convert.ToDecimal(dr["credits"]),
                PricePerCredit = Convert.ToDecimal(dr["pricepercredit"]),
                TotalAmount = Convert.ToDecimal(dr["totalamount"]),
                Notes = dr["notes"] == DBNull.Value ? null : Convert.ToString(dr["notes"]),
                BalanceAfter = Convert.ToDecimal(dr["balanceafter"])
            });
        }
        return list;
    }

    public async Task<List<RcsTransactionLog>> GetAllTransactionsAsync(CancellationToken cancellationToken = default)
    {
        var list = new List<RcsTransactionLog>();
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, transactioncode, createdat, userid, username, performedbyuserid, performedbyusername,
                   servicetype, actiontype, credits, pricepercredit, totalamount, notes, balanceafter
            FROM rcstransactionlogs
            ORDER BY createdat DESC
            LIMIT 100;";

        await using var cmd = new NpgsqlCommand(query, con);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(new RcsTransactionLog
            {
                Id = Convert.ToInt32(dr["id"]),
                TransactionCode = Convert.ToString(dr["transactioncode"]) ?? string.Empty,
                CreatedAt = Convert.ToDateTime(dr["createdat"]),
                UserId = Convert.ToInt32(dr["userid"]),
                Username = Convert.ToString(dr["username"]) ?? string.Empty,
                PerformedByUserId = dr["performedbyuserid"] == DBNull.Value ? null : Convert.ToInt32(dr["performedbyuserid"]),
                PerformedByUsername = dr["performedbyusername"] == DBNull.Value ? null : Convert.ToString(dr["performedbyusername"]),
                ServiceType = Convert.ToString(dr["servicetype"]) ?? "RCS",
                ActionType = Convert.ToString(dr["actiontype"]) ?? "Credit",
                Credits = Convert.ToDecimal(dr["credits"]),
                PricePerCredit = Convert.ToDecimal(dr["pricepercredit"]),
                TotalAmount = Convert.ToDecimal(dr["totalamount"]),
                Notes = dr["notes"] == DBNull.Value ? null : Convert.ToString(dr["notes"]),
                BalanceAfter = Convert.ToDecimal(dr["balanceafter"])
            });
        }
        return list;
    }
}
