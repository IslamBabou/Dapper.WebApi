namespace DapperWebApi.DTO;

public class RegisterUserDto
{
    public string Username { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string Role { get; set; } = "Client";
}