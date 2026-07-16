# Implementation Plan: security, testing, accessibility, problem statement alignment, and code quality

We will implement all requested modifications in a structured, step-by-step manner. We will verify correctness by compiling and running tests after each step.

---

## 1. Security (Highest Priority)
- **Rename Middleware File**: Rename `src/middleware.ts` to `src/proxy.ts` (Next.js 16 file convention) and export `proxy` instead of `middleware`. If `middleware.ts` is required in the root, we will keep a root-level `middleware.ts` that delegates to `src/proxy.ts` or we will put `middleware.ts` at the root. Wait, the Next.js build warning says:
  `The "middleware" file convention is deprecated. Please use "proxy" instead.`
  We will use `src/proxy.ts` exporting `proxy` as the Next.js 16 standard.
- **HTTP-Only Cookies & API Route**: Create `src/app/api/auth/session/route.ts` as the server-side authentication boundary.
  - Move `DEMO_USERS` credentials list to this server-side API.
  - Implement `GET` to read HTTP-only cookie `session_user` and return it.
  - Implement `POST` to set `session_user` and `user_role` as HTTP-only, secure, strict path `/` cookies and return the user.
  - Implement `DELETE` to clear the cookies.
- **Zustand Store Refactor**: Remove `persist` middleware from `useAuthStore` in `src/stores/authStore.ts` so sensitive fields are never saved in `localStorage`. Update methods:
  - `setRole`: Sync update with basic user (for test compliance), async update via `/api/auth/session` to load full user details.
  - `logout`: Sync clear, async DELETE to `/api/auth/session`.
  - `setUser`: Sync update, async POST.
- **Session Initializer**: Mount `SessionInitializer` in `src/components/Providers.tsx` to restore session state from `/api/auth/session` on client mount.

---

## 2. Testing
- Create/add tests using Vitest and `@testing-library/react` (and `@testing-library/jest-dom` if needed) to verify:
  - `CortexCard`: Verify it renders correct titles/insights and click handlers trigger correctly.
  - Interactive SVG Map (`StadiumMap` component): Verify clicking zones updates zone selection/state in the store.
  - SOS Form (`EmergencyPage` component): Verify form validations and SOS broadcasts.
- All tests will run under Vitest config.

---

## 3. Accessibility
- **SVG Map**: Add `tabIndex={0}`, `role="button"`, `aria-label`, and keyboard event handlers (`onKeyDown` for Space/Enter) to all interactive SVG group nodes. Ensure visible outlines are rendered using `:focus-visible` or Tailwind focus outlines.
- **Recharts screen-reader support**: Add a visually hidden description paragraph using a `.sr-only` class under charts in `crowd/page.tsx` and `sustainability/page.tsx`.

---

## 4. Problem Statement Alignment
- **Autonomous Simulation Ticker**: Modify the scenario engine / simulation tick in `cortexStore.ts` to autonomously transition through scenario stages, generate alerts, and trigger/coordinate tasks without requiring a manual click first. Keep a human "approve/override" action available, but let the initial trigger be automated.

---

## 5. Code Quality
- **Inline Styles Extraction**: Move the inline styles specified in `DashboardShell.tsx`, `sustainability/page.tsx`, and `staffing/page.tsx` to `src/app/globals.css` (or `index.css`) as utility classes.
- **Decompose DashboardShell**: Extract sub-components `SidebarNav.tsx`, `HeaderBar.tsx`, and `SimulatorControls.tsx` into modular components.
- **TypeScript Safety**: Declare SpeechRecognition types in `src/types/global.d.ts` and replace any `any` type casts with strict types.
- **Server Components Optimization**: Remove unnecessary `"use client"` directives from page entries (e.g. `operations/page.tsx`, `security/page.tsx`) by converting them to Server Components and moving client hooks/interactivity into child components.

---

## Verification Plan
- Build the project using `npm run build` to verify Next.js/TypeScript compiles cleanly.
- Run unit and component tests using `npm run test` to verify 100% test passing.
- Run `npm run lint` to verify code quality metrics.
