# Master Plan: Submission #2 Audit Fixes

Based on the strict PromptWars evaluation audit, we have 5 high-priority technical issues preventing a flawless submission. This plan is designed to be executed within a single day.

## Proposed Changes

### 1. Fix Broken Tests (`src/tests/shared-components.test.tsx`)
- **Issue**: The `DemoControls` test fails because the text "Demo Controls" was removed during the minimalist redesign.
- **Fix**: Update the test selectors to query for the updated text (e.g., "Simulation Running" or "Cortex AI Active") and ensure the DOM assertions match the new component structure.

### 2. Fix API Runtime Errors (`src/app/api/cortex/route.ts`)
- **Issue**: Malformed JSON triggers an unhandled `SyntaxError` when `await req.json()` runs, polluting test logs and exposing poor error boundaries.
- **Fix**: Wrap `req.json()` in a `try/catch` block and gracefully return a `400 Bad Request` with an appropriate error message when parsing fails.

### 3. Upgrade Security (`src/stores/authStore.ts` & `src/app/api/auth/route.ts`)
- **Issue**: The `authStore` currently sets the active role via client-side `js-cookie`. Client-side cookies cannot be `HttpOnly`, making them vulnerable to XSS and spoofing.
- **Fix**: 
  - Create a new backend API route `POST /api/auth` that sets the role cookie with `HttpOnly`, `Secure`, and `SameSite=Strict` flags.
  - Refactor `authStore.setRole` to call this API endpoint instead of modifying the cookie directly via JavaScript.

### 4. Optimize Performance (`src/app/page.tsx`)
- **Issue**: The `window.addEventListener("mousemove")` function fires on every sub-pixel movement, continuously triggering React state updates without throttling, which can drop frames.
- **Fix**: Wrap the mouse position state updates in a `requestAnimationFrame` loop or a `lodash.throttle` function to drastically reduce render cycle frequency.

### 5. Accessibility Polish
- **Issue**: The massive SVG in `ConnectionOverlay.tsx` lacks `aria-hidden="true"`, causing screen readers to read useless coordinate data. The footer text (`text-white/30`) in `page.tsx` fails WCAG contrast requirements.
- **Fix**: Add `aria-hidden="true" focusable="false"` to the SVG. Increase the opacity of the footer text to `text-white/50` for acceptable contrast.

## User Review Required
> [!IMPORTANT]
> The security refactor requires moving auth state mutations to the backend. This adds a slight network delay (~30-50ms) to role switching. Do you approve prioritizing security over instant client-side role switching?

## Verification Plan
### Automated Tests
- Run `npm run test` to verify 100% pass rate.
- Observe test runner logs to confirm `SyntaxError` stack traces are gone.
### Manual Verification
- Inspect the browser application cookies to verify the `role` cookie has `HttpOnly` and `Secure` flags set.
- Profile the landing page with Chrome DevTools to ensure mouse movement does not trigger excessive main-thread blocking.
