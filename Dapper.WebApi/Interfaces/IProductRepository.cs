using DapperWebApi.Models;

namespace DapperWebApi.Interfaces;

public interface IProductRepository
{
    Task<int> CreateProductAsync(Product product);

    Task<Product?> GetProductByIdAsync(int id);

    Task<IEnumerable<Product>> GetAllProductsAsync();

    Task<bool> AddProductImageAsync(ProductImage img);

    Task<bool> ProductExistsAsync(int id);
}