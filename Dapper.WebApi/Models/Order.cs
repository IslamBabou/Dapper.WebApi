public class Order
{
    public int Id { get; set; }

    // User
    public int UserId { get; set; }

    // Address fields
    public string Wilaya { get; set; } = null!;

    public string Commune { get; set; } = null!;

    // Pricing
    public decimal TotalProductsPrice { get; set; }

    public decimal ShippingPrice { get; set; }
    public decimal TotalPrice { get; set; }

    // Status
    public string Status { get; set; } = "Pending"; // Pending, Paid, Shipped...

    // Dates
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}