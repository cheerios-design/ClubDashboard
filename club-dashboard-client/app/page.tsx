type BoardTask = {
  id: number;
  title: string;
  description?: string | null;
  status?: number | string;
  assignedUser?: {
    fullName?: string | null;
    name?: string | null;
  } | null;
};

type BoardColumn = {
  title: string;
  accent: string;
  cards: BoardTask[];
  footer?: string;
};

type ApiFeedback = {
  tone: "success" | "warning" | "info";
  title: string;
  message: string;
};

type TaskLoadResult = {
  tasks: BoardTask[];
  feedback: ApiFeedback;
};

const fallbackTasks: BoardTask[] = [
  {
    id: 101,
    title: "Implement drag-and-drop task reordering",
    description: "Finish the interactive Kanban behavior for moving tasks between columns.",
    status: 1,
  },
  {
    id: 102,
    title: "Record final video walkthrough",
    description: "Capture the project demo and submission narrative for the W06 checkpoint.",
    status: 0,
  },
  {
    id: 103,
    title: "Perform final bug testing and UI polish",
    description: "Verify the client, API integration, and board presentation before submission.",
    status: 0,
  },
  {
    id: 104,
    title: "JWT authentication and CORS hardening",
    description: "Keep the Next.js client and ASP.NET API aligned for secure token handling.",
    status: 2,
  },
];

const projectResources: BoardTask[] = [
  {
    id: 201,
    title: "GitHub repository",
    description: "Source of truth for the client, API, and submission notes.",
  },
  {
    id: 202,
    title: "Trello board",
    description: "Tracks the live backlog, in-progress work, and delivery milestones.",
  },
  {
    id: 203,
    title: "API contract",
    description: "Tasks endpoint, role model, and task status flow used by the dashboard.",
  },
];

const featureStories: BoardTask[] = [
  {
    id: 301,
    title: "Admins can create and assign tasks",
    description: "Upper board members can manage the club workflow from one dashboard.",
  },
  {
    id: 302,
    title: "Members can view work by status",
    description: "Task cards are grouped into To Do, In Progress, and Done columns.",
  },
  {
    id: 303,
    title: "Roster data stays visible",
    description: "Roles and assigned users remain part of the day-to-day workflow.",
  },
];

function normalizeStatus(status: BoardTask["status"]): "ToDo" | "InProgress" | "Done" {
  if (status === 1 || status === "InProgress") {
    return "InProgress";
  }

  if (status === 2 || status === "Done") {
    return "Done";
  }

  return "ToDo";
}

function statusLabel(status: BoardTask["status"]): string {
  switch (normalizeStatus(status)) {
    case "InProgress":
      return "In Progress";
    case "Done":
      return "Done";
    default:
      return "To Do";
  }
}

function cardOwner(task: BoardTask): string | null {
  return task.assignedUser?.fullName ?? task.assignedUser?.name ?? null;
}

function splitTasks(tasks: BoardTask[]) {
  return tasks.reduce(
    (groups, task) => {
      groups[normalizeStatus(task.status)].push(task);
      return groups;
    },
    {
      ToDo: [] as BoardTask[],
      InProgress: [] as BoardTask[],
      Done: [] as BoardTask[],
    },
  );
}

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
      tasks: fallbackTasks,
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
        tasks: fallbackTasks,
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
        tasks: fallbackTasks,
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
      tasks: fallbackTasks,
      feedback: {
        tone: "warning",
        title: "Task sync failed",
        message: "The client could not reach the API, so it is showing local sample tasks.",
      },
    };
  }
}

/**
 * Renders the API feedback banner that reports task load success, warnings, or fallback states.
 * @param feedback The current API feedback message and tone.
 */
