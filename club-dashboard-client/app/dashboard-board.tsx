"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

export type BoardTask = {
  id: number;
  title: string;
  description?: string | null;
  status?: number | string;
  assignedUserId?: number | null;
  assignedUser?: {
    fullName?: string | null;
    name?: string | null;
  } | null;
  createdAt?: string;
};

export type ApiFeedback = {
  tone: "success" | "warning" | "info";
  title: string;
  message: string;
};

type TaskStatusKey = "ToDo" | "InProgress" | "Done";

type BoardColumn = {
  title: string;
  accent: string;
  cards: BoardTask[];
  footer: string;
  emptyMessage: string;
  showComposer?: boolean;
};

const columnOrder: TaskStatusKey[] = ["ToDo", "InProgress", "Done"];

function normalizeStatus(status: BoardTask["status"]): TaskStatusKey {
  if (status === 1 || status === "InProgress") {
    return "InProgress";
  }

  if (status === 2 || status === "Done") {
    return "Done";
  }

  return "ToDo";
}

function statusValue(status: TaskStatusKey): number {
  switch (status) {
    case "InProgress":
      return 1;
    case "Done":
      return 2;
    default:
      return 0;
  }
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

function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
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

async function createTaskApi(title: string): Promise<BoardTask> {
  const apiBase = getApiBase();

  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const response = await fetch(`${apiBase}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      title,
      status: 0,
    }),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message ?? "The task could not be created.");
  }

  return (await response.json()) as BoardTask;
}

async function updateTaskApi(task: BoardTask, nextStatus: TaskStatusKey): Promise<void> {
  const apiBase = getApiBase();

  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const response = await fetch(`${apiBase}/tasks/${task.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      id: task.id,
      title: task.title,
      description: task.description ?? null,
      status: statusValue(nextStatus),
      assignedUserId: task.assignedUserId ?? null,
    }),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message ?? "The task could not be updated.");
  }
}

