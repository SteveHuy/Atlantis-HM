Userdoc Implementation Plan

# 1. #Patient Dashboard

## 1.1 Patient Dashboard Page
- Create `/app/patient/dashboard/page.tsx` as the main dashboard for logged-in patients.
- Display heading: **"Patient Dashboard"**
- Welcome message: "Welcome, [Patient First Name]!"

## 1.2 Main Navigation Menu (Dashboard)
- Add a persistent navigation menu (sidebar or top menu) with links to:
    - View Medical Records
    - View Appointment History
    - Manage Appointment Reminders
    - Submit Insurance Details
- Each link should navigate or scroll to the corresponding page/section.
- Navigation state should highlight the active page.
- Ensure navigation is keyboard accessible.

## 1.3 Notices & Alerts
- Create a notice area (top of dashboard or prominent alert section).
- Show mock alerts for pending actions or unread messages (e.g., "2 unread messages", "Verify your email").
- Allow dismissing non-critical notices for UX.

## 1.4 Upcoming Appointments Summary
- Display a card/section listing up to the next 3 upcoming appointments:
    - Date, Time, Provider Name, and Location.
- Use mock data and show an empty state if no appointments are scheduled.
- Add a "View All Appointments" quick link.

## 1.5 Recent Activity Section
- Present a list showing the last 5 actions/events:
    - E.g., “Scheduled appointment with Dr. Lee”, “Paid invoice #1005”, “Updated emergency contact”.
- Show mock data. Provide clear icons/timestamps for each entry.

## 1.6 Insurance Claim Status
- Show a summary card or table with the status of latest insurance claims.
- On click, navigate to **View Insurance Claims** page.
- Use mock claim data; provide status (Pending, Approved, Denied, etc.).

## 1.7 Account Settings Access
- In the main area or navigation:
    - Link to **Manage Profile** (#Profile Management)
    - Link to **Update Emergency Contact**
- Use clear button or card style for visibility.

## 1.8 Secure Logout
- Prominently display a "Log out" button (preferably top-right or in menu).
- On click, use the secure logout flow: confirmation modal, clear all session state, redirect to login.
- Ensure the button is focusable and accessible.

## 1.9 Help & Support
- At the bottom of the dashboard, display:
    - Help/Support email (e.g., `support@atlantishms.com`)
    - Link to FAQ or support docs (mock for now).

## 1.10 Dashboard Search Bar
- Add a search input at the top of the dashboard:
    - Allows users to search for dashboard features or pages (fuzzy match over page titles/sections).
    - On typing/select, quickly navigate or scroll to the relevant section.
- Use accessible `<input>` with keyboard support and clear placeholder text.

## 1.11 Responsive Layout & Accessibility
- Design dashboard using Tailwind + shadcn/ui with responsive breakpoints.
- Sidebar collapses or becomes a drawer on mobile.
- All features, alerts, navigation, and forms must be keyboard and screen-reader accessible.
- Color contrast and font size must comply with WCAG 2.1 AA.

## 1.12 Security & Logging
- All navigation/actions should check mock authentication state.
- Mock logging: record user interactions (e.g., navigation, viewing sections) to a mock User Activity Log.
- No dashboard content should be accessible without a valid (mock) session.

---

# 2. Implement Service Provider Login (#Service Provider Login)

## 2.1 Login Screen
- Create `/app/service-provider/login/page.tsx`
- Display heading: **"Login to Atlantis HMS for Service Providers"**
- Login form fields:
    - Username (required)
    - Password (required, must follow password policy)
    - Remember Me checkbox (retain session for 30 days if checked)
- "Forgot Password?" link (navigates to #Recover Account for Service Providers).
- "Login" button:
    - Validate all fields.
    - If invalid, show field-level errors and "Invalid username or password".
    - If valid, simulate login, create session, redirect to **Access Appointment Schedules**.
- Log login event in mock User Activity Logs Table.
- HIPAA compliance (simulate session security).
- Accessibility: field labels, error roles, keyboard navigation.

---

# 3. Implement Service Provider Logout (#Service Provider logout)

## 3.1 Secure Logout Flow
- Show "Logout" button in header on all authenticated service provider pages.
- On click:
    - End user session, clear all session tokens (simulate in mock state).
    - Show confirmation: "You have been logged out successfully."
    - Redirect to Service Provider Login page.
- After logout:
    - Prevent access to any protected route until logged in again.
    - Simulate invalidation of session tokens (cannot reuse).
    - Log logout event in User Activity Logs Table.
    - Provide "Log back in" button linking to login page.
- Accessibility: Button must be easily reachable, confirmation is keyboard accessible.

---

# 4. General Implementation Guidelines

## 4.1 UI/UX
- Use Tailwind and shadcn/ui for all layouts and components.
- Responsive design: mobile, tablet, desktop tested.
- Maintain minimal, modern, high-contrast look.
- Provide meaningful empty and loading states for all dashboard sections.

## 4.2 State, Security, & Mock Data
- Store session state in context or Zustand store (mock, not persistent yet).
- All navigation/actions require mock session to be active.
- Simulate all backend calls and data with mock objects/functions.
- Avoid any storage of PII in browser during UI phase.

## 4.3 Accessibility & Testing
- Validate with keyboard-only navigation.
- Use ARIA labels and roles for all navigation, modals, and alerts.
- Add Storybook stories for all dashboard and auth components.

## 4.4 Documentation
- Document all props, expected mock data, and component behaviors.
- Mark clearly where backend/API integration will be required in the future.

---

**End of Change Set**
