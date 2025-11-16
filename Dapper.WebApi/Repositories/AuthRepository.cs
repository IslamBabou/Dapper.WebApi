using Dapper;
using DapperWebApi.Interfaces;
using DapperWebApi.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DapperWebApi.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly IConfiguration _config;

    public AuthRepository(IConfiguration config)
    {
        _config = config;
    }

    private IDbConnection Connection =>
        new SqlConnection(_config.GetConnectionString("DefaultConnection"));

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        var sql = "SELECT * FROM Users WHERE Username = @Username";

        using var conn = Connection;
        return await conn.QueryFirstOrDefaultAsync<User>(sql, new { Username = username });
    }

    public async Task<bool> CreateUserAsync(User user)
    {
        var sql = @"
            INSERT INTO Users (Username, PasswordHash, Role)
            VALUES (@Username, @PasswordHash, @Role);";

        using var conn = Connection;
        return await conn.ExecuteAsync(sql, user) > 0;
    }
}