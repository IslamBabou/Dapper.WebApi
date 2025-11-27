using Dapper;
using System.Data;
using DapperWebApi.Interfaces;

public class BasketRepository : IBasketRepository
{
    private readonly IDbConnection _db;

    public BasketRepository(IDbConnection db)
    {
        _db = db;
    }

    public async Task<int> GetOrCreateBasketIdAsync(int userId)
    {
        var existing = await _db.ExecuteScalarAsync<int?>(
            "SELECT Id FROM Basket WHERE UserId = @UserId",
            new { userId }
        );

        if (existing.HasValue)
            return existing.Value;

        return await _db.ExecuteScalarAsync<int>(
            @"INSERT INTO Basket (UserId) VALUES (@UserId);
              SELECT SCOPE_IDENTITY();",
            new { userId }
        );
    }

    public async Task AddItemAsync(int basketId, int productId, int quantity)
    {
        var sql = @"MERGE BasketItems AS t
                    USING (SELECT @BasketId AS BasketId, @ProductId AS ProductId) AS src
                    ON t.BasketId = src.BasketId AND t.ProductId = src.ProductId
                    WHEN MATCHED THEN 
                        UPDATE SET Quantity = Quantity + @Quantity
                    WHEN NOT MATCHED THEN
                        INSERT (BasketId, ProductId, Quantity)
                        VALUES (@BasketId, @ProductId, @Quantity);";

        await _db.ExecuteAsync(sql, new { basketId, productId, quantity });
    }

    public async Task<IEnumerable<dynamic>> GetBasketItemsAsync(int basketId)
    {
        return await _db.QueryAsync(
            @"SELECT bi.Id, bi.Quantity, p.Id AS ProductId, p.Name, p.Price
              FROM BasketItems bi
              JOIN Products p ON p.Id = bi.ProductId
              WHERE bi.BasketId = @basketId",
            new { basketId }
        );
    }

    public async Task ClearBasketAsync(int basketId)
    {
        await _db.ExecuteAsync("DELETE FROM BasketItems WHERE BasketId = @basketId", new { basketId });
    }
}
