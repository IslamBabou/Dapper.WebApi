using DapperWebApi.Models;

namespace DapperWebApi.Interfaces;

public interface IAuthRepository
{
    Task<User?> GetUserByUsernameAsync(string username);

    Task<bool> CreateUserAsync(User user);
}