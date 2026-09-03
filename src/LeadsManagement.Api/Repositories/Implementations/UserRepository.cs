using System;
using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using LeadsManagement.Api.Helpers;
using LeadsManagement.Api.Models.Entities;
using LeadsManagement.Api.Models.Enums;
using LeadsManagement.Api.Repositories.Interfaces;

namespace LeadsManagement.Api.Repositories.Implementations;

public class UserRepository : IUserRepository
{
    private readonly string _Connection;

    public UserRepository(DbConnectionHelpers Helpers)
    {
        _Connection = Helpers.Getdbconnection();
    }

    public async Task<AppUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_GetUserByUsername", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Username", username);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapUser(dr);
        }
        return null;
    }

    public async Task<AppUser?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_GetUserById", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Id", id);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await dr.ReadAsync(cancellationToken))
        {
            return MapUser(dr);
        }
        return null;
    }

    public async Task<List<AppUser>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        var list = new List<AppUser>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_GetAllUsers", con)
        {
            CommandType = CommandType.StoredProcedure
        };

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(MapUser(dr));
        }
        return list;
    }

    public async Task<List<AppUser>> GetSubordinateUsersAsync(int parentUserId, CancellationToken cancellationToken = default)
    {
        var list = new List<AppUser>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_GetSubordinateUsers", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@ParentUserId", parentUserId);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(MapUser(dr));
        }
        return list;
    }

    public async Task<int> CreateUserAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_CreateUser", con)
        {
            CommandType = CommandType.StoredProcedure
        };
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

        object? result = await cmd.ExecuteScalarAsync(cancellationToken);
        return result != null && int.TryParse(result.ToString(), out int id) ? id : 0;
    }

    public async Task<bool> UpdateUserAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_UpdateUser", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Id", user.Id);
        cmd.Parameters.AddWithValue("@Email", user.Email);
        cmd.Parameters.AddWithValue("@FullName", user.FullName);
        cmd.Parameters.AddWithValue("@PhoneNumber", (object?)user.PhoneNumber ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@IsActive", user.IsActive);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<bool> UpdateCreditsAsync(int userId, decimal voice, decimal whatsapp, decimal rcs, decimal sms, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_UpdateUserCredits", con)
        {
            CommandType = CommandType.StoredProcedure
        };
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
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        using SqlCommand cmd = new SqlCommand("sp_UpdateLastLogin", con)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Id", userId);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<bool> UpdatePasswordAsync(int userId, string passwordHash, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "UPDATE [dbo].[Users] SET [PasswordHash] = @PasswordHash, [UpdatedAt] = GETUTCDATE() WHERE [Id] = @Id";
        using SqlCommand cmd = new SqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", userId);
        cmd.Parameters.AddWithValue("@PasswordHash", passwordHash);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<bool> DeleteUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        
        // Cascade delete permissions and user
        string query = @"
            DELETE FROM [dbo].[UserMenuPermissions] WHERE [UserId] = @Id;
            DELETE FROM [dbo].[Users] WHERE [Id] = @Id;
        ";
        using SqlCommand cmd = new SqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Id", userId);

        int rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    public async Task<List<int>> GetDownlineUserIdsAsync(int parentId, CancellationToken cancellationToken = default)
    {
        var list = new List<int>();
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);

        string query = @"
            WITH UserTree AS (
                SELECT Id FROM [dbo].[Users] WHERE ParentUserId = @ParentUserId
                UNION ALL
                SELECT u.Id FROM [dbo].[Users] u
                INNER JOIN UserTree t ON u.ParentUserId = t.Id
            )
            SELECT Id FROM UserTree;
        ";
        using SqlCommand cmd = new SqlCommand(query, con);
        cmd.Parameters.AddWithValue("@ParentUserId", parentId);

        using SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await dr.ReadAsync(cancellationToken))
        {
            list.Add(Convert.ToInt32(dr["Id"]));
        }
        return list;
    }

    public async Task<bool> ExistsByUsernameOrEmailAsync(string username, string email, CancellationToken cancellationToken = default)
    {
        using SqlConnection con = new SqlConnection(_Connection);
        await con.OpenAsync(cancellationToken);
        string query = "SELECT COUNT(1) FROM [dbo].[Users] WHERE [Username] = @Username OR [Email] = @Email";
        using SqlCommand cmd = new SqlCommand(query, con);
        cmd.Parameters.AddWithValue("@Username", username);
        cmd.Parameters.AddWithValue("@Email", email);

        object? result = await cmd.ExecuteScalarAsync(cancellationToken);
        return Convert.ToInt32(result) > 0;
    }

    private static AppUser MapUser(SqlDataReader dr)
    {
        return new AppUser
        {
            Id = Convert.ToInt32(dr["Id"]),
            Username = Convert.ToString(dr["Username"]) ?? string.Empty,
            Email = Convert.ToString(dr["Email"]) ?? string.Empty,
            PasswordHash = Convert.ToString(dr["PasswordHash"]) ?? string.Empty,
            FullName = Convert.ToString(dr["FullName"]) ?? string.Empty,
            PhoneNumber = dr["PhoneNumber"] == DBNull.Value ? null : Convert.ToString(dr["PhoneNumber"]),
            Role = (UserRole)Convert.ToInt32(dr["Role"]),
            ParentUserId = dr["ParentUserId"] == DBNull.Value ? null : Convert.ToInt32(dr["ParentUserId"]),
            IsActive = Convert.ToBoolean(dr["IsActive"]),
            VoiceCredits = Convert.ToDecimal(dr["VoiceCredits"]),
            WhatsAppCredits = Convert.ToDecimal(dr["WhatsAppCredits"]),
            RcsCredits = Convert.ToDecimal(dr["RcsCredits"]),
            SmsCredits = Convert.ToDecimal(dr["SmsCredits"]),
            CreatedAt = Convert.ToDateTime(dr["CreatedAt"]),
            UpdatedAt = Convert.ToDateTime(dr["UpdatedAt"])
        };
    }
}

