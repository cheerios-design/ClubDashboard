import DashboardBoard, { type ApiFeedback, type BoardTask } from "./dashboard-board";

type TaskLoadResult = {
  tasks: BoardTask[];
  feedback: ApiFeedback;
};

async function readErrorMessage(response: Response): Promise<string | null> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as { message?: unknown } | null;

    if (payload && typeof payload.message === "string" && payload.message.trim().length > 0) {
      return payload.message;
    }
  }

  const text = await response.text().catch(() => "");
  return text.trim().length > 0 ? text.trim() : null;
}

async function loadTasks(): Promise<TaskLoadResult> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (!apiBase) {
    return {
      tasks: [],
      feedback: {
        tone: "info",
        title: "Using seeded board data",
        message: "NEXT_PUBLIC_API_URL is not configured, so the dashboard is showing local sample tasks.",
      },
    };
  }

  try {
    const response = await fetch(`${apiBase}/tasks`, {
      cache: "no-store",
    });

    if (!response.ok) {
      const apiMessage = await readErrorMessage(response);

      return {
        tasks: [],
        feedback: {
          tone: "warning",
          title: "Task sync unavailable",
          message:
            apiMessage ??
            `The API returned ${response.status} ${response.statusText}. The dashboard is showing local sample tasks instead.`,
        },
      };
    }

    const tasks = (await response.json()) as BoardTask[];
    if (tasks.length === 0) {
      return {
        tasks: [],
        feedback: {
          tone: "info",
          title: "API request succeeded",
          message: "The server returned an empty task list, so the dashboard is showing sample tasks.",
        },
      };
    }

    return {
      tasks,
      feedback: {
        tone: "success",
        title: "API request succeeded",
        message: `Loaded ${tasks.length} tasks from the .NET API.`,
      },
    };
  } catch {
    return {
      tasks: [],
      feedback: {
        tone: "warning",
        title: "Task sync failed",
        message: "The client could not reach the API, so it is showing local sample tasks.",
      },
    };
  }
}

export default async function Home() {
  const { tasks, feedback } = await loadTasks();

  return <DashboardBoard tasks={tasks} feedback={feedback} />;
}