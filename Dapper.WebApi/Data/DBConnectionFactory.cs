using Microsoft.Data.SqlClient;
using System.Data;

namespace DapperWebApi.Data
{
    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly IConfiguration _configuration;

        public DbConnectionFactory(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IDbConnection CreateConnection()
        {
            var connStr = _configuration.GetConnectionString("DefaultConnection");
            return new SqlConnection(connStr);
        }
    }
}