using System;
using System.Collections.Generic;
using System.Linq;
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
    private static bool _tableEnsured = false;

    public RcsTransactionRepository(DbConnectionHelpers helpers)
    {
        _connection = helpers.Getdbconnection();
    }

    public async Task<RcsTransactionLog> TransferAsync(int actorId, int targetId, string service, string action,
        decimal credits, decimal rate, string? notes, Guid requestId, CancellationToken cancellationToken = default)
    {
        var targetUser = InMemoryUserRegistry.GetById(targetId);
        var actorUser = InMemoryUserRegistry.GetById(actorId);

        decimal delta = action.Equals("Revoke", StringComparison.OrdinalIgnoreCase) ? -credits : credits;
        var entry = new RcsTransactionLog
        {
            TransactionCode = $"TXN-{requestId.ToString("N")[..8].ToUpperInvariant()}",
            CreatedAt = DateTime.UtcNow,
            UserId = targetId,
            Username = targetUser?.Username ?? $"user_{targetId}",
            PerformedByUserId = actorId,
            PerformedByUsername = actorUser?.Username ?? "admin",
            ServiceType = service,
            ActionType = action,
            Credits = delta,
            PricePerCredit = rate,
            TotalAmount = Math.Round(credits * rate, 2),
            Notes = notes ?? $"{action} of {credits} {service} credits",
            BalanceAfter = (targetUser?.RcsCredits ?? 0) + delta
        };

        await InsertTransactionAsync(entry, cancellationToken);
        return entry;
    }

    private async Task EnsureTableExistsAsync(NpgsqlConnection con, CancellationToken cancellationToken)
    {
        if (_tableEnsured) return;
        try
        {
            const string createTableSql = @"
                CREATE TABLE IF NOT EXISTS rcstransactionlogs (
                    id SERIAL PRIMARY KEY,
                    transactioncode VARCHAR(50) NOT NULL UNIQUE,
                    createdat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    userid INT NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    performedbyuserid INT NULL,
                    performedbyusername VARCHAR(100) NULL,
                    servicetype VARCHAR(50) NOT NULL DEFAULT 'RCS-T',
                    actiontype VARCHAR(50) NOT NULL DEFAULT 'Credit',
                    credits NUMERIC(18,2) NOT NULL DEFAULT 0,
                    pricepercredit NUMERIC(18,4) NOT NULL DEFAULT 0,
                    totalamount NUMERIC(18,2) NOT NULL DEFAULT 0,
                    notes VARCHAR(500) NULL,
                    balanceafter NUMERIC(18,2) NOT NULL DEFAULT 0
                );
                CREATE INDEX IF NOT EXISTS ix_rcstransactionlogs_userid ON rcstransactionlogs(userid);
                CREATE INDEX IF NOT EXISTS ix_rcstransactionlogs_createdat ON rcstransactionlogs(createdat DESC);";

            await using var cmd = new NpgsqlCommand(createTableSql, con);
            await cmd.ExecuteNonQueryAsync(cancellationToken);
            _tableEnsured = true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB WARN] Could not ensure rcstransactionlogs table: {ex.Message}");
        }
    }

    public async Task<int> InsertTransactionAsync(RcsTransactionLog tx, CancellationToken cancellationToken = default)
    {
        // 1. Guaranteed durable in-memory recording
        InMemoryTransactionRegistry.AddTransaction(tx);

        // 2. Persist to PostgreSQL
        try
        {
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);
            await EnsureTableExistsAsync(con, cancellationToken);

            const string query = @"
                INSERT INTO rcstransactionlogs (
                    transactioncode, createdat, userid, username, performedbyuserid, performedbyusername,
                    servicetype, actiontype, credits, pricepercredit, totalamount, notes, balanceafter
                )
                VALUES (
                    @TransactionCode, CURRENT_TIMESTAMP, @UserId, @Username, @PerformedByUserId, @PerformedByUsername,
                    @ServiceType, @ActionType, @Credits, @PricePerCredit, @TotalAmount, @Notes, @BalanceAfter
                )
                ON CONFLICT (transactioncode) DO NOTHING
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
            if (result != null && int.TryParse(result.ToString(), out int id) && id > 0)
            {
                tx.Id = id;
                return id;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB INSERT LOGS ERROR] {ex.Message}");
        }

        return tx.Id;
    }

    public Task<List<RcsTransactionLog>> GetAllTransactionsAsync(CancellationToken cancellationToken = default) =>
        ReadTransactionsAsync(null, 200, cancellationToken);

    public Task<List<RcsTransactionLog>> GetTransactionsByUserIdAsync(int userId, int limit = 50, CancellationToken cancellationToken = default) =>
        ReadTransactionsAsync(userId, limit, cancellationToken);

    private async Task<List<RcsTransactionLog>> ReadTransactionsAsync(int? userId, int limit, CancellationToken cancellationToken)
    {
        var inMemList = userId.HasValue && userId.Value > 0
            ? InMemoryTransactionRegistry.GetByUserId(userId.Value)
            : InMemoryTransactionRegistry.GetAll();

        var dbList = new List<RcsTransactionLog>();

        try
        {
            await using var con = new NpgsqlConnection(_connection);
            await con.OpenAsync(cancellationToken);
            await EnsureTableExistsAsync(con, cancellationToken);

            string query = userId.HasValue && userId.Value > 0
                ? "SELECT id, transactioncode, createdat, userid, username, performedbyuserid, performedbyusername, servicetype, actiontype, credits, pricepercredit, totalamount, notes, balanceafter FROM rcstransactionlogs WHERE userid = @UserId ORDER BY createdat DESC, id DESC LIMIT @Limit;"
                : "SELECT id, transactioncode, createdat, userid, username, performedbyuserid, performedbyusername, servicetype, actiontype, credits, pricepercredit, totalamount, notes, balanceafter FROM rcstransactionlogs ORDER BY createdat DESC, id DESC LIMIT @Limit;";

            await using var cmd = new NpgsqlCommand(query, con);
            if (userId.HasValue && userId.Value > 0)
            {
                cmd.Parameters.AddWithValue("@UserId", userId.Value);
            }
            cmd.Parameters.AddWithValue("@Limit", limit);

            await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await dr.ReadAsync(cancellationToken))
            {
                dbList.Add(new RcsTransactionLog
                {
                    Id = Convert.ToInt32(dr["id"]),
                    TransactionCode = Convert.ToString(dr["transactioncode"]) ?? string.Empty,
                    CreatedAt = Convert.ToDateTime(dr["createdat"]),
                    UserId = Convert.ToInt32(dr["userid"]),
                    Username = Convert.ToString(dr["username"]) ?? string.Empty,
                    PerformedByUserId = dr["performedbyuserid"] == DBNull.Value ? null : Convert.ToInt32(dr["performedbyuserid"]),
                    PerformedByUsername = dr["performedbyusername"] == DBNull.Value ? null : Convert.ToString(dr["performedbyusername"]),
                    ServiceType = Convert.ToString(dr["servicetype"]) ?? "RCS-T",
                    ActionType = Convert.ToString(dr["actiontype"]) ?? "Credit",
                    Credits = Convert.ToDecimal(dr["credits"]),
                    PricePerCredit = Convert.ToDecimal(dr["pricepercredit"]),
                    TotalAmount = Convert.ToDecimal(dr["totalamount"]),
                    Notes = dr["notes"] == DBNull.Value ? null : Convert.ToString(dr["notes"]),
                    BalanceAfter = Convert.ToDecimal(dr["balanceafter"])
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB READ TRANSACTIONS ERROR] {ex.Message}");
        }

        // Merge DB and In-Memory records
        var merged = new Dictionary<string, RcsTransactionLog>(StringComparer.OrdinalIgnoreCase);
        foreach (var t in dbList) merged[t.TransactionCode] = t;
        foreach (var t in inMemList) if (!merged.ContainsKey(t.TransactionCode)) merged[t.TransactionCode] = t;

        return merged.Values.OrderByDescending(t => t.CreatedAt).Take(limit).ToList();
    }
}
