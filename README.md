# Callkaro Agent Panel

Web dashboard for agents — Vite + React + TypeScript + CSS Modules.

## Run

```bash
cd web/agent-panel
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Structure

```
src/
  components/
    ui/           # Button, Input, Card, Badge, Avatar, Modal, Table
    layout/       # AppLayout, Sidebar, PageHeader
    dashboard/    # StatCard, ActionCard, ActivityFeed, PendingApprovals
  pages/          # Route-level screens
  data/           # Nav config + mock dashboard data
  styles/         # Design tokens + global CSS
```

## Notes

- Dashboard UI matches the Figma agent dashboard screenshot.
- Other nav routes are scaffolded placeholders ready for features.
- Swap `src/data/mockDashboard.ts` for API calls when the backend agent module is wired.
