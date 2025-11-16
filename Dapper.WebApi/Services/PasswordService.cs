using DapperWebApi.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace DapperWebApi.Services
{
    public class PasswordService : IPasswordService
    {
        public string Hash(string password)
        {
            using var hmac = new HMACSHA512();
            var salt = Convert.ToBase64String(hmac.Key);
            var hash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));

            return $"{salt}:{hash}";
        }

        public bool Verify(string hash, string password)
        {
            var parts = hash.Split(':');

            if (parts.Length != 2)
                return false;

            var salt = Convert.FromBase64String(parts[0]);
            var storedHash = parts[1];

            using var hmac = new HMACSHA512(salt);
            var computedHash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));

            return storedHash == computedHash;
        }
    }
}