// Models/TaskItem.cs
namespace ClubDashboard.Api.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.ToDo;
    public int? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}