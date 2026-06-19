// Models/Role.cs
namespace ClubDashboard.Api.Models;

/// <summary>
/// Represents a club role that can be assigned to users.
/// </summary>
public class Role
{
    /// <summary>
    /// Gets or sets the unique identifier for the role.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the display title for the role.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the users assigned to this role.
    /// </summary>
    public ICollection<User> Users { get; set; } = new List<User>();
}