using DapperWebApi.DTO;
using DapperWebApi.Interfaces;
using DapperWebApi.Models;
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
        var userId = int.Parse(User.FindFirstValue("id")!);

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