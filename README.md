# Student Club Management Dashboard 🎬

## Overview
The Student Club Management Dashboard is a centralized digital workspace designed to streamline operations, task delegation, and role management for university student communities—specifically modeled for organizations like the BAİBÜ Sinema ve Dijital Medya Topluluğu.

This platform replaces fragmented messaging apps with a unified system where upper board members, strategy consultants, and designers can track their responsibilities in real-time. It features role-based access control, task status tracking, and an internal directory.

## Architecture & Tech Stack
This project follows an N-Tier architecture, decoupling the frontend user interface from the backend API for scalability and cleaner separation of concerns.

**Backend (API Layer)**
- **Framework:** ASP.NET Core Web API (.NET 8+)
- **Data Access:** Entity Framework Core (EF Core)
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** JWT (JSON Web Tokens)

**Frontend (Presentation Layer)**
- **Framework:** Next.js (React)
- **Package Manager:** pnpm
- **Deployment:** Vercel
- **Design System:** Minimalist UI standard emphasizing stark utility. Primary brand background base is set to `#103044`.

## ✨ Core Features
- **Role-Based Authorization:** Distinct access levels for Admins (Upper Board) and standard Members.
- **Kanban-Style Task Management:** Create, assign, and transition tasks through "To-Do," "In Progress," and "Done" states.
- **Community Roster:** A centralized directory of all active club members and their current roles.

## Getting Started

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js & pnpm](https://pnpm.io/installation)
- PostgreSQL database connection string (Supabase recommended)

### Backend Setup (.NET)
1. Navigate to the API directory:

```bash
cd ClubDashboard.Api
```

2. Restore .NET dependencies:

```bash
dotnet restore
```

3. Update `appsettings.json` with your PostgreSQL connection string.

4. Apply database migrations:

```bash
dotnet ef database update
```

5. Run the server:

```bash
dotnet run
```

The API will typically be available at `http://localhost:5000` or `https://localhost:5001`.

### Frontend Setup (Next.js)
1. Navigate to the client directory:

```bash
cd club-dashboard-client
```

2. Install dependencies via `pnpm`:

```bash
pnpm install
```

3. Create a `.env.local` file and add your backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`.

Contributing (CSE 325 Group Project)
Currently, this repository is managed by a solo developer for CSE 325. If additional group members are assigned, please clone the repository, create a descriptive feature branch (e.g., `feature/task-models`), and submit a Pull Request for review. Ensure your feature branch is merged into the `main` branch upon completion.

## Trello Board: [Club Dashboard - CSE325](https://trello.com/b/jXQfr5M6/club-dasboard-cse325)