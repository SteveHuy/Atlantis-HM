Userdoc Implementation Plan

# Account Management Implementation Plan

This implementation plan covers the homepage, authentication, and dashboard functionality for the Atlantis HMS system, handling all account management features for patients and service providers.

---

# 1. #View Homepage

Provide a comprehensive landing page showcasing system features, pricing, and user type navigation for the Atlantis HMS platform.

## 1.1. Setup and Mock Data

- Mock company assets and logos in `/public` directory.
- Mock pricing plans data with features and costs.
- Mock user testimonials and feature statistics.
- Mock contact information and support details.

## 1.2. UI Implementation

- **Navigation Bar**: Fixed header with company logo (left) and menu links (right):
  - "Login or Register", "Features", "Pricing" (scroll anchors)
  - "Contact" opens email client to `contact@atlantishms.com`
- **Hero Section**: Large heading with professional background and call-to-action
- **Feature Overview**: Grid of feature cards with icons and benefit descriptions
- **Device Preview**: Responsive mockups showing cross-platform compatibility
- **User Type Section**: Three distinct cards for Patient, Reception Staff, and Service Provider access
- **Pricing Section**: Three-tier pricing cards with feature lists and action buttons
- **Footer**: Privacy links, terms, contact information, and copyright notice
- Use Tailwind for responsive design across mobile, tablet, and desktop
- Ensure all interactive elements are keyboard accessible with proper focus rings

## 1.3. Security

- No authentication required for homepage access.
- Contact forms should validate input to prevent malicious submissions.
- External links open in new tabs with appropriate security attributes.

## 1.4. Refactoring

- Replace "UD-REF: #View Homepage" in codebase.

---

# 2. #Patient Login

Enable secure patient authentication with proper validation and session management.

## 2.1. Setup and Mock Data

- Mock patient user accounts with encrypted passwords.
- Mock session management system for authentication state.
- Mock "remember me" functionality with extended session duration.
- Mock user activity logging system.

## 2.2. UI Implementation

- Create `/app/patient/login/page.tsx` with login form:
  - Username field (required, text input)
  - Password field (required, masked input with show/hide toggle)
  - "Remember Me" checkbox for extended sessions
  - "Forgot Password?" link to account recovery
  - "Sign Up" link to patient registration
- **Validation**: Field-level and form-level error messages
- **Success Flow**: Redirect to Patient Dashboard on successful authentication
- **Error Handling**: Display "Invalid username or password" for failed attempts
- Form includes proper autocomplete attributes and ARIA labels
- Implement rate limiting display for multiple failed attempts

## 2.3. Security

- Simulate secure password handling with proper input masking.
- Mock session token generation and validation.
- Implement mock rate limiting for login attempts.
- Log all authentication events in mock user activity system.
- Use secure form attributes to prevent password manager conflicts.

## 2.4. Refactoring

- Replace "UD-REF: #Patient Login" in codebase.

---

# 3. #Patient Register

Provide secure patient registration with password policy enforcement and email verification simulation.

## 3.1. Setup and Mock Data

- Mock user uniqueness validation system.
- Mock email verification workflow.
- Mock password policy enforcement rules.
- Mock account creation confirmation system.

## 3.2. UI Implementation

- Create `/app/patient/register/page.tsx` with registration form:
  - Name field (required, 128 character limit)
  - Company name field (optional, 256 character limit)
  - Email field (required, with uniqueness validation)
  - Password field (required, with policy display)
  - Confirm password field (must match primary password)
- **Password Policy Display**: Real-time validation feedback showing:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- **Success Flow**: Mock email verification, redirect to Schedule Appointment
- **Validation**: Dynamic field validation with clear error messaging
- Form uses proper autocomplete and accessibility attributes

## 3.3. Security

- Simulate secure password storage and validation.
- Mock email verification to prevent automated registrations.
- Validate and sanitise all input fields before processing.
- Use secure password field attributes to prevent exposure.

## 3.4. Refactoring

- Replace "UD-REF: #Patient Register" in codebase.

---

# 4. #Patient Logout

Implement secure logout functionality with session cleanup and confirmation.

## 4.1. Setup and Mock Data

- Mock session management system for cleanup.
- Mock user activity logging for logout events.
- Mock session token invalidation system.

## 4.2. UI Implementation

- Add "Logout" option to user dropdown menu in top-right corner
- **Confirmation Modal**: "Are you sure you want to logout?" with Yes/No buttons
- **Success Flow**: Clear session state, show success message, redirect to login
- **Cancel Flow**: Close modal and maintain current session
- Modal is keyboard accessible and dismissible with ESC key
- Logout button prominently placed and easily accessible

## 4.3. Security

- Complete session cleanup including all authentication tokens.
- Invalidate all stored session data in frontend state.
- Log logout events in user activity system.
- Prevent access to protected routes after logout.

## 4.4. Refactoring

- Replace "UD-REF: #Patient logout" in codebase.

---

# 5. #Profile Management

Allow patients to view and update their account information with proper validation.

## 5.1. Setup and Mock Data

- Mock current patient profile data.
- Mock profile update validation system.
- Mock success confirmation messaging.

## 5.2. UI Implementation

