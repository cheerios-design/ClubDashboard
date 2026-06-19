// Models/TaskStatus.cs
namespace ClubDashboard.Api.Models;

/// <summary>
/// Represents the workflow status of a task.
/// </summary>
public enum TaskStatus
{
    /// <summary>
    /// The task has not started yet.
    /// </summary>
    ToDo = 0,

    /// <summary>
    /// The task is currently in progress.
    /// </summary>
    InProgress = 1,

    /// <summary>
    /// The task has been completed.
    /// </summary>
    Done = 2
}