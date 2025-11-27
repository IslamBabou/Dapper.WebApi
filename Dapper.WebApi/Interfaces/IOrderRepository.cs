using Dapper;
using DapperWebApi.Models;
using DapperWebApi.DTO;

public interface IOrderRepository
{
    Task<int> CreateOrderAsync(Order order);
    Task<Order?> GetOrderByIdAsync(int id);
    Task<IEnumerable<Order>> GetOrdersByUserAsync(int userId);
}
