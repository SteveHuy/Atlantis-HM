Userdoc Implementation Plan

# 1. #Manage Rejections and Appeals

Implement an interface for receptionists to view, edit, and appeal rejected claims, supporting both resubmission and formal appeals.

## 1.1. Setup and Mock Data

- Prepare mock data for rejected claims (claim ID, patient, date, payer, original details, denial reasons).
- Mock endpoints for claim resubmission and appeal submission.
- Mock audit trail entries and claim statuses.

## 1.2. UI Implementation

- Display a rejected claims management page:
    - List all rejected claims, filterable by patient or date.
    - Clicking a claim shows details: original claim info (read-only), denial reasons, and editable adjustment fields.
- Provide 'Edit Claim' option, with:
    - All original claim fields as read-only.
    - Adjustment fields for corrections (e.g., procedure code, amount, notes).
- 'Resubmit Claim' button:
    - Validate adjustment fields before submission.
    - If errors, show inline field validation messages.
    - On success, simulate resubmission and show confirmation.
    - Log action in audit trail (mock).
- 'Submit Appeal' button:
    - Navigates to appeal form with claim ID pre-filled and a large text area for an appeal letter.
    - Submit triggers mock electronic status (pending, accepted, rejected).
    - Log appeal submission in audit trail.
- After resubmission/appeal, redirect to #Track Claim Status.

## 1.3. Security and Validation

- Restrict access to receptionists only.
- Validate all input fields client-side (mock with zod).
- Display only relevant claim info; never leak patient PII.

## 1.4. Refactoring

- Replace "UD-REF: #Manage Rejections and Appeals" in codebase.

---

# 2. #Handle Phone Inquiries

Create a UI flow for logging phone inquiries, searching patients, and managing appointments over the phone.

## 2.1. Setup and Mock Data

- Mock patient data with names, phone numbers, and appointment histories.
- Mock appointment management actions (schedule, reschedule, cancel).
- Prepare sample call logs and reference numbers.

## 2.2. Phone Inquiry UI

- "Log Phone Inquiry" button: opens a modal/form to:
    - Capture caller name/number and reason for call.
    - Search existing patients by name or phone.
    - If found, show patient appointment history inline.
    - Allow receptionist to schedule, reschedule, or cancel appointments for the caller.
    - On appointment actions, show confirmation, update patient record (mock), and offer to send confirmation by SMS/email.
- 'Save' button:
    - Save log details to patient record (mocked).
    - Display unique reference number.
- "Transfer to Department" feature:
    - Allow receptionist to assign call with transfer notes.
    - (Mock) Notify relevant department.
- Upon finishing, redirect to #Manage Appointment Calendar.

## 2.3. Security and Validation

- Input validation for phone, name, and reason.
- Protect all patient data; show only to authenticated receptionists.

## 2.4. Refactoring

- Replace "UD-REF: #Handle Phone Inquiries" in codebase.

---

# 3. #Manage Appointment Requests

Receptionists view and process all pending appointment requests, either confirming or declining as appropriate.

## 3.1. Setup and Mock Data

- Prepare mock data for pending appointment requests (patient, type, provider, status).
- Simulate provider availability logic.
- Mock notifications for confirmations and declines.

## 3.2. Appointment Requests UI

- "Appointment Requests" section:
    - List of all pending requests, with patient ID, appointment type, and preferred provider.
    - "Approve" button:
        - On click, validate provider slot availability (mock logic).
        - If available, confirm appointment, notify patient, remove request.
        - If unavailable, prompt for alternative date or provider selection.
    - "Decline" button:
        - Prompts for (optional) reason.
        - Sends notification to patient, removes request.
- After action, redirect to #Manage Appointment Calendar for further edits.

## 3.3. Security

- Access restricted to receptionist role.
- All updates should be logged (mocked).

## 3.4. Refactoring

- Replace "UD-REF: #Manage Appointment Requests" in codebase.

---

# 4. #Manage Appointment Calendar

Receptionists access a comprehensive appointment calendar with advanced scheduling, editing, and filtering capabilities.

## 4.1. Setup and Mock Data

- Mock appointment slots, providers, locations, services, and patient data.
- Mock real-time update triggers (simulate with state).

## 4.2. Calendar UI Implementation

- Display calendar in day, week, and month views (shadcn/ui or fullcalendar component).
- Filter controls for provider, service, and location.
- "Add Appointment" button:
    - Form with required fields: Patient ID, Provider, Service, Date, and Time.
    - On submit, validate slot availability.
    - On success, schedule appointment and send notifications to patient/provider.
- Support drag-and-drop to reschedule appointments (with confirmation modal).
- Cancel appointment option (with confirmation dialog).
- Real-time calendar updates (mock with optimistic UI updates).
- Show detailed appointment log/history (modal or sidebar) for selected calendar entry.

## 4.3. Integration

- Sync actions with other appointment features (requests, phone inquiries, waitlist).
- Upon changes (reschedule, cancel), send notifications and update state.

## 4.4. Security

- All data access restricted to authorized receptionist users.
- All actions are auditable.

## 4.5. Refactoring

- Replace "UD-REF: #Manage Appointment Calendar" in codebase.

---

# 5. #Add to Waiting List

Receptionists add patients to waitlists for specific appointments and manage waitlist status.

## 5.1. Setup and Mock Data

- Mock waitlist entries, patients, providers, and services.
- Simulate waitlist notifications.

## 5.2. Waitlist UI

- "Add to Waiting List" button (shown for fully booked slots):
    - Opens form to capture:
        - Patient ID (required)
        - Preferred Provider and Service (dropdowns)
        - Desired date/time range
    - On "Add," validate all fields.
        - If incomplete, show warning messages.
        - If correct, add to waitlist and show confirmation.
    - On addition, automatically send notification to patient (mock).
    - Waitlist view updates as slots become available (mock polling/state update).

## 5.3. Security

- Only receptionists may add/manage waitlist entries.
- Data validation on all input.

## 5.4. Refactoring

- Replace "UD-REF: #Add to Waiting List" in codebase.

---

# 6. #Check-in Patient

Receptionists manage and log daily patient arrivals for appointments.

## 6.1. Setup and Mock Data

- Prepare mock appointment list for today (patient, provider, time, status).
- Mock notifications and appointment status updates.

## 6.2. Check-in UI

- List today's upcoming appointments with search/filter by name or appointment ID.
- Each entry has "Check-in" button if appointment is in the future and not already checked in/cancelled.
- On selection, show detailed patient/appointment info.
- On "Check-in," update status and notify provider.
- Display confirmation: "Patient checked in successfully."
- Update appointment status in dashboard (optimistic UI update).
- Prevent double check-in or check-in for cancelled appointments.
- Option to view #View Medical Records from check-in detail page.

## 6.3. Security

- Limit access to authenticated receptionists.
- Log all check-in actions for auditing.

## 6.4. Refactoring

- Replace "UD-REF: #Check-in Patient" in codebase.

---

**All features should use mock data and follow your project’s Next.js, TypeScript, and shadcn/ui guidelines. No backend/API or migration changes required for UI build. All actions should have appropriate field validation, access control, and feedback messages for the user.**

Let me know if you want deeper breakdowns, wireframes, or acceptance test cases for any of these features!
