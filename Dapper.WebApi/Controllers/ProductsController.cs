using DapperWebApi.DTO;
using DapperWebApi.Interfaces;
using DapperWebApi.Models;
using DapperWebApi.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DapperWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepo;

    public ProductsController(IProductRepository productRepo)
    {
        _productRepo = productRepo;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateProduct(CreateProductDto dto)
    {
        // get user id from JWT
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var productId = await _productRepo.CreateProductAsync(product);

        return Ok(new { Message = "Product created", ProductId = productId });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var deleted = await _productRepo.DeleteProductAsync(id);

        if (!deleted)
            return NotFound("Product not found");

        return Ok("Product deleted");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateProductDto dto)
    {
        if (!await _productRepo.ProductExistsAsync(id))
            return NotFound("Product does not exist");

        await _productRepo.UpdateProductAsync(id, dto);

        return Ok(new { message = "Product updated successfully" });
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _productRepo.GetProductByIdAsync(id);

        if (product == null)
            return NotFound("Product not found");

        return Ok(product);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        var products = await _productRepo.GetAllProductsAsync();
        return Ok(products);
    }
}