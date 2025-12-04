using System.Linq;
using CatalogOrders.Domain.Enums;

namespace CatalogOrders.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Customer Customer { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public Order()
    {
        Status = OrderStatus.CREATED;
        CreatedAt = DateTime.UtcNow;
        TotalAmount = 0;
    }

    public void CalculateTotal()
    {
        TotalAmount = OrderItems.Sum(item => item.LineTotal);
    }
}