function ApiStatusBanner({ feedback }: { feedback: ApiFeedback }) {
  const toneStyles = {
    success: "border-[#7ad38b] bg-[rgba(122,211,139,0.12)] text-[#e8f8ea]",
    warning: "border-[#e7c65c] bg-[rgba(231,198,92,0.12)] text-[var(--text)]",
    info: "border-[var(--border)] bg-[rgba(255,255,255,0.04)] text-[var(--text)]",
  } as const;

  const labelStyles = {
    success: "text-[#8ee39a]",
    warning: "text-[var(--accent)]",
    info: "text-[var(--text-muted)]",
  } as const;

  return (
    <aside className={`bordered p-5 ${toneStyles[feedback.tone]}`} aria-live={feedback.tone === "success" ? "polite" : "assertive"} role={feedback.tone === "success" ? "status" : "alert"}>
      <div className={`section-label ${labelStyles[feedback.tone]}`}>API feedback</div>
      <h2 className="mt-3 text-base font-black uppercase tracking-tight">{feedback.title}</h2>
      <p className="mt-2 text-sm leading-7 text-current/90">{feedback.message}</p>
    </aside>
  );
}

/**
 * Renders a task card for a board item returned by the API or fallback data.
 * @param task The task to display.
 */
function ColumnCard({ task }: { task: BoardTask }) {
  return (
    <article className="board-card bordered bg-[rgba(255,255,255,0.04)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="section-label">Task {task.id}</div>
        <span className="border border-(--border) px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-(--accent)">
          {statusLabel(task.status)}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-black uppercase tracking-tight text-(--text)">
        {task.title}
      </h3>
      {task.description ? (
        <p className="mt-2 text-sm leading-6 text-(--text-muted)">
          {task.description}
        </p>
      ) : null}
      {cardOwner(task) ? (
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-(--text-muted)">
          Assigned to {cardOwner(task)}
        </p>
      ) : null}
    </article>
  );
}

/**
 * Renders a static reference card for supporting dashboard content.
 * @param task The reference item to display.
 */
function StaticCard({ task }: { task: BoardTask }) {
  return (
    <article className="board-card bordered bg-[rgba(255,255,255,0.04)] p-3">
      <div className="section-label">Reference</div>
      <h3 className="mt-3 text-sm font-black uppercase tracking-tight text-(--text)">
        {task.title}
      </h3>
      {task.description ? (
        <p className="mt-2 text-sm leading-6 text-(--text-muted)">
          {task.description}
        </p>
      ) : null}
    </article>
  );
}

/**
 * Renders the dashboard homepage using server-fetched task data and static project context.
 */
