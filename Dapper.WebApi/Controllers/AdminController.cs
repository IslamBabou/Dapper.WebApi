using DapperWebApi.Interfaces;
using DapperWebApi.Models;
using DapperWebApi.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DapperWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserRepository _userRepo;
        private readonly IPasswordService _passwordService;
        private readonly JwtService _jwtService;

        public AdminController(IUserRepository userRepo, IPasswordService passwordService, JwtService jwtService)
        {
            _userRepo = userRepo;
            _passwordService = passwordService;
            _jwtService = jwtService;
        }

        // -----------------------------------------------------
        // 2) Create Admin (Admin only)
        // -----------------------------------------------------
        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin(CreateUserDto dto)
        {
            if (await _userRepo.Exists(dto.Username))
                return BadRequest("Username already exists.");

            var passwordHash = _passwordService.Hash(dto.Password);

            var admin = new User
            {
                Username = dto.Username,
                PasswordHash = passwordHash,
                Role = "Admin"
            };

            await _userRepo.CreateAsync(admin);

            return Ok("Admin created.");
        }

        // -----------------------------------------------------
        // 4) List all users (Admin only)
        // -----------------------------------------------------
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userRepo.GetAllAsync();
            return Ok(users);
        }

        // -----------------------------------------------------
        // 5) Delete user (Admin only)
        // -----------------------------------------------------
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);

            if (user == null)
                return NotFound("User not found.");

            await _userRepo.DeleteAsync(id);

            return Ok("User deleted.");
        }
    }
}