using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Dapper.WebApi.Interfaces;
using Dapper.WebApi.Models;

namespace Dapper.WebApi.Repositories
{
    public class ProductImageRepository : IProductImageRepository
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;

        public ProductImageRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<IEnumerable<ProductImage>> GetImagesByProductIdAsync(int productId)
        {
            using var connection = CreateConnection();
            const string query = @"
                SELECT Id, ProductId, FileName, Url, IsMain, SortOrder, CreatedAt
                FROM ProductImages
                WHERE ProductId = @ProductId
                ORDER BY SortOrder ASC, CreatedAt ASC";

            return await connection.QueryAsync<ProductImage>(query, new { ProductId = productId });
        }

        public async Task<ProductImage?> GetImageByIdAsync(int id)
        {
            using var connection = CreateConnection();
            const string query = @"
                SELECT Id, ProductId, FileName, Url, IsMain, SortOrder, CreatedAt
                FROM ProductImages
                WHERE Id = @Id";

            return await connection.QueryFirstOrDefaultAsync<ProductImage>(query, new { Id = id });
        }

        public async Task<ProductImage?> GetMainImageByProductIdAsync(int productId)
        {
            using var connection = CreateConnection();
            const string query = @"
                SELECT TOP 1 Id, ProductId, FileName, Url, IsMain, SortOrder, CreatedAt
                FROM ProductImages
                WHERE ProductId = @ProductId AND IsMain = 1
                ORDER BY CreatedAt DESC";

            return await connection.QueryFirstOrDefaultAsync<ProductImage>(query, new { ProductId = productId });
        }

        public async Task<int> CreateImageAsync(ProductImage image)
        {
            using var connection = CreateConnection();
            const string query = @"
                INSERT INTO ProductImages (ProductId, FileName, Url, IsMain, SortOrder, CreatedAt)
                VALUES (@ProductId, @FileName, @Url, @IsMain, @SortOrder, @CreatedAt);
                SELECT CAST(SCOPE_IDENTITY() as int);";

            var parameters = new
            {
                ProductId = image.ProductId,
                FileName = image.FileName,
                Url = image.Url,
                IsMain = image.IsMain,
                SortOrder = image.SortOrder,
                CreatedAt = DateTime.UtcNow
            };

            return await connection.QuerySingleAsync<int>(query, parameters);
        }

        public async Task<bool> UpdateImageAsync(ProductImage image)
        {
            using var connection = CreateConnection();
            const string query = @"
                UPDATE ProductImages
                SET IsMain = @IsMain,
                    SortOrder = @SortOrder
                WHERE Id = @Id";

            var affectedRows = await connection.ExecuteAsync(query, new
            {
                Id = image.Id,
                IsMain = image.IsMain,
                SortOrder = image.SortOrder
            });

            return affectedRows > 0;
        }

        public async Task<bool> SetMainImageAsync(int imageId, int productId)
        {
            using var connection = CreateConnection();

            // Use transaction to ensure consistency
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                // First, unset all main images for this product
                const string unsetQuery = @"
                    UPDATE ProductImages 
                    SET IsMain = 0 
                    WHERE ProductId = @ProductId";

                await connection.ExecuteAsync(unsetQuery, new { ProductId = productId }, transaction);

                // Then set the specified image as main
                const string setQuery = @"
                    UPDATE ProductImages 
                    SET IsMain = 1 
                    WHERE Id = @ImageId AND ProductId = @ProductId";

                var affectedRows = await connection.ExecuteAsync(setQuery,
                    new { ImageId = imageId, ProductId = productId }, transaction);

                transaction.Commit();
                return affectedRows > 0;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<bool> DeleteImageAsync(int id)
        {
            using var connection = CreateConnection();
            const string query = "DELETE FROM ProductImages WHERE Id = @Id";

            var affectedRows = await connection.ExecuteAsync(query, new { Id = id });
            return affectedRows > 0;
        }

        public async Task<bool> DeleteImagesByProductIdAsync(int productId)
        {
            using var connection = CreateConnection();
            const string query = "DELETE FROM ProductImages WHERE ProductId = @ProductId";

            var affectedRows = await connection.ExecuteAsync(query, new { ProductId = productId });
            return affectedRows > 0;
        }

        public async Task<bool> ImageExistsAsync(int id)
        {
            using var connection = CreateConnection();
            const string query = "SELECT COUNT(1) FROM ProductImages WHERE Id = @Id";

            var count = await connection.ExecuteScalarAsync<int>(query, new { Id = id });
            return count > 0;
        }
    }
}