using System.Data;
using Dapper;
using DapperWebApi.Models;

public class OrderItemRepository : IOrderItemRepository
{
    private readonly IDbConnection _connection;

    public OrderItemRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task AddOrderItemsAsync(List<OrderItem> items)
    {
        string sql = @"
            INSERT INTO OrderItems
            (OrderId, ProductId, Quantity, UnitPrice, TotalPrice)
            VALUES
            (@OrderId, @ProductId, @Quantity, @UnitPrice, @TotalPrice);
        ";

        await _connection.ExecuteAsync(sql, items);
    }

    public async Task<IEnumerable<OrderItem>> GetItemsByOrderIdAsync(int orderId)
    {
        string sql = "SELECT * FROM OrderItems WHERE OrderId = @orderId";

        return await _connection.QueryAsync<OrderItem>(sql, new { orderId });
    }
}
