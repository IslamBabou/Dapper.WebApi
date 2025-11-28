using Dapper.WebApi.Dto;
using Dapper.WebApi.Models;
using Dapper.WebApi.Interfaces;
using Dapper.WebApi.Services;
using DapperWebApi.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dapper.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductImagesController : ControllerBase
    {
        private readonly IProductImageRepository _imageRepository;
        private readonly IProductRepository _productRepository;
        private readonly IFileStorageService _fileStorageService;

        public ProductImagesController(
            IProductImageRepository imageRepository,
            IProductRepository productRepository,
            IFileStorageService fileStorageService)
        {
            _imageRepository = imageRepository;
            _productRepository = productRepository;
            _fileStorageService = fileStorageService;
        }

        /// <summary>
        /// Get all images for a product
        /// </summary>
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetProductImages(int productId)
        {
            try
            {
                var images = await _imageRepository.GetImagesByProductIdAsync(productId);
                return Ok(images);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching product images", error = ex.Message });
            }
        }

        /// <summary>
        /// Get main image for a product
        /// </summary>
        [HttpGet("product/{productId}/main")]
        public async Task<IActionResult> GetMainImage(int productId)
        {
            try
            {
                var image = await _imageRepository.GetMainImageByProductIdAsync(productId);

                if (image == null)
                {
                    return NotFound(new { message = "No main image found for this product" });
                }

                return Ok(image);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching main image", error = ex.Message });
            }
        }

        /// <summary>
        /// Get image by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetImageById(int id)
        {
            try
            {
                var image = await _imageRepository.GetImageByIdAsync(id);

                if (image == null)
                {
                    return NotFound(new { message = "Image not found" });
                }

                return Ok(image);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching image", error = ex.Message });
            }
        }

        /// <summary>
        /// Upload product image (Admin only)
        /// </summary>
        [HttpPost("upload")]
        [Authorize(Roles = "Admin")]
        [RequestSizeLimit(5_242_880)] // 5MB
        public async Task<IActionResult> UploadImage([FromForm] UploadProductImageDto dto)
        {
            try
            {
                // Validate product exists
                var product = await _productRepository.GetProductByIdAsync(dto.ProductId);
                if (product == null)
                {
                    return NotFound(new { message = "Product not found" });
                }

                // Validate file
                if (!_fileStorageService.IsValidImageFile(dto.File))
                {
                    return BadRequest(new { message = "Invalid image file. Allowed: JPG, PNG, GIF, WEBP (max 5MB)" });
                }

                // Save file
                var (fileName, url) = await _fileStorageService.SaveFileAsync(dto.File, dto.ProductId);

                // If this should be main image, unset others first
                if (dto.IsMain)
                {
                    await _imageRepository.SetMainImageAsync(0, dto.ProductId); // Unset all
                }

                // Save to database
                var productImage = new ProductImage
                {
                    ProductId = dto.ProductId,
                    FileName = fileName,
                    Url = url,
                    IsMain = dto.IsMain,
                    SortOrder = dto.SortOrder,
                    CreatedAt = DateTime.UtcNow
                };

                var imageId = await _imageRepository.CreateImageAsync(productImage);
                productImage.Id = imageId;

                return Ok(new
                {
                    message = "Image uploaded successfully",
                    image = productImage
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error uploading image", error = ex.Message });
            }
        }

        /// <summary>
        /// Update image metadata (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateImage(int id, [FromBody] UpdateProductImageDto dto)
        {
            try
            {
                var existingImage = await _imageRepository.GetImageByIdAsync(id);
                if (existingImage == null)
                {
                    return NotFound(new { message = "Image not found" });
                }

                // Update fields if provided
                if (dto.IsMain.HasValue)
                {
                    existingImage.IsMain = dto.IsMain.Value;

                    // If setting as main, unset others
                    if (dto.IsMain.Value)
                    {
                        await _imageRepository.SetMainImageAsync(id, existingImage.ProductId);
                    }
                }

                if (dto.SortOrder.HasValue)
                {
                    existingImage.SortOrder = dto.SortOrder.Value;
                }

                var success = await _imageRepository.UpdateImageAsync(existingImage);

                if (!success)
                {
                    return StatusCode(500, new { message = "Failed to update image" });
                }

                return Ok(new
                {
                    message = "Image updated successfully",
                    image = existingImage
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating image", error = ex.Message });
            }
        }

        /// <summary>
        /// Set image as main (Admin only)
        /// </summary>
        [HttpPatch("{id}/set-main")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SetMainImage(int id)
        {
            try
            {
                var image = await _imageRepository.GetImageByIdAsync(id);
                if (image == null)
                {
                    return NotFound(new { message = "Image not found" });
                }

                var success = await _imageRepository.SetMainImageAsync(id, image.ProductId);

                if (!success)
                {
                    return StatusCode(500, new { message = "Failed to set main image" });
                }

                return Ok(new { message = "Main image set successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error setting main image", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete image (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            try
            {
                var image = await _imageRepository.GetImageByIdAsync(id);
                if (image == null)
                {
                    return NotFound(new { message = "Image not found" });
                }

                // Delete from database
                var success = await _imageRepository.DeleteImageAsync(id);

                if (!success)
                {
                    return StatusCode(500, new { message = "Failed to delete image from database" });
                }

                // Delete physical file (best effort)
                await _fileStorageService.DeleteFileAsync(image.FileName);

                return Ok(new { message = "Image deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting image", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete all images for a product (Admin only)
        /// </summary>
        [HttpDelete("product/{productId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProductImages(int productId)
        {
            try
            {
                // Get all images first
                var images = await _imageRepository.GetImagesByProductIdAsync(productId);

                // Delete from database
                var success = await _imageRepository.DeleteImagesByProductIdAsync(productId);

                if (!success)
                {
                    return StatusCode(500, new { message = "Failed to delete images" });
                }

                // Delete physical files (best effort)
                foreach (var image in images)
                {
                    await _fileStorageService.DeleteFileAsync(image.FileName);
                }

                return Ok(new { message = $"Deleted {images.Count()} images successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting images", error = ex.Message });
            }
        }
    }
}