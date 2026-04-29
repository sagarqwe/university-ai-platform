# STEP 2 — React App Initialization Guide

## What was built in this step

```
frontend/
├── .env                          ← Environment variables (API URL)
├── .env.example                  ← Template for teammates
├── .gitignore                    ← Git ignore rules
├── package.json                  ← All dependencies (updated with Tailwind devDeps)
├── postcss.config.js             ← PostCSS config (REQUIRED for Tailwind in CRA)
├── tailwind.config.js            ← Tailwind theme + safelist
│
├── public/
│   ├── index.html                ← HTML shell with font preloads + manifest link
│   ├── manifest.json             ← PWA manifest (dark theme, standalone mode)
│   └── robots.txt                ← Disallows /admin from search indexing
│
└── src/
    ├── App.jsx                   ← Routes + protected routes + AuthProvider
    ├── index.js                  ← ReactDOM.createRoot entry
    ├── index.css                 ← Tailwind directives + global base styles
    │
    ├── utils/helpers.js          ← Shared utils: formatDate, formatSize, parseApiError, cx()
    ├── hooks/useAuth.js          ← Auth context + JWT localStorage management
    ├── services/api.js           ← Axios instance with JWT interceptors
    │
    ├── components/
    │   ├── shared/
    │   │   ├── Layout.jsx        ← Sidebar + topbar shell (used by all pages)
    │   │   ├── ConfidenceBadge   ← Color-coded confidence score pill
    │   │   ├── LanguageBadge     ← Language flag + name pill
    │   │   ├── StatusBadge       ← StatusDot (animated) + StatusPill
    │   │   ├── EmptyState        ← Consistent empty state for tables/lists
    │   │   └── LoadingSpinner    ← PageLoader, Spinner, Skeleton, MetricCardSkeletons
    │   │
    │   ├── chat/
    │   │   ├── MessageBubble     ← USER/ASSISTANT message with metadata
    │   │   ├── TypingIndicator   ← Animated dots "AI is thinking"
    │   │   ├── ChatInput         ← Auto-grow textarea + send button
    │   │   ├── SessionSidebar    ← Chat history list panel
    │   │   └── WelcomeScreen     ← Empty chat state with example queries
    │   │
    │   ├── admin/
    │   │   ├── MetricCard        ← Stats card with icon + trend support
    │   │   ├── DocumentCard      ← Individual PDF document row
    │   │   └── QueryLogsTable    ← Admin query log table with skeletons
    │   │
    │   └── analytics/
    │       ├── ChartCard         ← Wrapper with header, loading state for charts
    │       └── CustomTooltip     ← Styled Recharts tooltip used by all 4 charts
    │
    └── pages/
        ├── LoginPage             ← Login form + demo credential shortcuts
        ├── StudentDashboard      ← Refactored: uses all chat/* components
        ├── AdminDashboard        ← Refactored: uses all admin/* components
        └── AnalyticsPage         ← Refactored: uses analytics/* + ChartCard
```

---

## Exact Commands to Run

### Prerequisites check
```bash
node --version    # must be 18+
npm --version     # must be 8+
```

### Install dependencies
```bash
cd university-ai-platform/frontend
npm install
```

This installs:
- `react`, `react-dom`, `react-router-dom` — UI framework + routing
- `axios` — HTTP client for Spring Boot API
- `recharts` — analytics charts (Line, Bar, Pie, Area)
- `lucide-react` — icon library
- `react-hot-toast` — toast notifications
- `tailwindcss`, `autoprefixer`, `postcss` — CSS framework (devDependencies)

### Start development server
```bash
npm start
```

Opens at: **http://localhost:3000**

### Production build
```bash
npm run build
```

Output goes to `frontend/build/` — can be served by any static host or Nginx.

---

## How the React App Connects to the Backend

```
React (port 3000)
  │
  ├── npm start reads .env → REACT_APP_API_URL=http://localhost:8080
  │
  ├── package.json "proxy": "http://localhost:8080"
  │   └── In dev: /api/* requests proxy automatically to port 8080
  │
  └── src/services/api.js
      ├── axios baseURL = http://localhost:8080/api
      ├── Request interceptor → adds Authorization: Bearer <JWT>
      └── Response interceptor → 401 auto-logout + redirect to /login
```

---

## Authentication Flow

```
LoginPage
  │  user fills email/password
  │
  ▼
useAuth.login()  →  POST /api/auth/login
  │
  ▼
Spring Boot AuthController
  │  validates credentials, returns { token, name, email, role }
  │
  ▼
localStorage stores:
  authToken = "eyJhbGciOi..."
  userInfo  = { name, email, role, userId }
  │
  ▼
App.jsx ProtectedRoute reads useAuth()
  │  role === 'ADMIN' → /admin
  │  role === 'STUDENT' → /
  ▼
Dashboard renders
```

---

## Demo Credentials (seeded by DataInitializer on first Spring Boot run)

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@university.edu     | admin123    |
| Student | student@university.edu   | student123  |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `@tailwind` directive error | Run `npm install` to install tailwindcss devDeps, ensure postcss.config.js exists |
| Blank page | Check browser console — usually a failed API call if Spring Boot is not running |
| CORS error | Ensure `app.cors.allowed-origins=http://localhost:3000` in application.properties |
| 401 on every request | JWT expired or wrong secret — clear localStorage and log in again |
| Charts empty | Analytics data only appears after queries are made. Demo data shown automatically. |
