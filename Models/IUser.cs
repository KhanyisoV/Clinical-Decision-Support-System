
namespace FinalYearProject.Models
{
    public interface IUser
    {
        string UserName { get; set; }
        string PasswordHash { get; set; }
        string Role { get; set; }
    }
}