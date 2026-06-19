// Controllers/TasksController.cs
using ClubDashboard.Api.Data;
using ClubDashboard.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
/// <summary>
/// Handles task CRUD operations for the club dashboard API.
/// </summary>
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TasksController> _logger;

    public TasksController(AppDbContext context, ILogger<TasksController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets all tasks including their assigned users.
    /// </summary>
    /// <returns>A collection of tasks or a server error response.</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        try
        {
            var tasks = await _context.TaskItems
                .Include(t => t.AssignedUser)
                .ToListAsync();

            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve tasks.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred while retrieving tasks." });
        }
    }

    /// <summary>
    /// Gets a single task by its identifier.
    /// </summary>
    /// <param name="id">The task identifier.</param>
    /// <returns>The requested task, a not found response, or a server error response.</returns>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {
        try
        {
            var task = await _context.TaskItems
                .Include(t => t.AssignedUser)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task is null)
            {
                return NotFound(new { message = $"Task with ID {id} was not found." });
            }

            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve task with ID {TaskId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred while retrieving the task." });
        }
    }

    /// <summary>
    /// Creates a new task.
    /// </summary>
    /// <param name="taskItem">The task payload to create.</param>
    /// <returns>The created task or an error response.</returns>
    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(TaskItem taskItem)
    {
        try
        {
            if (taskItem is null)
            {
                return BadRequest(new { message = "Task data is required." });
            }

            if (string.IsNullOrWhiteSpace(taskItem.Title))
            {
                return BadRequest(new { message = "Task title is required." });
            }

            taskItem.Id = 0;
            taskItem.CreatedAt = DateTime.UtcNow;

            _context.TaskItems.Add(taskItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTask), new { id = taskItem.Id }, taskItem);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error while creating a task.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "The task could not be created because of a database error." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while creating a task.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred while creating the task." });
        }
    }

    /// <summary>
    /// Updates an existing task.
    /// </summary>
    /// <param name="id">The task identifier from the route.</param>
    /// <param name="taskItem">The updated task payload.</param>
    /// <returns>No content on success or an error response.</returns>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTask(int id, TaskItem taskItem)
    {
        try
        {
            if (taskItem is null)
            {
                return BadRequest(new { message = "Task data is required." });
            }

            if (id != taskItem.Id)
            {
                return BadRequest(new { message = "The route ID does not match the task ID in the request body." });
            }

            if (string.IsNullOrWhiteSpace(taskItem.Title))
            {
                return BadRequest(new { message = "Task title is required." });
            }

            var existingTask = await _context.TaskItems.FindAsync(id);
            if (existingTask is null)
            {
                return NotFound(new { message = $"Task with ID {id} was not found." });
            }

            existingTask.Title = taskItem.Title;
            existingTask.Description = taskItem.Description;
            existingTask.Status = taskItem.Status;
            existingTask.AssignedUserId = taskItem.AssignedUserId;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error while updating task with ID {TaskId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "The task could not be updated because of a database error." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating task with ID {TaskId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred while updating the task." });
        }
    }

    /// <summary>
    /// Deletes a task by its identifier.
    /// </summary>
    /// <param name="id">The task identifier.</param>
    /// <returns>No content on success or an error response.</returns>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        try
        {
            var task = await _context.TaskItems.FindAsync(id);
            if (task is null)
            {
                return NotFound(new { message = $"Task with ID {id} was not found." });
            }

            _context.TaskItems.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error while deleting task with ID {TaskId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "The task could not be deleted because of a database error." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while deleting task with ID {TaskId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred while deleting the task." });
        }
    }
}