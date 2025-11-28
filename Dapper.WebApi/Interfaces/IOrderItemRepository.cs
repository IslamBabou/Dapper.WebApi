public interface IOrderItemRepository
{
    Task AddOrderItemsAsync(List<OrderItem> items);

    Task<IEnumerable<OrderItem>> GetItemsByOrderIdAsync(int orderId);
}