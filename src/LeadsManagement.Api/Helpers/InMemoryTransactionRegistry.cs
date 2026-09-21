using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using LeadsManagement.Api.Models.Entities;

namespace LeadsManagement.Api.Helpers;

public static class InMemoryTransactionRegistry
{
    private static readonly ConcurrentDictionary<string, RcsTransactionLog> _transactions = new();
    private static int _nextId = 100;

    static InMemoryTransactionRegistry()
    {
        // Seed initial audit transactions matching exact live gateway master quotas
        var initialRcsT = new RcsTransactionLog
        {
            Id = 1,
            TransactionCode = "TXN-682914",
            CreatedAt = DateTime.UtcNow.Date.AddHours(4).AddMinutes(15), // 09:45 AM IST
            UserId = 1,
            Username = "admin",
            PerformedByUserId = 1,
            PerformedByUsername = "admin",
            ServiceType = "RCS-T",
            ActionType = "Allocation",
            Credits = 84,
            PricePerCredit = 0.20m,
            TotalAmount = 16.80m,
            Notes = "Gateway Master Quota Allocation",
            BalanceAfter = 84
        };
        _transactions[initialRcsT.TransactionCode] = initialRcsT;

        var initialRcsP = new RcsTransactionLog
        {
            Id = 2,
            TransactionCode = "TXN-682915",
            CreatedAt = DateTime.UtcNow.Date.AddHours(4).AddMinutes(16), // 09:46 AM IST
            UserId = 1,
            Username = "admin",
            PerformedByUserId = 1,
            PerformedByUsername = "admin",
            ServiceType = "RCS-P",
            ActionType = "Allocation",
            Credits = 109,
            PricePerCredit = 0.20m,
            TotalAmount = 21.80m,
            Notes = "Gateway Master Quota Allocation",
            BalanceAfter = 109
        };
        _transactions[initialRcsP.TransactionCode] = initialRcsP;

        var initialBulkSms = new RcsTransactionLog
        {
            Id = 3,
            TransactionCode = "TXN-682916",
            CreatedAt = DateTime.UtcNow.Date.AddHours(4).AddMinutes(17), // 09:47 AM IST
            UserId = 1,
            Username = "admin",
            PerformedByUserId = 1,
            PerformedByUsername = "admin",
            ServiceType = "BULKSMS-T",
            ActionType = "Allocation",
            Credits = 100,
            PricePerCredit = 0.20m,
            TotalAmount = 20.00m,
            Notes = "Gateway Master Quota Allocation",
            BalanceAfter = 100
        };
        _transactions[initialBulkSms.TransactionCode] = initialBulkSms;
    }

    public static RcsTransactionLog AddTransaction(RcsTransactionLog tx)
    {
        if (string.IsNullOrWhiteSpace(tx.TransactionCode))
        {
            tx.TransactionCode = $"TXN-{new Random().Next(100000, 999999)}";
        }

        if (tx.Id <= 0)
        {
            tx.Id = System.Threading.Interlocked.Increment(ref _nextId);
        }

        if (tx.CreatedAt == default)
        {
            tx.CreatedAt = DateTime.UtcNow;
        }

        _transactions[tx.TransactionCode] = tx;
        return tx;
    }

    public static List<RcsTransactionLog> GetAll()
    {
        return _transactions.Values
            .OrderByDescending(t => t.CreatedAt)
            .ToList();
    }

    public static List<RcsTransactionLog> GetByUserId(int userId)
    {
        return _transactions.Values
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToList();
    }
}
