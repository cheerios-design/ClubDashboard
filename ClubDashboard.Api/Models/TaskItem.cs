// Models/TaskItem.cs
namespace ClubDashboard.Api.Models;

/// <summary>
/// Represents a task card tracked on the club dashboard.
/// </summary>
public class TaskItem
{
    /// <summary>
    /// Gets or sets the unique identifier for the task.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the task title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional task description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the current task status.
    /// </summary>
    public TaskStatus Status { get; set; } = TaskStatus.ToDo;

    /// <summary>
    /// Gets or sets the optional foreign key for the assigned user.
    /// </summary>
    public int? AssignedUserId { get; set; }

    /// <summary>
    /// Gets or sets the assigned user navigation property.
    /// </summary>
    public User? AssignedUser { get; set; }

    /// <summary>
    /// Gets or sets the UTC creation timestamp for the task.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}