export default async function Home() {
  const { tasks, feedback } = await loadTasks();
  const groupedTasks = splitTasks(tasks);

  const columns: BoardColumn[] = [
    {
      title: "Backlog",
      accent: "text-[var(--text-muted)]",
      cards: [
        {
          id: 401,
          title: "Finalize submission video and notes",
          description: "Capture the walkthrough before the final handoff.",
        },
        {
          id: 402,
          title: "Confirm last-pass testing checklist",
          description: "Verify auth, task fetching, and UI responsiveness.",
        },
      ],
      footer: "Queued for the last delivery pass.",
    },
    {
      title: "To Do",
      accent: "text-[var(--accent)]",
      cards: groupedTasks.ToDo.length > 0 ? groupedTasks.ToDo : fallbackTasks.filter((task) => normalizeStatus(task.status) === "ToDo"),
      footer: "The next items waiting for implementation.",
    },
    {
      title: "In Progress",
      accent: "text-[var(--accent)]",
      cards: groupedTasks.InProgress.length > 0 ? groupedTasks.InProgress : fallbackTasks.filter((task) => normalizeStatus(task.status) === "InProgress"),
      footer: "Interactive work is happening here now.",
    },
    {
      title: "Review",
      accent: "text-[var(--text-muted)]",
      cards: [
        {
          id: 403,
          title: "JWT authentication flow",
          description: "Validate the client token path and backend authorization behavior.",
        },
        {
          id: 404,
          title: "CORS configuration",
          description: "Keep cross-origin requests clean between the decoupled apps.",
        },
      ],
      footer: "Needs a final pass before submission.",
    },
    {
      title: "Done",
      accent: "text-[var(--accent)]",
      cards: groupedTasks.Done.length > 0 ? groupedTasks.Done : fallbackTasks.filter((task) => normalizeStatus(task.status) === "Done"),
      footer: "Completed milestones already verified.",
    },
    {
      title: "Project Resources",
      accent: "text-[var(--text-muted)]",
      cards: projectResources,
      footer: "Use these links to verify scope and delivery.",
    },
    {
      title: "Features",
      accent: "text-[var(--accent)]",
      cards: featureStories,
      footer: "The core user stories that define the product.",
    },
  ];

  const totalTasks = tasks.length;
  const completedTasks = groupedTasks.Done.length;
  const activeTasks = groupedTasks.ToDo.length + groupedTasks.InProgress.length;

  return (
    <main className="app-shell px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full flex-col gap-6" style={{ maxWidth: "1650px" }}>
        <header className="panel p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr] xl:items-end">
            <div className="tight-stack max-w-4xl">
              <span className="kicker">W06 checkpoint</span>
              <h1 className="hero-title max-w-5xl">
                Student Club Management Dashboard.
              </h1>
              <p className="max-w-3xl text-sm font-medium leading-7 text-(--text-muted) sm:text-base">
                A club operations workspace for role management, task tracking, and final submission delivery.
                The homepage now mirrors the current Trello board structure while pulling task data from the
                .NET API when available.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <article className="bordered bg-[rgba(255,255,255,0.03)] p-4">
                <div className="section-label">Tasks synced</div>
                <p className="mt-3 text-3xl font-black tracking-tight">{totalTasks}</p>
                <p className="mt-2 text-sm text-(--text-muted)">Fetched or seeded board items.</p>
              </article>
              <article className="bordered bg-[rgba(255,255,255,0.03)] p-4">
                <div className="section-label">Completed</div>
                <p className="mt-3 text-3xl font-black tracking-tight">{completedTasks}</p>
                <p className="mt-2 text-sm text-(--text-muted)">Milestones already approved.</p>
              </article>
              <article className="bordered bg-[rgba(255,255,255,0.03)] p-4">
                <div className="section-label">Active work</div>
                <p className="mt-3 text-3xl font-black tracking-tight">{activeTasks}</p>
                <p className="mt-2 text-sm text-(--text-muted)">Items still moving toward submission.</p>
              </article>
            </div>
          </div>

          <div className="mt-6">
            <ApiStatusBanner feedback={feedback} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <article className="bordered bg-[rgba(255,255,255,0.03)] p-5">
              <div className="section-label">Successes</div>
              <p className="mt-3 text-sm leading-7 text-(--text-muted)">
                The Next.js client is now aligned with the .NET Web API, the global brutalist styling is complete,
                and the roster and Kanban surfaces are in place.
              </p>
            </article>
            <article className="bordered bg-[rgba(255,255,255,0.03)] p-5">
              <div className="section-label">Challenge</div>
              <p className="mt-3 text-sm leading-7 text-(--text-muted)">
                JWT authentication and CORS needed careful coordination so the decoupled client and API could
                exchange requests without browser errors.
              </p>
            </article>
            <article className="bordered bg-[rgba(255,255,255,0.03)] p-5">
              <div className="section-label">Next tasks</div>
              <p className="mt-3 text-sm leading-7 text-(--text-muted)">
                Drag-and-drop behavior, final bug testing, and the demo video are the remaining submission items.
              </p>
            </article>
          </div>
        </header>

        <section className="grid gap-4 overflow-x-auto pb-2 xl:grid-cols-7">
          {columns.map((column) => (
            <section
              key={column.title}
              className="panel-alt flex flex-col p-4"
              style={{ minWidth: "18rem", minHeight: "28rem" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="section-label">{column.title}</div>
                  <h2 className={`mt-2 text-lg font-black uppercase tracking-tight ${column.accent}`}>
                    {column.cards.length}
                  </h2>
                </div>
                <span className="border border-(--border) px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-(--text-muted)">
                  {column.cards.length}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {column.cards.map((task) =>
                  column.title === "Project Resources" || column.title === "Features" ? (
                    <StaticCard key={task.id} task={task} />
                  ) : (
                    <ColumnCard key={task.id} task={task} />
                  ),
                )}
              </div>

              <div className="mt-auto pt-4 text-xs uppercase tracking-[0.18em] text-(--text-muted)">
                {column.footer}
              </div>
            </section>
          ))}
        </section>
      </section>
    </main>
  );
}
