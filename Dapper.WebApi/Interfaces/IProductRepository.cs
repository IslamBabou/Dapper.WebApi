using DapperWebApi.DTO;
using DapperWebApi.Models;

namespace DapperWebApi.Interfaces;

public interface IProductRepository
{
    Task<int> CreateProductAsync(Product product);

    Task<Product?> GetProductByIdAsync(int id);

    Task<IEnumerable<Product>> GetAllProductsAsync();

    Task<bool> AddProductImageAsync(ProductImage img);

    Task UpdateProductAsync(int id,CreateProductDto product);
    Task<bool> ProductExistsAsync(int id);
    Task<bool> DeleteProductAsync(int id);
}