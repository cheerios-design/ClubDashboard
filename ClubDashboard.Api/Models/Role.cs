// Models/Role.cs
namespace ClubDashboard.Api.Models;

public class Role
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();
}