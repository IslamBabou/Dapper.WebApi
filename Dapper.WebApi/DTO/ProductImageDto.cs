namespace Dapper.WebApi.DTO
{
    /// <summary>
    /// DTO for uploading product image
    /// </summary>
    public class UploadProductImageDto
    {
        public int ProductId { get; set; }
        public IFormFile File { get; set; } = null!;
        public bool IsMain { get; set; } = false;
        public int SortOrder { get; set; } = 0;
    }

    /// <summary>
    /// DTO for updating product image metadata
    /// </summary>
    public class UpdateProductImageDto
    {
        public bool? IsMain { get; set; }
        public int? SortOrder { get; set; }
    }

    /// <summary>
    /// Response DTO for image upload
    /// </summary>
    public class ProductImageResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public bool IsMain { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}