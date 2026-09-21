using LeadsManagement.Api.Helpers;
using LeadsManagement.Api.Repositories.Implementations;
using Microsoft.Extensions.Configuration;
using Npgsql;

// This harness runs only against a dedicated disposable test database.
const string connection = "Host=127.0.0.1;Port=55439;Database=postgres;Username=audit_test";
await using var db = new NpgsqlConnection(connection);
await db.OpenAsync();
async Task Sql(string sql) { await using var cmd = new NpgsqlCommand(sql, db); await cmd.ExecuteNonQueryAsync(); }
async Task<decimal> Scalar(string sql) { await using var cmd = new NpgsqlCommand(sql, db); return Convert.ToDecimal(await cmd.ExecuteScalarAsync()); }
void Check(bool ok, string message) { if (!ok) throw new Exception(message); Console.WriteLine("PASS " + message); }
await Sql("CREATE TEMP TABLE unused(id int)");
await Sql(@"CREATE TABLE users(id INT PRIMARY KEY, username TEXT, isactive BOOLEAN, role INT, parentuserid INT,
    rcscredits NUMERIC(18,2), smscredits NUMERIC(18,2), whatsappcredits NUMERIC(18,2), updatedat TIMESTAMPTZ);
    INSERT INTO users VALUES (1,'admin',true,1,null,100,100,100,now()),(2,'client',true,4,1,10,10,10,now()),(3,'inactive',false,4,1,10,10,10,now());");
using var migration = typeof(DbConnectionHelpers).Assembly.GetManifestResourceStream("LeadsManagement.Api.Migrations.20260917_balance_audit.sql")!;
using var reader = new StreamReader(migration);
var migrationSql = await reader.ReadToEndAsync();
await Sql(migrationSql); await Sql(migrationSql);
Check(true, "schema migration is repeatable");
var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string?> { ["ConnectionStrings:PostgreSqlConnection"] = connection }).Build();
var repository = new RcsTransactionRepository(new DbConnectionHelpers(config));
async Task Reject(int target, decimal amount, string action = "Credit") {
    try { await repository.TransferAsync(1,target,"RCS-T",action,amount,.2m,"test",Guid.NewGuid()); throw new Exception("Invalid transfer accepted"); }
    catch(InvalidOperationException) { }
}
await Reject(1236,5); await Reject(3,5); await Reject(2,101); await Reject(2,11,"Revoke");
Check(await Scalar("SELECT count(*) FROM rcstransactionlogs") == 0 && await Scalar("SELECT rcscredits FROM users WHERE id=1") == 100, "missing/inactive user and insufficient funds leave no writes");
var key=Guid.NewGuid();
var credit=await repository.TransferAsync(1,2,"RCS-T","Credit",5,.2m,"test",key);
await repository.TransferAsync(1,2,"RCS-T","Credit",5,.2m,"test",key);
Check(credit.BalanceAfter == 15 && await Scalar("SELECT rcscredits FROM users WHERE id=1") == 95 && await Scalar("SELECT count(*) FROM rcstransactionlogs") == 2, "credit + source debit are persisted once on duplicate request");
var revoke=await repository.TransferAsync(1,2,"RCS-T","Revoke",3,.2m,"revoke",Guid.NewGuid());
Check(revoke.Credits == -3 && revoke.TotalAmount == -.6m && await Scalar("SELECT rcscredits FROM users WHERE id=1") == 98 && await Scalar("SELECT rcscredits FROM users WHERE id=2") == 12, "revoke refunds source and persists signed value");
await Sql("ALTER TABLE rcstransactionlogs ADD CONSTRAINT reject_test_note CHECK (notes <> 'force-failure')");
try { await repository.TransferAsync(1,2,"RCS-T","Credit",1,.2m,"force-failure",Guid.NewGuid()); throw new Exception("Expected insert failure"); } catch(PostgresException) { }
Check(await Scalar("SELECT rcscredits FROM users WHERE id=1") == 98 && await Scalar("SELECT rcscredits FROM users WHERE id=2") == 12 && await Scalar("SELECT count(*) FROM rcstransactionlogs") == 4, "ledger insert failure rolls back both balances");
await Sql("UPDATE users SET rcspromotionalcredits=20,bulksmspromotionalcredits=20,whatsapppromotionalcredits=20 WHERE id=1");
foreach(var wallet in new[]{"RCS-P","BULKSMS-T","BULKSMS-P","WHATSAPP-T","WHATSAPP-P"}) {
    var tx=await repository.TransferAsync(1,2,wallet,"Credit",2,.1m,"wallet",Guid.NewGuid());
    Check(tx.Credits == 2, wallet + " persisted independently");
}
await Sql("UPDATE users SET rcscredits=5 WHERE id=1");
var results=await Task.WhenAll(Enumerable.Range(0,2).Select(async _ => { try { await repository.TransferAsync(1,2,"RCS-T","Credit",4,.2m,"race",Guid.NewGuid()); return true; } catch(InvalidOperationException) { return false; } }));
Check(results.Count(x=>x)==1 && await Scalar("SELECT rcscredits FROM users WHERE id=1")==1, "concurrent requests cannot overdraw wallet");
var fresh=new RcsTransactionRepository(new DbConnectionHelpers(config));
var entries=await fresh.GetAllTransactionsAsync();
Check(entries.Count==16 && entries.All(t=>t.CreatedAt.Kind==DateTimeKind.Utc) && entries.Any(t=>t.UserId==2 && t.Username=="client" && t.PerformedByUsername=="admin"), "fresh repository reads full database history with UTC and user details");
