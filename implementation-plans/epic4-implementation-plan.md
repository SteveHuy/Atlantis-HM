Userdoc Implementation Plan

# 1. #Schedule Appointment

Build the UI flow for patients to schedule appointments with the required steps, validations, and progressive disclosure based on user selections.

## 1.1. Setup and Mock Data

- Create mock data for:
  - Service Types (with names and matching icons)
  - Providers (linked to service types and specialties)
  - Appointment slots (dates/times, including some "fully booked" scenarios)
- Set up mock appointment submission endpoints and mock logic for "pending approval" vs "auto-confirmed."

## 1.2. Progressive Appointment UI

- Display service type selection as a row/grid of icon buttons.
- On service type selection, filter and show providers matching that service.
- When a provider is selected, display a date picker limited to available dates for that provider.
- After a date is chosen, show available times for that provider on that day.
- After time selection, show an optional comment field (max 512 characters).
- Display a "Confirm Appointment" button.  
    - On click, validate that all required fields are selected.
    - If validation fails, show field-specific errors and block progression.
    - If valid, display an appointment summary for review, then a "Submit" button.

## 1.3. Submission & Confirmation

- On "Submit," simulate appointment creation:
    - If provider requires approval, show "Appointment pending provider approval."
    - If auto-confirmed, show "Appointment confirmed."
- If no slots available for selected provider/service/date, show "Add to Waiting List" with direct flow to #Waiting List Management Feature.

## 1.4. Integration Points

- After appointment is scheduled, redirect to #View Appointment History.
- Surface "Add to Waiting List" logic and UI if all slots are booked.

## 1.5. Security, Authorization, and Access

- Ensure only patients can access this feature.
- Do not expose sensitive provider or patient details in error messages.
- Sanitize comment field and validate all external input client-side.

## 1.6. Refactoring

- Search for "UD-REF: #Schedule Appointment" and replace with the new feature.

---

# 2. #Search for Services

Develop a search and discovery experience for healthcare services and providers, supporting advanced filtering and direct appointment initiation.

## 2.1. Setup and Mock Data

- Mock services list (service type, provider name, specialty, availability).
- Mock specialty options for dropdown.
- Simulate search API with client-side filtering.

## 2.2. Search UI Implementation

- Heading: "Search for Services".
- Search form with:
    - Service Type (text)
    - Provider Name (text)
    - Specialty (dropdown, loads from mock data)
- "Search" button: runs client-side filter/match.
    - If no results, show: "No matching services or providers found."
    - If matches, list providers/services (show provider name, specialty, available services).
- Add sorting and filtering controls for results (sort by name, specialty, etc.).
- Implement pagination (show total result count, current page, next/prev).
- For each result, allow direct booking: clicking "Book" redirects to #Schedule Appointment pre-filled with selection.

## 2.3. Accessibility & Optimization

- Make all form fields accessible with labels and ARIA attributes.
- Ensure filters and pagination are keyboard and screen-reader friendly.

## 2.4. Refactoring

- Replace all "UD-REF: #Search for Services" in codebase with this implementation.

---

# 3. #Waiting List Management Feature

Allow patients to join and manage waiting lists for services/providers that are currently unavailable.

## 3.1. Setup and Mock Data

- Mock waiting list entries (provider, service, date/time range).
- Simulate available/unavailable slots.

## 3.2. Waiting List UI Implementation

- Show current waitlist entries for patient (if any).
- "Add to Waitlist" option appears if no preferred slots available (integrated with #Schedule Appointment).
- Patient selects:
    - Preferred provider (dropdown)
    - Preferred service (dropdown)
    - Preferred date/time range (date/time pickers)
- "Join Waitlist" button:
    - Validates all inputs.
    - If invalid, show field-specific validation messages.
    - On success, simulate addition to waitlist and show "Added to waitlist".
- Notify patient in UI if slot becomes available (simulate notification).
    - Allow removal from waitlist (UI toggle).
    - Update waitlist status in real time (mocked).
- Log all waitlist activity to user history (mock).

## 3.3. Integration

- Seamlessly integrate with #Schedule Appointment when user tries to book a full slot.
- Make sure waitlist management is available as a separate section in patient’s dashboard or scheduling UI.

## 3.4. Refactoring

- Replace all "UD-REF: #Waiting List Management Feature" in the codebase.

---

# 4. #View Appointment History

Show patients a list of their past appointments with rich filtering, pagination, and detailed views.

## 4.1. Setup and Mock Data

- Mock past appointment data with date, time, provider, service type, notes, feedback, etc.

## 4.2. Appointment History UI

- Display heading: "Appointment History" in patient portal.
- Show appointments list:
    - Columns: Date, Time, Provider, Service type.
    - Filter controls for date range and provider.
    - On filter, update list to show matching results.
    - Pagination controls (show count, current page, next/prev).
- Each appointment row is clickable:
    - Show detailed view (notes, feedback, status, etc.).
- After a new appointment is booked, redirect here for confirmation.

## 4.3. Accessibility

- Make filters and lists fully keyboard navigable and accessible.
- Ensure appointment details modal or page is ARIA-compliant.

## 4.4. Refactoring

- Replace "UD-REF: #View Appointment History" in codebase.

---

# 5. #Manage Appointment Reminders

Enable patients to set up, modify, and test their appointment reminder preferences.

## 5.1. Setup and Mock Data

- Mock current reminder settings (method, intervals).
- Mock log/history of sent reminders.

## 5.2. Reminders UI

- Show current reminder settings (read-only by default).
- Edit mode: allow selection of reminder method (SMS, Email) and reminder intervals (24hr, 1hr before, etc.).
- "Save Settings" button:
    - Validate intervals (show "Invalid reminder interval" on failure).
    - On success, update settings (mock), show "Reminder settings updated".
- "Send Test Reminder" button: simulate sending a reminder (mock, log entry added).
- Show log/history of all reminders sent for upcoming/past appointments.
- Add button to "Revert to default reminder settings".

## 5.3. Integration

- Log all reminder activity in appointment history (mock).
- Integrate with patient profile/settings as appropriate.

## 5.4. Security and Input Handling

- Sanitize all inputs.
- Do not allow invalid intervals or injection.
- Show only current user's reminder history/settings.

## 5.5. Refactoring

- Replace "UD-REF: #Manage Appointment Reminders" in codebase.

---

**This change set follows your Next.js project structure and best practices for security, code modularity, and UX consistency. All data should be mocked for UI development; no database changes or live API connections are needed at this stage.**

Let me know if you need task breakdowns, API stubs, or UI wireframes for any of the above!
