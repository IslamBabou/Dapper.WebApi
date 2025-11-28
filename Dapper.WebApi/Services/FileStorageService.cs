using System.Text.RegularExpressions;

namespace Dapper.WebApi.Services
{
    public interface IFileStorageService
    {
        Task<(string fileName, string url)> SaveFileAsync(IFormFile file, int productId);

        Task<bool> DeleteFileAsync(string fileName);

        bool IsValidImageFile(IFormFile file);
    }

    public class FileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private readonly string[] _allowedMimeTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };
        private const long MaxFileSize = 5_242_880; // 5MB

        public FileStorageService(IWebHostEnvironment environment, IConfiguration configuration)
        {
            _environment = environment;
            _configuration = configuration;
        }

        public async Task<(string fileName, string url)> SaveFileAsync(IFormFile file, int productId)
        {
            if (!IsValidImageFile(file))
            {
                throw new InvalidOperationException("Invalid file type or size");
            }

            // Create directory structure: wwwroot/uploads/products/{productId}
            var uploadFolder = Path.Combine(_environment.WebRootPath, "uploads", "products", productId.ToString());
            Directory.CreateDirectory(uploadFolder);

            // Generate unique filename
            var uniqueFileName = GenerateUniqueFileName(file.FileName);
            var filePath = Path.Combine(uploadFolder, uniqueFileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Generate URL
            var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:5119";
            var url = $"{baseUrl}/uploads/products/{productId}/{uniqueFileName}";

            return (uniqueFileName, url);
        }

        public async Task<bool> DeleteFileAsync(string fileName)
        {
            try
            {
                // Extract product ID and filename from URL or path
                var filePath = Path.Combine(_environment.WebRootPath, "uploads", "products");

                // Search for file in subdirectories
                var files = Directory.GetFiles(filePath, fileName, SearchOption.AllDirectories);

                foreach (var file in files)
                {
                    File.Delete(file);
                }

                return await Task.FromResult(true);
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool IsValidImageFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            // Check file size
            if (file.Length > MaxFileSize)
                return false;

            // Check extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
                return false;

            // Check MIME type
            if (!_allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
                return false;

            return true;
        }

        private string GenerateUniqueFileName(string originalFileName)
        {
            var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);

            // Sanitize filename
            nameWithoutExtension = Regex.Replace(nameWithoutExtension, @"[^a-zA-Z0-9-_]", "-");

            // Add timestamp and GUID for uniqueness
            var uniqueName = $"{nameWithoutExtension}-{DateTime.UtcNow.Ticks}-{Guid.NewGuid().ToString("N").Substring(0, 8)}{extension}";

            return uniqueName;
        }
    }
}