namespace FinalYearProject.Models
{
    public interface IUser
    {
        int Id { get; set; }
        string UserName { get; set; }
        string PasswordHash { get; set; }
        string Role { get; set; }
        string? FirstName { get; set; }
        string? LastName { get; set; }
        string? Email { get; set; }
        DateTime CreatedAt { get; set; }
        DateTime? UpdatedAt { get; set; }
    }
}