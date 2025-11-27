public class CreateOrderDto
{
    public int UserId { get; set; }

    // Products coming from basket
    public List<CreateOrderItemDto> Items { get; set; } = new();

    // Address inside order
    public string Wilaya { get; set; } = null!;
    public string Commune { get; set; } = null!;

    // Shipping
    public decimal ShippingPrice { get; set; }
}
