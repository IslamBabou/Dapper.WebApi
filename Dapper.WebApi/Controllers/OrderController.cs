using DapperWebApi.DTO;
using DapperWebApi.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DapperWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _orderRepo;
        private readonly IOrderItemRepository _orderItemRepo;
        private readonly IBasketRepository _basketRepo;
        private readonly IProductRepository _productRepo;

        public OrdersController(
            IOrderRepository orderRepo,
            IOrderItemRepository orderItemRepo,
            IBasketRepository basketRepo,
            IProductRepository productRepo)
        {
            _orderRepo = orderRepo;
            _orderItemRepo = orderItemRepo;
            _basketRepo = basketRepo;
            _productRepo = productRepo;
        }

        // POST: api/orders/checkout
        [Authorize]
        [HttpPost("checkout")]
        public async Task<ActionResult<OrderDto>> Checkout([FromBody] CheckoutDto checkoutDto)
        {
            try
            {
                // Get userId from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                // Get or create basket
                var basketId = await _basketRepo.GetOrCreateBasketIdAsync(userId);

                // Get basket items
                var basketItems = await _basketRepo.GetBasketItemsAsync(basketId);
                var itemsList = basketItems.ToList();

                if (!itemsList.Any())
                {
                    return BadRequest(new { message = "Basket is empty" });
                }

                // Calculate totals and prepare order items
                decimal totalProductsPrice = 0;
                var orderItems = new List<OrderItem>();

                foreach (var item in itemsList)
                {
                    var product = await _productRepo.GetProductByIdAsync((int)item.ProductId);

                    if (product == null)
                    {
                        return BadRequest(new { message = $"Product with ID {item.ProductId} not found" });
                    }

                    decimal itemTotal = product.Price * item.Quantity;
                    totalProductsPrice += itemTotal;

                    orderItems.Add(new OrderItem
                    {
                        ProductId = product.Id,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price,
                        TotalPrice = itemTotal
                    });
                }

                decimal totalPrice = totalProductsPrice + checkoutDto.ShippingPrice;

                // Create order
                var order = new Order
                {
                    UserId = userId,
                    Wilaya = checkoutDto.Wilaya,
                    Commune = checkoutDto.Commune,
                    TotalProductsPrice = totalProductsPrice,
                    ShippingPrice = checkoutDto.ShippingPrice,
                    TotalPrice = totalPrice,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                var orderId = await _orderRepo.CreateOrderAsync(order);

                // Add order items
                foreach (var item in orderItems)
                {
                    item.OrderId = orderId;
                }
                await _orderItemRepo.AddOrderItemsAsync(orderItems);

                // Clear basket
                await _basketRepo.ClearBasketAsync(basketId);

                // Return response
                return Ok(new OrderDto
                {
                    Id = orderId,
                    UserId = userId,
                    Wilaya = order.Wilaya,
                    Commune = order.Commune,
                    TotalProductsPrice = order.TotalProductsPrice,
                    ShippingPrice = order.ShippingPrice,
                    TotalPrice = order.TotalPrice,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt,
                    Items = orderItems.Select(oi => new OrderItemDto
                    {
                        ProductId = oi.ProductId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Checkout failed", error = ex.Message });
            }
        }

        // GET: api/orders/{id}
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var order = await _orderRepo.GetOrderByIdAsync(id);
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            // Ensure user can only access their own orders
            if (order.UserId != userId)
            {
                return Forbid();
            }

            var items = await _orderItemRepo.GetItemsByOrderIdAsync(id);

            return Ok(new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                Wilaya = order.Wilaya,
                Commune = order.Commune,
                TotalProductsPrice = order.TotalProductsPrice,
                ShippingPrice = order.ShippingPrice,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                Items = items.Select(oi => new OrderItemDto
                {
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.TotalPrice
                }).ToList()
            });
        }

        // GET: api/orders/my-orders
        [Authorize]
        [HttpGet("my-orders")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetMyOrders()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var orders = await _orderRepo.GetOrdersByUserAsync(userId);
            var orderDtos = new List<OrderDto>();

            foreach (var order in orders)
            {
                var items = await _orderItemRepo.GetItemsByOrderIdAsync(order.Id);

                orderDtos.Add(new OrderDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    Wilaya = order.Wilaya,
                    Commune = order.Commune,
                    TotalProductsPrice = order.TotalProductsPrice,
                    ShippingPrice = order.ShippingPrice,
                    TotalPrice = order.TotalPrice,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt,
                    Items = items.Select(oi => new OrderItemDto
                    {
                        ProductId = oi.ProductId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList()
                });
            }

            return Ok(orderDtos);
        }

        // GET: api/orders/all (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetAllOrders()
        {
            var orders = await _orderRepo.GetAllOrdersAsync();
            return Ok(orders);
        }
    }
}