public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public int ProductId { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }   // snapshot of price at time of order
    public decimal TotalPrice { get; set; }  // Quantity * UnitPrice
}
