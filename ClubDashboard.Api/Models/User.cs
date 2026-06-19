// Models/User.cs
namespace ClubDashboard.Api.Models;

/// <summary>
/// Represents a club member who can be assigned tasks and linked to a role.
/// </summary>
public class User
{
    /// <summary>
    /// Gets or sets the unique identifier for the user.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the user's full name.
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the foreign key for the user's role.
    /// </summary>
    public int RoleId { get; set; }

    /// <summary>
    /// Gets or sets the role assigned to the user.
    /// </summary>
    public Role? Role { get; set; }

    /// <summary>
    /// Gets or sets the tasks assigned to the user.
    /// </summary>
    public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
}