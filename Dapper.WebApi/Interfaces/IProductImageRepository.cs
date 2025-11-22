using Dapper.WebApi.Models;

namespace Dapper.WebApi.Interfaces
{
    public interface IProductImageRepository
    {
        /// <summary>
        /// Get all images for a product
        /// </summary>
        Task<IEnumerable<ProductImage>> GetImagesByProductIdAsync(int productId);

        /// <summary>
        /// Get image by ID
        /// </summary>
        Task<ProductImage?> GetImageByIdAsync(int id);

        /// <summary>
        /// Get main image for a product
        /// </summary>
        Task<ProductImage?> GetMainImageByProductIdAsync(int productId);

        /// <summary>
        /// Create new product image
        /// </summary>
        Task<int> CreateImageAsync(ProductImage image);

        /// <summary>
        /// Update product image metadata
        /// </summary>
        Task<bool> UpdateImageAsync(ProductImage image);

        /// <summary>
        /// Set image as main (and unset others)
        /// </summary>
        Task<bool> SetMainImageAsync(int imageId, int productId);

        /// <summary>
        /// Delete product image
        /// </summary>
        Task<bool> DeleteImageAsync(int id);

        /// <summary>
        /// Delete all images for a product
        /// </summary>
        Task<bool> DeleteImagesByProductIdAsync(int productId);

        /// <summary>
        /// Check if image exists
        /// </summary>
        Task<bool> ImageExistsAsync(int id);
    }
}