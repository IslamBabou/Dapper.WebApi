public class OrderDto
{
    public int Id { get; set; }
    public int UserId { get; set; }

    // Address
    public string Wilaya { get; set; } = null!;
    public string Commune { get; set; } = null!;

    // Pricing
    public decimal TotalProductsPrice { get; set; }
    public decimal ShippingPrice { get; set; }
    public decimal TotalPrice { get; set; }

    // Status
    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    // Items
    public List<OrderItemDto> Items { get; set; } = new();
}
