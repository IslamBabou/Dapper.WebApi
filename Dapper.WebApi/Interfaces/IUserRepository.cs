using DapperWebApi.Models;

namespace DapperWebApi.Repositories
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();

        Task<User?> GetByIdAsync(int id);

        Task<User?> GetByUsernameAsync(string username);

        Task<bool> Exists(string username);

        Task<int> CreateAsync(User dto);

        Task UpdateUserAsync(User user);

        Task DeleteAsync(int id);
    }
}