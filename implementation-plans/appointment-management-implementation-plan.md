Userdoc Implementation Plan

# 1. #Schedule Appointment

Build the UI flow for patients to schedule appointments with the required steps, validations, and progressive disclosure based on user selections.

## 1.1. Setup and Mock Data

- Create mock data for: Service Types (with names and matching icons), Providers (linked to service types and specialties), Appointment slots (dates/times, including some "fully booked" scenarios).
- Set up mock appointment submission endpoints and mock logic for "pending approval" vs "auto-confirmed."

## 1.2. UI Implementation

- Display service type selection as a row/grid of icon buttons.
- On service type selection, filter and show providers matching that service.
- When a provider is selected, display a date picker limited to available dates for that provider.
- After a date is chosen, show available times for that provider on that day.
- After time selection, show an optional comment field (max 512 characters).
- Display a "Confirm Appointment" button with validation and appointment summary for review.
- On "Submit," simulate appointment creation with appropriate confirmation messages.

## 1.3. Security

- Ensure only patients can access this feature.
- Do not expose sensitive provider or patient details in error messages.
- Sanitise comment field and validate all external input client-side.

## 1.4. Refactoring

- Replace "UD-REF: #Schedule Appointment" in codebase.

---

# 2. #Search for Services

Develop a search and discovery experience for healthcare services and providers, supporting advanced filtering and direct appointment initiation.

## 2.1. Setup and Mock Data

- Mock services list (service type, provider name, specialty, availability).
- Mock specialty options for dropdown.
- Simulate search API with client-side filtering.

## 2.2. UI Implementation

- Search form with Service Type (text), Provider Name (text), Specialty (dropdown).
- "Search" button runs client-side filter/match with appropriate no results messaging.
- List providers/services with sorting and filtering controls for results.
- Implement pagination with total result count display.
- For each result, allow direct booking by redirecting to #Schedule Appointment pre-filled with selection.

## 2.3. Security

- Make all form fields accessible with labels and ARIA attributes.
- Ensure filters and pagination are keyboard and screen-reader friendly.

## 2.4. Refactoring

- Replace "UD-REF: #Search for Services" in codebase.

---

# 3. #Waiting List Management Feature

Allow patients to join and manage waiting lists for services/providers that are currently unavailable.

## 3.1. Setup and Mock Data

- Mock waiting list entries (provider, service, date/time range).
- Simulate available/unavailable slots and notification triggers.

## 3.2. UI Implementation

- Show current waitlist entries for patient (if any).
- "Add to Waitlist" option with form for preferred provider, service, and date/time range.
- "Join Waitlist" button with validation and confirmation messaging.
- Display notifications when slots become available with removal options.
- Real-time waitlist status updates (mocked) and activity logging.

## 3.3. Security

- Sanitise all inputs and validate waitlist data.
- Show only current user's waitlist information.

## 3.4. Refactoring

- Replace "UD-REF: #Waiting List Management Feature" in codebase.

---

# 4. #View Appointment History

Show patients a list of their past appointments with rich filtering, pagination, and detailed views.

## 4.1. Setup and Mock Data

- Mock past appointment data with date, time, provider, service type, notes, feedback, status information.

## 4.2. UI Implementation

- Display "Appointment History" with appointments list showing Date, Time, Provider, Service type columns.
- Filter controls for date range and provider with real-time list updates.
- Pagination controls showing count, current page, next/prev navigation.
- Clickable appointment rows showing detailed view with notes, feedback, and status information.

## 4.3. Security

- Ensure appointment details modal or page is ARIA-compliant.
- Show only current user's appointment history.

## 4.4. Refactoring

- Replace "UD-REF: #View Appointment History" in codebase.

---

# 5. #Manage Appointment Reminders

Enable patients to set up, modify, and test their appointment reminder preferences.

## 5.1. Setup and Mock Data

- Mock current reminder settings (method, intervals).
- Mock log/history of sent reminders.

## 5.2. UI Implementation

- Show current reminder settings with edit mode for reminder method (SMS, Email) and intervals.
- "Save Settings" button with validation and confirmation messaging.
- "Send Test Reminder" button with mock delivery and log entry.
- Display log/history of all reminders sent for appointments.
- "Revert to default reminder settings" option.

## 5.3. Security

