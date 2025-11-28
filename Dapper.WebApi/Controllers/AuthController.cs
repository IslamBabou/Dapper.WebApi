using DapperWebApi.Interfaces;
using DapperWebApi.Models;
using DapperWebApi.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace DapperWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordService _passwordService;
        private readonly JwtService _jwtService;

        public AuthController(IUserRepository userRepository, IPasswordService passwordService, JwtService jwtService)
        {
            _userRepository = userRepository;
            _passwordService = passwordService;
            _jwtService = jwtService;
        }

        // -----------------------------------------------------
        // LOGIN ENDPOINT
        // -----------------------------------------------------
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            // 1️⃣ Find user by username
            var user = await _userRepository.GetByUsernameAsync(dto.Username);
            if (user == null)
                return Unauthorized("Invalid credentials");

            // 2️⃣ Verify password using PasswordService
            if (!_passwordService.Verify(user.PasswordHash, dto.Password))
                return Unauthorized("Invalid credentials");

            // 3️⃣ Generate JWT token
            var token = _jwtService.GenerateToken(user);

            // 4️⃣ Return token
            return Ok(new
            {
                username = user.Username,
                role = user.Role,
                token
            });
        }

        // -----------------------------------------------------
        // 3) Register User
        // -----------------------------------------------------
        [HttpPost("register")]
        public async Task<IActionResult> Register(CreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if username already exists
            var existingUser = await _userRepository.GetByUsernameAsync(dto.Username);
            if (existingUser != null)
                return BadRequest(new { message = "Username already taken" });

            // Hash the password
            var hashedPassword = _passwordService.Hash(dto.Password);

            // Create user entity
            var newUser = new User
            {
                Username = dto.Username,
                PasswordHash = hashedPassword,
                Role = "User", // default
            };

            // Save user
            var createdUserId = await _userRepository.CreateAsync(newUser);

            // Load user with ID (to use correct values)
            var savedUser = await _userRepository.GetByIdAsync(createdUserId);

            // Generate JWT token
            var token = _jwtService.GenerateToken(savedUser!);

            return Ok(new
            {
                message = "User registered successfully",
                user = new
                {
                    id = savedUser!.Id,
                    username = savedUser.Username,
                    role = savedUser.Role
                },
                token
            });
        }
    }
}