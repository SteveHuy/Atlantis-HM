Userdoc Implementation Plan

---

# 1. #Receptionist-Assisted Registration

## 1.1. Search Codebase for UD-REF: #Receptionist-Assisted Registration
- Search for all codebase references (comments, stubs, tests) for "UD-REF: #Receptionist-Assisted Registration".
- Mark for replacement or removal once the new feature is implemented.

## 1.2. Build Registration UI & Form
- Create `/receptionist/register` page or component.
- Heading: “Receptionist-Assisted Registration”
- Form Fields:
    - Full Name (required, max 128 chars)
    - Date of Birth (required, date)
    - Email (required, valid format)
    - Phone (required, valid format)
    - Insurance Details (optional, dropdown; populate with mock providers)
    - Username (required, unique, max 128 chars; validate against mock data)
    - Password (required, must meet complexity: min 8 chars, upper/lower/number)

## 1.3. Form Validation and Feedback
- Validate each field in real-time and on submit using a validation schema.
- Show inline validation errors.
- Disable 'Register' until all required fields are valid.

## 1.4. Submission and Registration Flow
- On submit:
    - Validate all fields, show errors if any invalid.
    - If valid:
        - Add mock patient record to in-memory store.
        - Generate temporary credentials.
        - Simulate "send verification email" (display a toast: “Verification email sent to [email]”).
        - Redirect to #Patient Login.
- Sanitize all inputs before storing or displaying any feedback.

## 1.5. Security & Access
- Ensure the page is only accessible to Receptionist role (mock session/context check).
- Never show sensitive credentials in UI after registration.
- Do not leak user or password data in logs.

## 1.6. Refactor UD-REF
- Replace any "UD-REF: #Receptionist-Assisted Registration" stubs/references with the implemented feature or remove as appropriate.

---

# 2. #Receptionist Login

## 2.1. Search Codebase for UD-REF: #Receptionist Login
- Find all previous code, tests, or comments for this feature.

## 2.2. Implement Login UI & Flow
- Page: `/receptionist/login`
- Heading: “Receptionist Login”
- Fields: Username (required, max 128), Password (required)
- 'Login' button, 'Forgot Password?' link

## 2.3. Auth, Validation & Security
- Validate input fields on submit.
- Authenticate against mock receptionist user data.
    - On fail: show generic error, increment failed login attempts.
    - Lockout after 5 failed attempts, display lockout info.
    - On success: start mock session, log event, redirect to #Manage Appointment Calendar.
- Session timeout warnings and input clearing on logout/timeout.
- Never indicate whether username or password was specifically incorrect.

## 2.4. Refactor UD-REF
- Replace or remove any "UD-REF: #Receptionist Login" in codebase.

---

# 3. #Receptionist logout

## 3.1. Search Codebase for UD-REF: #Receptionist logout

## 3.2. Add/Refine Logout Button and Flow
- Place logout button prominently in nav/header when Receptionist logged in.
- On click, show confirmation dialog.
    - If confirmed: clear session/context, in-memory tokens, and cookies.
    - Redirect to login with "You have been logged out" message.
    - Log event in mock audit log.
    - Block access to protected receptionist pages post-logout.

## 3.3. Security & Compliance
- Ensure no session or user data persists after logout.
- No access to any receptionist-specific pages after logout.
- Follow HIPAA compliance: no unauthorized access or leaks.

## 3.4. Refactor UD-REF
- Replace or remove any "UD-REF: #Receptionist logout".

---

# 4. #Update Emergency Contact

## 4.1. Search Codebase for UD-REF: #Update Emergency Contact

## 4.2. Implement Emergency Contact Section
- Add "Update Emergency Contact" to patient profile page.
- Fields: Name (required), Relation (dropdown, mock options), Contact Info (required)
- Save button

## 4.3. Validation & Save Flow
- On submit: validate all fields, show inline errors if any missing.
- If valid: update in-memory patient data, show success message, redirect to #Profile Management.

## 4.4. Refactor UD-REF
- Replace or remove any "UD-REF: #Update Emergency Contact".

---

# 5. #Recover Account

## 5.1. Search Codebase for UD-REF: #Recover Account

## 5.2. Build Recovery Page & Flow
- Page: `/patient/recover`
- Heading: “Account Recovery”
- Fields: Email (required), Phone (optional)
- Submit button

## 5.3. Mock Recovery Logic
- Validate input; match against mock patient data.
- If no match: show error.
- If matched:
    - Simulate password reset API & oAuth token creation (token expires after 15 min).
    - Simulate sending reset link/code.
    - On "reset", prompt for new password (policy enforced), show confirmation, and prompt login.

## 5.4. Security
- No sensitive info in logs or UI.
- All communication assumed secure (simulate HTTPS).

## 5.5. Refactor UD-REF
- Replace or remove any "UD-REF: #Recover Account".

---

# 6. #Service Provider Login

## 6.1. Search Codebase for UD-REF: #Service Provider Login

## 6.2. Implement Provider Login UI & Flow
- Page: `/provider/login`
- Fields: Username, Password, Remember Me
- Validate input, authenticate against mock provider data.
- On success: create session (honor Remember Me for 30 days), log event, redirect to #Access Appointment Schedules.
- On fail: error and lockout after 5 attempts.

## 6.3. Refactor UD-REF
- Replace or remove any "UD-REF: #Service Provider Login".

---

# 7. #Service Provider logout

## 7.1. Search Codebase for UD-REF: #Service Provider logout

## 7.2. Add/Refine Logout Button and Flow
- Visible when provider logged in.
- Ends session, clears data, logs event, prevents protected access, and redirects to login.

## 7.3. Refactor UD-REF
- Replace or remove any "UD-REF: #Service Provider logout".

---

# 8. Mock Data Preparation

## 8.1. Populate In-Memory Mock Data
- Receptionists, Providers, Patients (all with required fields).
- Insurance providers and relation options.
- Mock audit/event log.

---

# 9. Component, Utilities & Validation Structure

## 9.1. Component Organization
- Use directories: `components/account/`, `components/auth/`, `components/profile/`.
- Validation schemas in `lib/validation.ts`.
- Mock API/data logic in `lib/mock-api.ts`.
- State/session in-memory (Zustand/context, not persisted).

---

# 10. Testing & Demo Readiness

## 10.1. Basic Jest/RTL Tests
- Render, validate, login/logout, session expiry, navigation, access, and error/success states.
- Replace any tests referencing UD-REF tags.

---
