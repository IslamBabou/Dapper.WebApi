namespace DapperWebApi.Models;

public class ProductImage
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string FileName { get; set; } = default!;
    public string? Url { get; set; }
    public string? RelativePath { get; set; }
    public bool IsMain { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}