async function deleteTaskApi(id: number): Promise<void> {
  const apiBase = getApiBase();

  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const response = await fetch(`${apiBase}/tasks/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message ?? "The task could not be deleted.");
  }
}

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
    <aside
      className={`bordered p-5 ${toneStyles[feedback.tone]}`}
      aria-live={feedback.tone === "success" ? "polite" : "assertive"}
      role={feedback.tone === "success" ? "status" : "alert"}
    >
      <div className={`section-label ${labelStyles[feedback.tone]}`}>API feedback</div>
      <h2 className="mt-3 text-base font-black uppercase tracking-tight">{feedback.title}</h2>
      <p className="mt-2 text-sm leading-7 text-current/90">{feedback.message}</p>
    </aside>
  );
}

function TaskCard({
  task,
  onMoveLeft,
  onMoveRight,
  onDelete,
  isBusy,
  refCallback,
  onKeyDown,
}: {
  task: BoardTask;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onDelete: () => void;
  isBusy: boolean;
  refCallback: (node: HTMLElement | null) => void;
  onKeyDown: React.KeyboardEventHandler<HTMLElement>;
}) {
  const owner = cardOwner(task);

  return (
    <article
      ref={refCallback}
      tabIndex={0}
      role="listitem"
      aria-label={`${task.title}, ${statusLabel(task.status)} task card${owner ? `, assigned to ${owner}` : ""}`}
      aria-roledescription="Kanban card"
      onKeyDown={onKeyDown}
      className="board-card bordered bg-[rgba(255,255,255,0.04)] p-3 focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="section-label">Task {task.id}</div>
        <span className="border border-(--border) px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-(--accent)">
          {statusLabel(task.status)}
        </span>
      </div>

      <h3 className="mt-3 text-sm font-black uppercase tracking-tight text-(--text)">{task.title}</h3>

      {task.description ? (
        <p className="mt-2 text-sm leading-6 text-(--text-muted)">{task.description}</p>
      ) : null}

      {owner ? (
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-(--text-muted)">Assigned to {owner}</p>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onMoveLeft ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={onMoveLeft}
              className="bordered px-3 py-2 text-xs font-black uppercase tracking-[0.2em] transition hover:bg-[rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Move ${task.title} to the previous column`}
            >
              ←
            </button>
          ) : (
            <span className="px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-(--text-muted)">
              Fixed
            </span>
          )}

          {onMoveRight ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={onMoveRight}
              className="bordered px-3 py-2 text-xs font-black uppercase tracking-[0.2em] transition hover:bg-[rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Move ${task.title} to the next column`}
            >
              →
            </button>
          ) : (
            <span className="px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-(--text-muted)">
              Fixed
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={isBusy}
          onClick={onDelete}
          className="bordered px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#f2a7a7] transition hover:bg-[rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Delete ${task.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default function DashboardBoard({
  initialTasks,
  initialFeedback,
}: {
  initialTasks: BoardTask[];
  initialFeedback: ApiFeedback;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [newTitle, setNewTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [busyTaskIds, setBusyTaskIds] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  const groupedTasks = useMemo(() => splitTasks(tasks), [tasks]);

  const columns: BoardColumn[] = [
    {
      title: "Backlog",
      accent: "text-[var(--text-muted)]",
      cards: [],
      footer: "Seed the board here, then move work across the columns.",
      emptyMessage: "No backlog items yet.",
      showComposer: true,
    },
    {
      title: "To Do",
      accent: "text-[var(--accent)]",
      cards: groupedTasks.ToDo,
      footer: "The next items waiting for implementation.",
      emptyMessage: "No tasks in To Do.",
    },
    {
      title: "In Progress",
      accent: "text-[var(--accent)]",
      cards: groupedTasks.InProgress,
      footer: "Interactive work is happening here now.",
      emptyMessage: "No tasks in progress.",
    },
    {
      title: "Done",
      accent: "text-[var(--accent)]",
      cards: groupedTasks.Done,
      footer: "Completed milestones already verified.",
      emptyMessage: "No completed tasks yet.",
    },
  ];

  const markBusy = (id: number, busy: boolean) => {
    setBusyTaskIds((current) => {
      if (busy) {
        return current.includes(id) ? current : [...current, id];
      }

      return current.filter((taskId) => taskId !== id);
    });
  };

  const focusCard = (index: number) => {
    const target = cardRefs.current[index];

    if (target) {
      target.focus();
    }
  };

  const handleCardKeyDown = (index: number): React.KeyboardEventHandler<HTMLElement> => (event) => {
    let targetIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        targetIndex = Math.min(index + 1, cardRefs.current.length - 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        targetIndex = Math.max(index - 1, 0);
        break;
      case "Home":
        targetIndex = 0;
        break;
      case "End":
        targetIndex = cardRefs.current.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    focusCard(targetIndex);
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = newTitle.trim();
    if (!title) {
      setFeedback({
        tone: "warning",
        title: "Title required",
        message: "Enter a task title before creating a card.",
      });
      return;
    }

    setIsCreating(true);

    try {
      const createdTask = await createTaskApi(title);
      setTasks((current) => [...current, createdTask]);
      setNewTitle("");
      setFeedback({
        tone: "success",
        title: "Task created",
        message: `"${createdTask.title}" was added to To Do.`,
      });
    } catch (error) {
      setFeedback({
        tone: "warning",
        title: "Create failed",
        message: error instanceof Error ? error.message : "The task could not be created.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleMoveTask = async (task: BoardTask, direction: "left" | "right") => {
    const currentStatus = normalizeStatus(task.status);
    const currentIndex = columnOrder.indexOf(currentStatus);
    const nextIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex < 0 || nextIndex >= columnOrder.length) {
      return;
    }

    const nextStatus = columnOrder[nextIndex];
    markBusy(task.id, true);

    try {
      await updateTaskApi(task, nextStatus);

      setTasks((current) =>
        current.map((existingTask) =>
          existingTask.id === task.id ? { ...existingTask, status: statusValue(nextStatus) } : existingTask,
        ),
      );

      setFeedback({
        tone: "success",
        title: "Task updated",
        message: `"${task.title}" moved to ${statusLabel(statusValue(nextStatus))}.`,
      });
    } catch (error) {
      setFeedback({
        tone: "warning",
        title: "Update failed",
        message: error instanceof Error ? error.message : "The task could not be updated.",
      });
    } finally {
      markBusy(task.id, false);
    }
  };

  const handleDeleteTask = async (task: BoardTask) => {
    markBusy(task.id, true);

    try {
      await deleteTaskApi(task.id);

      setTasks((current) => current.filter((existingTask) => existingTask.id !== task.id));
      setFeedback({
        tone: "success",
        title: "Task deleted",
        message: `"${task.title}" was removed from the board.`,
      });
    } catch (error) {
      setFeedback({
        tone: "warning",
        title: "Delete failed",
        message: error instanceof Error ? error.message : "The task could not be deleted.",
      });
    } finally {
      markBusy(task.id, false);
    }
  };

  const totalTasks = tasks.length;
  const doneTasks = groupedTasks.Done.length;
  const activeTasks = groupedTasks.ToDo.length + groupedTasks.InProgress.length;
  const orderedTasks = columns.flatMap((col) => col.cards);

  return (
    <main id="main-content" aria-labelledby="dashboard-title" className="app-shell px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full flex-col gap-6" style={{ maxWidth: "1650px" }}>
        <header className="panel p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr] xl:items-end">
            <div className="tight-stack max-w-4xl">
              <span className="kicker">W06 checkpoint</span>
              <h1 id="dashboard-title" className="hero-title max-w-5xl">
                Student Club Management Dashboard.
              </h1>
              <p className="max-w-3xl text-sm font-medium leading-7 text-(--text-muted) sm:text-base">
                A club operations workspace for role management, task tracking, and final submission delivery.
                The board now loads live data from the .NET API and stays empty when the API returns no tasks.
              </p>
              <p id="board-instructions" className="max-w-3xl text-sm leading-7 text-(--text-muted)">
                Keyboard tip: tab into any card, then use arrow keys, Home, or End to move across the board.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <article className="bordered bg-[rgba(255,255,255,0.03)] p-4">
                <div className="section-label">Tasks synced</div>
                <p className="mt-3 text-3xl font-black tracking-tight">{totalTasks}</p>
                <p className="mt-2 text-sm text-(--text-muted)">Live items loaded from the API.</p>
              </article>
              <article className="bordered bg-[rgba(255,255,255,0.03)] p-4">
                <div className="section-label">Completed</div>
                <p className="mt-3 text-3xl font-black tracking-tight">{doneTasks}</p>
                <p className="mt-2 text-sm text-(--text-muted)">Milestones already approved.</p>
              </article>
              <article className="bordered bg-[rgba(255,255,255,0.03)] p-4">
                <div className="section-label">Active work</div>
                <p className="mt-3 text-3xl font-black tracking-tight">{activeTasks}</p>
                <p className="mt-2 text-sm text-(--text-muted)">Items still moving toward completion.</p>
              </article>
            </div>
          </div>

          <div className="mt-6">
            <ApiStatusBanner feedback={feedback} />
          </div>
        </header>

        <section className="grid gap-4 overflow-x-auto pb-2 xl:grid-cols-4" aria-label="Club task board">
          {columns.map((column) => (
            <section
              key={column.title}
              className="panel-alt flex flex-col p-4"
              style={{ minWidth: "18rem", minHeight: "28rem" }}
              role="region"
              aria-label={`${column.title} column, ${column.cards.length} cards`}
              aria-describedby="board-instructions"
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

              {column.showComposer ? (
                <form onSubmit={handleCreateTask} className="mt-4 bordered bg-[rgba(255,255,255,0.04)] p-3">
                  <div className="section-label">Create task</div>
                  <label className="sr-only" htmlFor="new-task-title">
                    Task title
                  </label>
                  <input
                    id="new-task-title"
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    placeholder="ENTER TASK TITLE"
                    className="mt-3 w-full border border-(--border) bg-(--surface) px-4 py-3 text-sm font-black uppercase tracking-tight text-(--text) outline-none placeholder:text-(--text-muted) focus:border-[var(--accent)]"
                  />
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="mt-3 w-full border border-(--accent) bg-[var(--accent)] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[var(--surface)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreating ? "Creating..." : "Add to To Do"}
                  </button>
                </form>
              ) : null}

              <div className="mt-4 grid gap-3" role="list">
                {column.cards.length === 0 ? (
                  <div className="bordered border-dashed p-4 text-sm uppercase tracking-[0.16em] text-(--text-muted)">
                    {column.emptyMessage}
                  </div>
                ) : (
                  column.cards.map((task) => {
                    const currentIndex = orderedTasks.findIndex((t) => t.id === task.id);
                    const status = normalizeStatus(task.status);
                    const busy = busyTaskIds.includes(task.id);
                    const leftTarget = status === "InProgress" ? "To Do" : status === "Done" ? "In Progress" : null;
                    const rightTarget = status === "ToDo" ? "In Progress" : status === "InProgress" ? "Done" : null;

                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isBusy={busy}
                        onMoveLeft={leftTarget ? () => handleMoveTask(task, "left") : undefined}
                        onMoveRight={rightTarget ? () => handleMoveTask(task, "right") : undefined}
                        onDelete={() => handleDeleteTask(task)}
                        onKeyDown={handleCardKeyDown(currentIndex)}
                        refCallback={(node) => {
                          cardRefs.current[currentIndex] = node;
                        }}
                      />
                    );
                  })
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