// Controllers/TasksController.cs
using ClubDashboard.Api.Data;
using ClubDashboard.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        var tasks = await _context.TaskItems
            .Include(t => t.AssignedUser)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {
        var task = await _context.TaskItems
            .Include(t => t.AssignedUser)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task is null)
        {
            return NotFound();
        }

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(TaskItem taskItem)
    {
        taskItem.Id = 0;
        taskItem.CreatedAt = DateTime.UtcNow;

        _context.TaskItems.Add(taskItem);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = taskItem.Id }, taskItem);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTask(int id, TaskItem taskItem)
    {
        if (id != taskItem.Id)
        {
            return BadRequest();
        }

        var existingTask = await _context.TaskItems.FindAsync(id);
        if (existingTask is null)
        {
            return NotFound();
        }

        existingTask.Title = taskItem.Title;
        existingTask.Description = taskItem.Description;
        existingTask.Status = taskItem.Status;
        existingTask.AssignedUserId = taskItem.AssignedUserId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.TaskItems.FindAsync(id);
        if (task is null)
        {
            return NotFound();
        }

        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}