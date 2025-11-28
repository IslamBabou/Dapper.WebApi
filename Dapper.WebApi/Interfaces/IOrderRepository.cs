public interface IOrderRepository
{
    Task<int> CreateOrderAsync(Order order);

    Task<IEnumerable<Order>> GetAllOrdersAsync();

    Task<Order?> GetOrderByIdAsync(int id);

    Task<IEnumerable<Order>> GetOrdersByUserAsync(int userId);
}