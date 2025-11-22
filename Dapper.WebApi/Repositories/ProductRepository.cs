using Dapper;
using DapperWebApi.Interfaces;
using DapperWebApi.Models;
using DapperWebApi.DTO;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper.WebApi.Models;

namespace DapperWebApi.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly IConfiguration _config;

    public ProductRepository(IConfiguration config)
    {
        _config = config;
    }

    private IDbConnection Connection =>
        new SqlConnection(_config.GetConnectionString("DefaultConnection"));

    public async Task<int> CreateProductAsync(Product product)
    {
        var sql = @"
            INSERT INTO Products (Name, Description, Price, CreatedByUserId)
            VALUES (@Name, @Description, @Price, @CreatedByUserId);
            SELECT CAST(SCOPE_IDENTITY() as int)";

        using var conn = Connection;
        return await conn.ExecuteScalarAsync<int>(sql, product);
    }

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        var sql = "SELECT * FROM Products WHERE Id = @Id";

        using var conn = Connection;
        var product = await conn.QueryFirstOrDefaultAsync<Product>(sql, new { Id = id });

        if (product is null) return null;

        var imagesSql = "SELECT * FROM ProductImages WHERE ProductId = @Id ORDER BY SortOrder";
        var images = await conn.QueryAsync<ProductImage>(imagesSql, new { Id = id });

        product.Images = images.ToList();
        return product;
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync()
    {
        var sql = "SELECT * FROM Products WHERE IsActive = 1";

        using var conn = Connection;
        return await conn.QueryAsync<Product>(sql);
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        using var conn = Connection;

        // Use your existing exists method
        if (!await ProductExistsAsync(id))
            return false;

        var sql = "DELETE FROM Products WHERE Id = @Id";
        await conn.ExecuteAsync(sql, new { Id = id });

        return true;
    }


    public async Task<bool> AddProductImageAsync(ProductImage img)
    {
        var sql = @"
            INSERT INTO ProductImages
            (ProductId, FileName, Url, RelativePath, IsMain, SortOrder)
            VALUES (@ProductId, @FileName, @Url, @RelativePath, @IsMain, @SortOrder);";

        using var conn = Connection;
        var rows = await conn.ExecuteAsync(sql, img);
        return rows > 0;
    }
    public async Task UpdateProductAsync(int id, CreateProductDto dto)
    {
        using var conn = Connection;

        var sql = @"UPDATE Products 
                SET Name = @Name,
                    Description = @Description,
                    Price = @Price
                WHERE Id = @Id";

        await conn.ExecuteAsync(sql, new
        {
            Id = id,
            dto.Name,
            dto.Description,
            dto.Price
        });
    }


    public async Task<bool> ProductExistsAsync(int id)
    {
        var sql = "SELECT COUNT(1) FROM Products WHERE Id = @Id";
        using var conn = Connection;
        return await conn.ExecuteScalarAsync<int>(sql, new { Id = id }) > 0;
    }
}