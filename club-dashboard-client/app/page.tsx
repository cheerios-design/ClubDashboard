import Image from "next/image";

export default function Home() {
  return (
    <main className="app-shell px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid-frame mx-auto w-full max-w-7xl">
        <header className="panel col-span-full p-6 sm:p-8 lg:p-10">
          <div className="tight-stack max-w-4xl">
            <span className="kicker">University Club</span>
            <h1 className="hero-title max-w-5xl">
              Club dashboard for roles, tasks, and operations.
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-7 text-[var(--text-muted)] sm:text-base">
              A disciplined management interface for strategy, production, and
              day-to-day execution across the society.
            </p>
          </div>
        </header>

        <section className="panel-alt col-span-full grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          <article className="bordered bg-[rgba(255,255,255,0.03)] p-5">
            <div className="section-label">Roles</div>
            <p className="mt-3 text-2xl font-black tracking-tight">3</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Strategy, design, and member operations.
            </p>
          </article>

          <article className="bordered bg-[rgba(255,255,255,0.03)] p-5">
            <div className="section-label">Active Tasks</div>
            <p className="mt-3 text-2xl font-black tracking-tight">12</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Work items tracked across the current sprint.
            </p>
          </article>

          <article className="bordered bg-[rgba(255,255,255,0.03)] p-5">
            <div className="section-label">Workflow</div>
            <p className="mt-3 text-2xl font-black tracking-tight">API + UI</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              ASP.NET Core backend with a Next.js client.
            </p>
          </article>
        </section>

        <section className="col-span-full grid gap-4 lg:grid-cols-12">
          <article className="panel lg:col-span-7 p-6 sm:p-8">
            <div className="section-label">Operations</div>
            <h2 className="mt-3 text-2xl font-black uppercase tracking-tight">
              Current system focus
            </h2>
            <div className="rule my-5" />
            <div className="tight-stack text-sm leading-7 text-[var(--text-muted)]">
              <p>Track club roles, assign work, and keep execution visible.</p>
              <p>
                The interface is intentionally restrained: heavy borders, strict
                spacing, bold type, and high contrast.
              </p>
            </div>
          </article>

          <aside className="panel-alt lg:col-span-5 p-6 sm:p-8">
            <div className="section-label">Build Status</div>
            <ul className="mt-4 space-y-3 text-sm font-medium">
              <li className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span>API scaffold</span>
                <span className="text-[var(--accent)]">Ready</span>
              </li>
              <li className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span>EF Core wiring</span>
                <span className="text-[var(--accent)]">Ready</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Frontend theme</span>
                <span className="text-[var(--accent)]">Ready</span>
              </li>
            </ul>
          </aside>
        </section>
      </section>
    </main>
  );
}
