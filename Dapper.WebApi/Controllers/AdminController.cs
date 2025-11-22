using DapperWebApi.DTO;
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
        [Authorize(Roles = "Admin")]
        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin(CreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check for duplicate username
            if (await _userRepo.Exists(dto.Username))
                return BadRequest(new { message = "Username already exists." });

            // Hash password
            var passwordHash = _passwordService.Hash(dto.Password);

            // Create admin entity
            var admin = new User
            {
                Username = dto.Username,
                PasswordHash = passwordHash,
                Email = dto.Email,
                Role = "Admin",
            };

            // Insert in DB and get ID
            var adminId = await _userRepo.CreateAsync(admin);

            // Fetch the user from DB after insert
            var newAdmin = await _userRepo.GetByIdAsync(adminId);

            return Ok(new
            {
                message = "Admin created successfully",
                admin = new
                {
                    id = newAdmin!.Id,
                    username = newAdmin.Username,
                    role = newAdmin.Role
                }
            });
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


        [Authorize(Roles = "Admin")]        
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
         // Validate input
         if (string.IsNullOrWhiteSpace(dto.Username) ||
             string.IsNullOrWhiteSpace(dto.Email))
         {
             return BadRequest(new { message = "Username and email are required" });
         }

         // Check if user exists
         var existingUser = await _userRepo.GetByIdAsync(id);
         if (existingUser == null)
         {
             return NotFound(new { message = $"User with ID {id} not found" });
         }

         // Check if new username is already taken by another user
         if (dto.Username != existingUser.Username)
         {
             var userWithSameUsername = await _userRepo.GetByUsernameAsync(dto.Username);
             if (userWithSameUsername != null && userWithSameUsername.Id != id)
             {
                 return BadRequest(new { message = "Username already exists" });
             }
         }

         // Prepare updated user
         var updatedUser = new User
         {
             Id = id,
             Username = dto.Username,
             Email = dto.Email,
             Role = existingUser.Role // Keep existing role
         };

         // Only update password if provided (not empty)
         if (!string.IsNullOrWhiteSpace(dto.Password))
         {
             var hashedPassword = _passwordService.Hash(dto.Password);
             updatedUser.PasswordHash = hashedPassword;
         }
         else
         {
             // Keep existing password
             updatedUser.PasswordHash = existingUser.PasswordHash;
         }
         try
         {
             await _userRepo.UpdateUserAsync(updatedUser);
             return Ok(new
             {
                 message = "User updated successfully",
                 userId = id,
                 username = updatedUser.Username,
                 email = updatedUser.Email
             });

         }
         catch (Exception)
         {

             return StatusCode(500, new { message = "Failed to update user" });
         }
        
        }



        // -----------------------------------------------------
        // 6) Delete user (Admin only)
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