- Add "Manage Profile" option to user dropdown menu
- Create profile management page with form pre-filled with current data:
  - Same fields as registration form
  - Include password change option (current + new + confirm)
- **Save Changes**: Validate inputs, show errors, update profile on success
- **Success Flow**: Display confirmation message, redirect to Patient Dashboard
- **Validation**: Same rules as registration with additional current password verification
- Form maintains accessibility standards and proper field labelling

## 5.3. Security

- Require current password verification for sensitive changes.
- Validate all updated information before saving.
- Log profile update events in user activity system.
- Mask sensitive fields appropriately during display.

## 5.4. Refactoring

- Replace "UD-REF: #Profile Management" in codebase.

---

# 6. #Recover Account

Provide secure account recovery options through email and optional phone verification.

## 6.1. Setup and Mock Data

- Mock password reset token generation system.
- Mock email and phone verification workflows.
- Mock account validation against existing records.

## 6.2. UI Implementation

- Create `/app/account/recover/page.tsx` with recovery options:
  - Email recovery field (required)
  - Phone recovery field (optional)
  - Submit button with validation
- **Validation Flow**: Check provided details against mock records
- **Error Handling**: "Provided details do not match our records" for invalid attempts
- **Success Flow**: Mock password reset link generation, display confirmation message
- Form includes clear instructions and accessibility features

## 6.3. Security

- Simulate secure token generation with expiry (15 minutes).
- Mock HTTPS endpoint for reset requests.
- Implement rate limiting for recovery attempts.
- Never expose sensitive data in error messages or responses.

## 6.4. Refactoring

- Replace "UD-REF: #Recover Account" in codebase.

---

# 7. #Patient Dashboard

Provide a comprehensive dashboard for logged-in patients with navigation, alerts, and quick access to key features.

## 7.1. Setup and Mock Data

- Mock patient personal information and session state.
- Mock appointment data, recent activity, and notifications.
- Mock insurance claim status information.
- Mock medical record summaries.

## 7.2. UI Implementation

- Create `/app/patient/dashboard/page.tsx` as main patient landing page:
  - Welcome message with patient first name
  - Persistent navigation menu with links to all patient features
  - Notice area for alerts and pending actions
  - Upcoming appointments summary (next 3 appointments)
  - Recent activity section (last 5 actions)
  - Insurance claim status overview
  - Account settings access
  - Dashboard search bar for feature navigation
  - Help and support contact information
- **Navigation**: Highlight active page, ensure keyboard accessibility
- **Empty States**: Show appropriate messaging when no data available
- **Quick Actions**: Easy access to frequently used features
- Responsive design for all device sizes

## 7.3. Security

- Verify patient authentication before displaying any personal information.
- Only show data belonging to the authenticated patient.
- Implement secure logout with prominent, accessible logout button.
- Log dashboard access and interactions in user activity system.

## 7.4. Refactoring

- Replace "UD-REF: #Patient Dashboard" in codebase.

---

# 8. #Service Provider Login

Enable secure authentication for healthcare service providers with enhanced security measures.

## 8.1. Setup and Mock Data

- Mock service provider user accounts with role-based permissions.
- Mock enhanced security session management.
- Mock user activity logging specifically for provider access.

## 8.2. UI Implementation

- Create `/app/provider/login/page.tsx` with provider-specific login:
  - Username field (required)
  - Password field (required, enhanced security)
  - Remember Me checkbox (30-day session option)
  - "Forgot Password?" link to provider account recovery
- **Enhanced Security**: Stricter password policy enforcement
- **Success Flow**: Redirect to Access Appointment Schedules
- **Error Handling**: Enhanced security messaging for failed attempts
- **Audit Trail**: Log all provider login events
- Form designed specifically for healthcare provider workflow

## 8.3. Security

- Implement enhanced session security for healthcare provider access.
- Mock HIPAA-compliant session management.
- Stricter authentication requirements than patient login.
- Enhanced audit logging for all provider authentication events.

## 8.4. Refactoring

- Replace "UD-REF: #Service Provider Login" in codebase.

---

# 9. #Service Provider Logout

Implement secure logout for service providers with enhanced session cleanup and audit trail.

## 9.1. Setup and Mock Data

- Mock enhanced session invalidation system.
- Mock comprehensive audit logging for provider sessions.
- Mock secure token cleanup procedures.

## 9.2. UI Implementation

- Prominent "Logout" button in header on all provider pages
- **Enhanced Confirmation**: Clear confirmation of logout action
- **Complete Session Cleanup**: Invalidate all session tokens
- **Success Messaging**: "You have been logged out successfully"
- **Audit Trail**: Log all logout events with timestamp
- **Re-authentication**: Require full login to regain access
- **Quick Return**: Provide "Log back in" option after successful logout

## 9.3. Security

- Complete session invalidation with audit trail.
- Enhanced security cleanup for healthcare provider sessions.
- Prevent any residual access to protected healthcare information.
- Comprehensive logging of all logout events for compliance.

## 9.4. Refactoring

- Replace "UD-REF: #Service Provider logout" in codebase.

---

**All account management features should use mock data, follow HIPAA compliance requirements, and maintain accessibility standards using shadcn/ui and TypeScript throughout.**
