using System.Data;
using Dapper;
using DapperWebApi.Models;

public class OrderRepository : IOrderRepository
{
    private readonly IDbConnection _connection;

    public OrderRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<int> CreateOrderAsync(Order order)
    {
        string sql = @"
            INSERT INTO Orders
            (UserId, Wilaya, Commune, Street, PostalCode,
             TotalProductsPrice, ShippingPrice, TotalPrice, Status, CreatedAt)
            VALUES
            (@UserId, @Wilaya, @Commune, @Street, @PostalCode,
             @TotalProductsPrice, @ShippingPrice, @TotalPrice, @Status, @CreatedAt);
            
            SELECT CAST(SCOPE_IDENTITY() AS INT);
        ";

        var id = await _connection.ExecuteScalarAsync<int>(sql, order);
        return id;
    }

    public async Task<Order?> GetOrderByIdAsync(int id)
    {
        string sql = "SELECT * FROM Orders WHERE Id = @id";

        return await _connection.QueryFirstOrDefaultAsync<Order>(sql, new { id });
    }

    public async Task<IEnumerable<Order>> GetOrdersByUserAsync(int userId)
    {
        string sql = "SELECT * FROM Orders WHERE UserId = @userId ORDER BY CreatedAt DESC";

        return await _connection.QueryAsync<Order>(sql, new { userId });
    }
}
