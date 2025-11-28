using Dapper;
using DapperWebApi.Models;
using System.Data;

namespace DapperWebApi.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IDbConnection _db;

        public UserRepository(IDbConnection db)
        {
            _db = db;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            var sql = "SELECT * FROM Users";
            return await _db.QueryAsync<User>(sql);
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM Users WHERE Id = @Id";
            return await _db.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            var sql = "SELECT * FROM Users WHERE Username = @Username";
            return await _db.QuerySingleOrDefaultAsync<User>(sql, new { Username = username });
        }

        public async Task<bool> Exists(string username)
        {
            var sql = "SELECT COUNT(*) FROM Users WHERE Username = @Username";
            var count = await _db.ExecuteScalarAsync<int>(sql, new { Username = username });
            return count > 0;
        }

        public async Task UpdateUserAsync(User user)
        {
            using var conn = _db;

            var sql = @"UPDATE Users
                SET Username = @Username,
                    PasswordHash = @PasswordHash,
                    Email = @Email
                WHERE Id = @Id";

            await conn.ExecuteAsync(sql, user);
        }

        public async Task<int> CreateAsync(User user)
        {
            var sql = @"
                INSERT INTO Users (Username, PasswordHash, Email, Role)
                VALUES (@Username, @PasswordHash, @Email, @Role);
                SELECT CAST(SCOPE_IDENTITY() as int);
            ";

            return await _db.ExecuteScalarAsync<int>(sql, user);
        }

        public async Task DeleteAsync(int id)
        {
            var sql = "DELETE FROM Users WHERE Id = @Id";
            await _db.ExecuteAsync(sql, new { Id = id });
        }
    }
}