- Sanitise all inputs and prevent invalid intervals or injection.
- Show only current user's reminder history/settings.

## 5.4. Refactoring

- Replace "UD-REF: #Manage Appointment Reminders" in codebase.

---

# 6. #Handle Phone Inquiries

Create a UI flow for logging phone inquiries, searching patients, and managing appointments over the phone.

## 6.1. Setup and Mock Data

- Mock patient data with names, phone numbers, and appointment histories.
- Mock appointment management actions (schedule, reschedule, cancel).
- Prepare sample call logs and reference numbers.

## 6.2. UI Implementation

- "Log Phone Inquiry" button opening modal/form for caller details and search functionality.
- Patient search by name or phone with inline appointment history display.
- Appointment management actions with confirmation and notification options.
- Save functionality with unique reference number generation.
- "Transfer to Department" feature with transfer notes and mock notifications.

## 6.3. Security

- Input validation for phone, name, and reason fields.
- Protect all patient data; show only to authenticated receptionists.

## 6.4. Refactoring

- Replace "UD-REF: #Handle Phone Inquiries" in codebase.

---

# 7. #Manage Appointment Requests

Receptionists view and process all pending appointment requests, either confirming or declining as appropriate.

## 7.1. Setup and Mock Data

- Mock data for pending appointment requests (patient, type, provider, status).
- Simulate provider availability logic and notification systems.

## 7.2. UI Implementation

- "Appointment Requests" section listing pending requests with patient ID, appointment type, and preferred provider.
- "Approve" button with availability validation and alternative options for unavailable slots.
- "Decline" button with optional reason prompt and patient notification.
- Automatic request removal and status updates after actions.

## 7.3. Security

- Access restricted to receptionist role.
- All updates logged for audit purposes.

## 7.4. Refactoring

- Replace "UD-REF: #Manage Appointment Requests" in codebase.

---

# 8. #Manage Appointment Calendar

Receptionists access a comprehensive appointment calendar with advanced scheduling, editing, and filtering capabilities.

## 8.1. Setup and Mock Data

- Mock appointment slots, providers, locations, services, and patient data.
- Mock real-time update triggers (simulate with state).

## 8.2. UI Implementation

- Calendar display in day, week, and month views with filter controls for provider, service, and location.
- "Add Appointment" button with form validation and notification sending.
- Drag-and-drop rescheduling with confirmation modals.
- Cancel appointment option with confirmation dialog.
- Real-time calendar updates and detailed appointment log/history access.

## 8.3. Security

- All data access restricted to authorised receptionist users.
- All actions are auditable and logged.

## 8.4. Refactoring

- Replace "UD-REF: #Manage Appointment Calendar" in codebase.

---

# 9. #Add to Waiting List

Receptionists add patients to waitlists for specific appointments and manage waitlist status.

## 9.1. Setup and Mock Data

- Mock waitlist entries, patients, providers, and services.
- Simulate waitlist notifications and status updates.

## 9.2. UI Implementation

- "Add to Waiting List" button for fully booked slots with form for Patient ID, Preferred Provider and Service, and desired date/time range.
- Field validation with appropriate warning messages for incomplete data.
- Automatic patient notification upon waitlist addition (mock).
- Real-time waitlist view updates as slots become available.

## 9.3. Security

- Only receptionists may add/manage waitlist entries.
- Data validation on all input fields.

## 9.4. Refactoring

- Replace "UD-REF: #Add to Waiting List" in codebase.

---

# 10. #Check-in Patient

Receptionists manage and log daily patient arrivals for appointments.

## 10.1. Setup and Mock Data

- Mock appointment list for today (patient, provider, time, status).
- Mock notifications and appointment status updates.

## 10.2. UI Implementation

- List today's upcoming appointments with search/filter by name or appointment ID.
- "Check-in" button for eligible appointments with detailed patient/appointment info display.
- Status update and provider notification upon check-in with confirmation messaging.
- Prevention of double check-in or check-in for cancelled appointments.
- Optional access to #View Medical Records from check-in detail page.

## 10.3. Security

- Limit access to authenticated receptionists only.
- Log all check-in actions for auditing purposes.

## 10.4. Refactoring

- Replace "UD-REF: #Check-in Patient" in codebase.

---

**All appointment management features should use mock data and follow Next.js project structure with shadcn/ui, TypeScript, and security standards throughout.**