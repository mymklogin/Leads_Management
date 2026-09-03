using System;
using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using Npgsql;
using LeadsManagement.Api.Helpers;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Models.Enums;
using LeadsManagement.Api.Repositories.Interfaces;

namespace LeadsManagement.Api.Repositories.Implementations;

public class UserRepository : IUserRepository
{
    private readonly string _connection;

    public UserRepository(DbConnectionHelpers helpers)
    {
        _connection = helpers.Getdbconnection();
    }

    public async Task<AppUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, username, email, passwordhash, fullname, phonenumber, role, parentuserid, 
                   voicecredits, whatsappcredits, rcscredits, smscredits, isactive, createdat, updatedat, lastloginat
            FROM users 
            WHERE username = @Username;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Username", username);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapUser(dr);
        }
        return null;
    }

    public async Task<AppUser?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, username, email, passwordhash, fullname, phonenumber, role, parentuserid, 
                   voicecredits, whatsappcredits, rcscredits, smscredits, isactive, createdat, updatedat, lastloginat
            FROM users 
            WHERE id = @Id;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", id);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapUser(dr);
        }
        return null;
    }

    public async Task<List<AppUser>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        var list = new List<AppUser>();
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, username, email, passwordhash, fullname, phonenumber, role, parentuserid, 
                   voicecredits, whatsappcredits, rcscredits, smscredits, isactive, createdat, updatedat, lastloginat
            FROM users 
            ORDER BY id;";

        await using var cmd = new NpgsqlCommand(query, con);
        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(MapUser(dr));
        }
        return list;
    }

    public async Task<List<AppUser>> GetSubordinateUsersAsync(int parentUserId, CancellationToken cancellationToken = default)
    {
        var list = new List<AppUser>();
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            SELECT id, username, email, passwordhash, fullname, phonenumber, role, parentuserid, 
                   voicecredits, whatsappcredits, rcscredits, smscredits, isactive, createdat, updatedat, lastloginat
            FROM users 
            WHERE parentuserid = @ParentUserId 
            ORDER BY id;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@ParentUserId", parentUserId);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(MapUser(dr));
        }
        return list;
    }

    public async Task<int> CreateUserAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            INSERT INTO users (
                username, email, passwordhash, fullname, phonenumber, role, parentuserid, 
                voicecredits, whatsappcredits, rcscredits, smscredits, isactive, createdat, updatedat
            )
            VALUES (
                @Username, @Email, @PasswordHash, @FullName, @PhoneNumber, @Role, @ParentUserId, 
                @VoiceCredits, @WhatsAppCredits, @RcsCredits, @SmsCredits, @IsActive, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            RETURNING id;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Username", user.Username);
        cmd.Parameters.AddWithValue("@Email", user.Email);
        cmd.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
        cmd.Parameters.AddWithValue("@FullName", user.FullName);
        cmd.Parameters.AddWithValue("@PhoneNumber", (object?)user.PhoneNumber ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Role", (int)user.Role);
        cmd.Parameters.AddWithValue("@ParentUserId", (object?)user.ParentUserId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@VoiceCredits", user.VoiceCredits);
        cmd.Parameters.AddWithValue("@WhatsAppCredits", user.WhatsAppCredits);
        cmd.Parameters.AddWithValue("@RcsCredits", user.RcsCredits);
        cmd.Parameters.AddWithValue("@SmsCredits", user.SmsCredits);
        cmd.Parameters.AddWithValue("@IsActive", user.IsActive);

        var result = await cmd.ExecuteScalarAsync(cancellationToken);
        return result != null && int.TryParse(result.ToString(), out int id) ? id : 0;
    }

    public async Task<bool> UpdateUserAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            UPDATE users 
            SET email = @Email, fullname = @FullName, phonenumber = @PhoneNumber, 
                role = @Role, isactive = @IsActive, updatedat = CURRENT_TIMESTAMP
            WHERE id = @Id;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", user.Id);
        cmd.Parameters.AddWithValue("@Email", user.Email);
        cmd.Parameters.AddWithValue("@FullName", user.FullName);
        cmd.Parameters.AddWithValue("@PhoneNumber", (object?)user.PhoneNumber ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Role", (int)user.Role);
        cmd.Parameters.AddWithValue("@IsActive", user.IsActive);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<bool> UpdateCreditsAsync(int userId, decimal voice, decimal whatsapp, decimal rcs, decimal sms, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            UPDATE users 
            SET voicecredits = @VoiceCredits, whatsappcredits = @WhatsAppCredits, 
                rcscredits = @RcsCredits, smscredits = @SmsCredits, updatedat = CURRENT_TIMESTAMP
            WHERE id = @Id;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", userId);
        cmd.Parameters.AddWithValue("@VoiceCredits", voice);
        cmd.Parameters.AddWithValue("@WhatsAppCredits", whatsapp);
        cmd.Parameters.AddWithValue("@RcsCredits", rcs);
        cmd.Parameters.AddWithValue("@SmsCredits", sms);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<bool> UpdateLastLoginAsync(int userId, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = "UPDATE users SET lastloginat = CURRENT_TIMESTAMP WHERE id = @Id;";
        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", userId);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<bool> UpdatePasswordAsync(int userId, string passwordHash, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = "UPDATE users SET passwordhash = @PasswordHash, updatedat = CURRENT_TIMESTAMP WHERE id = @Id;";
        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", userId);
        cmd.Parameters.AddWithValue("@PasswordHash", passwordHash);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<bool> DeleteUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            DELETE FROM usermenupermissions WHERE userid = @Id;
            DELETE FROM users WHERE id = @Id;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", userId);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<List<int>> GetDownlineUserIdsAsync(int parentId, CancellationToken cancellationToken = default)
    {
        var list = new List<int>();
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = @"
            WITH RECURSIVE usertree AS (
                SELECT id FROM users WHERE parentuserid = @ParentUserId
                UNION ALL
                SELECT u.id FROM users u
                INNER JOIN usertree t ON u.parentuserid = t.id
            )
            SELECT id FROM usertree;";

        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@ParentUserId", parentId);

        await using var dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(Convert.ToInt32(dr["id"]));
        }
        return list;
    }

    public async Task<bool> ExistsByUsernameOrEmailAsync(string username, string email, CancellationToken cancellationToken = default)
    {
        await using var con = new NpgsqlConnection(_connection);
        await con.OpenAsync(cancellationToken);

        const string query = "SELECT COUNT(1) FROM users WHERE username = @Username OR email = @Email;";
        await using var cmd = new NpgsqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Username", username);
        cmd.Parameters.AddWithValue("@Email", email);

        var result = await cmd.ExecuteScalarAsync(cancellationToken);
        return Convert.ToInt32(result) > 0;
    }

    private static AppUser MapUser(NpgsqlDataReader dr)
    {
        return new AppUser
        {
            Id = Convert.ToInt32(dr["id"]),
            Username = Convert.ToString(dr["username"]) ?? string.Empty,
            Email = Convert.ToString(dr["email"]) ?? string.Empty,
            PasswordHash = Convert.ToString(dr["passwordhash"]) ?? string.Empty,
            FullName = Convert.ToString(dr["fullname"]) ?? string.Empty,
            PhoneNumber = dr["phonenumber"] == DBNull.Value ? null : Convert.ToString(dr["phonenumber"]),
            Role = (UserRole)Convert.ToInt32(dr["role"]),
            ParentUserId = dr["parentuserid"] == DBNull.Value ? null : Convert.ToInt32(dr["parentuserid"]),
            IsActive = Convert.ToBoolean(dr["isactive"]),
            VoiceCredits = Convert.ToDecimal(dr["voicecredits"]),
            WhatsAppCredits = Convert.ToDecimal(dr["whatsappcredits"]),
            RcsCredits = Convert.ToDecimal(dr["rcscredits"]),
            SmsCredits = Convert.ToDecimal(dr["smscredits"]),
            CreatedAt = Convert.ToDateTime(dr["createdat"]),
            UpdatedAt = Convert.ToDateTime(dr["updatedat"])
        };
    }
}
