Userdoc Implementation Plan

# 1. Implement Patient Dashboard as a Feature Card UI (#Patient Dashboard)

## 1.1 Patient Dashboard Page Setup
- **File:** `/app/patient/dashboard/page.tsx`
- **Purpose:** Main page for logged-in patients.
- Render heading: **"Patient Dashboard"**
- On load, fetch/mock the logged-in patient’s data.

## 1.2 Welcome Message
- Below heading, show:  
  **"Welcome, [Patient First Name]!"**  
  Use session/context or mock data to display name.

## 1.3 Navigation Menu as Feature Cards
- Display a responsive grid of feature cards.  
  Each card includes an icon, feature title, short description, and click action.
  - **Medical Records:** Link to #View Medical Records
  - **Appointment History:** Link to #View Appointment History
  - **Appointment Reminders:** Link to #Manage Appointment Reminders
  - **Insurance Details:** Link to #Submit Insurance Details
- On mobile, cards stack vertically; on larger screens, arrange 2x2 or 4-in-row.
- Use shadcn/ui cards with icons from `lucide-react` or SVGs in `/public`.

## 1.4 Notices & Alerts
- At the top or above feature cards, render a prominent shadcn/ui `Alert` for:
  - Pending actions (e.g., “Verify your email”)
  - Unread messages (e.g., “2 unread messages”)
- Allow dismiss (optional for non-critical), always accessible with ARIA role.

## 1.5 Upcoming Appointments Summary
- Show a compact card with up to 3 upcoming appointments:
  - Date, Time, Provider, Location
- Use mock data in `/lib/mockDashboardData.ts`
- Add a “View All” quick link to appointment history.
- Show empty state (“No upcoming appointments”) if needed.

## 1.6 Recent Activity
- Card or list with the last five actions (e.g., “Scheduled appointment”, “Made payment”).
- Use timestamps and relevant icons for clarity.
- Data mocked in `/lib/mockDashboardData.ts`.

## 1.7 Insurance Claim Status
- Display a card with latest insurance claim status updates.
- Clicking a claim (or “View all claims” link) navigates to #View Insurance Claims.
- Present status (e.g., Pending, Approved, Denied) with badge color coding.

## 1.8 Account Settings & Emergency Contact
- Place a dedicated card or section:
  - “Manage Profile” (links to #Profile Management)
  - “Update Emergency Contact” (links to relevant page)
- Use action buttons or links for clarity.

## 1.9 Secure Logout Quick Link
- Card or button styled consistently with other features:
  - “Log out” (prominently placed)
  - Triggers modal for confirmation, then clears session and redirects to login.
  - Use shadcn/ui `AlertDialog` for modal.

## 1.10 Security, Privacy & Protected Access
- **Security:**  
  - Page is only accessible if patient session exists (mock session/context).
  - All feature card links validate session on click.
  - Do not display or store sensitive info in client state for UI.
- **Privacy:**  
  - Only minimal, non-sensitive data in UI during mock/testing phase.

## 1.11 Help & Support Contact
- At the page bottom, render:
  - “Need help? Contact support@atlantishms.com”
  - Optional FAQ/help link (mock)

## 1.12 Search Bar for Quick Navigation
- Place a search bar at the top (above cards or in dashboard header).
  - Typing searches features/cards (fuzzy match on feature titles).
  - Keyboard or mouse selects result and scrolls/navigates to that card/section.
  - Use shadcn/ui `Input` and dropdown.

## 1.13 Responsive Layout & Accessibility
- Use Tailwind’s grid/flex utilities for cards and sections.
- Ensure all features/cards stack or grid appropriately for desktop, tablet, and mobile.
- Cards/buttons have high contrast, clear focus states, and ARIA labels.
- Test all sections for keyboard and screen reader accessibility (WCAG 2.1 AA).

## 1.14 Logging User Interactions
- All feature card clicks and major dashboard interactions:
  - Call a mock logger utility (e.g., `/lib/logger.ts`) to record action, timestamp, (mock) user ID.
  - Do not log PII or sensitive info.
  - Example: `logDashboardEvent('view_appointment_history', { timestamp, userId })`

---

# 2. Project & Component Structure

## 2.1 Folder and Component Layout
- `/app/patient/dashboard/page.tsx` — dashboard entry point
- `/components/patient/feature-card.tsx` — generic card for features
- `/components/patient/appointment-summary.tsx` — next appointments widget
- `/components/patient/recent-activity.tsx` — recent actions list
- `/components/patient/claim-status.tsx` — insurance claims status widget
- `/components/patient/settings-card.tsx` — profile/emergency actions
- `/components/patient/logout-button.tsx` — secure logout component
- `/components/patient/alert-banner.tsx` — notices and unread messages
- `/components/patient/search-bar.tsx` — feature search component
- `/lib/mockDashboardData.ts` — mock data for all sections
- `/lib/logger.ts` — mock logger
- `/constants/routes.ts` — centralize all dashboard feature routes
- `/types/patient.ts` — TypeScript types for patient/dashboard data

## 2.2 State & Mock Data
- Use a `usePatientSession` context/hook for mock login state.
- Mock dashboard data from `/lib/mockDashboardData.ts`
- No backend/data persistence yet.

---

# 3. Testing, QA & Documentation

## 3.1 Testing & Accessibility
- Storybook stories for each card/widget.
- Keyboard and screen reader test all navigation and actions.
- Test empty, error, and loading states for all widgets.

## 3.2 Documentation
- JSDoc/type all exported functions/components.
- Add usage and mock data info to each major component.
- Add README to `/components/patient/` explaining the dashboard card layout pattern and expected props.

---

**End of Change Set**
