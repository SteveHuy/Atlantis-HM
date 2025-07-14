Userdoc Implementation Plan

# 1. Build Homepage UI (#View Homepage)

## 1.1 Navigation Bar
- Place a fixed or sticky navigation bar at the top.
  - Left: Company logo (mock asset in `/public`).
  - Right: Menu links (“Login or Register”, “Features”, “Pricing”, “Contact”).
    - "Login or Register", "Features", and "Pricing" use scroll anchors.
    - "Contact" opens email client to `contact@atlantishms.com`.
- **Accessibility:** Keyboard navigable, focus ring, descriptive `aria-label`s for links.

## 1.2 Hero Section
- Add hero section at the top with:
  - Large heading: *Atlantis HMS – Modern Healthcare Management, Simplified.*
  - Subtext: *Streamline appointments, manage health records securely, and process insurance claims with ease. HIPAA compliant and accessible anywhere.*
  - Abstract, professional background image (SVG or PNG mock in `/public`).
- **Design:** Use nice blue for heading/button, white/grey backgrounds, black/grey for text.

## 1.3 Feature Overview Section
- Add a grid/list of feature cards:
  - "Fast, flexible appointment scheduling"
  - "Secure, accessible Electronic Health Records (EHR)"
  - "Real-time insurance claims processing"
  - "HIPAA compliance & mobile friendly"
- Each card:
  - Icon/illustration (SVG mock)
  - Title and short benefit subtext
- **UX:** Card layout adapts for mobile/tablet/desktop.
- **Accessibility:** Alt text on images, semantic headings.

## 1.4 Device Preview/Visuals
- Show responsive screenshots/mockups (PNG/SVG placeholders in `/public`):
  - Desktop, tablet, mobile side-by-side or carousel.
  - Caption: *Access your healthcare management tools anywhere.*
- **Design:** Ensure visuals scale and look sharp on retina displays.

## 1.5 User Type Section
- Add a “Who Are You?” section with three cards/buttons:
  - **Patient**: “Manage appointments and health records.”
    - Buttons: "Patient Login" and "Patient Register" (scroll/route to respective screens)
  - **Reception Staff**: “Handle scheduling and patient intake.”
    - Button: "Receptionist Login"
  - **Service Provider**: “Access EHR and billing tools.”
    - Button: "Service Provider Login"
- **Accessibility:** Each button is labelled for screen readers.
- **Navigation:** Buttons route or scroll to correct login/register screens.

## 1.6 Pricing Section
- Add pricing cards for:
  - **Basic Plan** – $29/month, essential features
  - **Standard Plan** – $59/month, all Basic + reporting tools
  - **Premium Plan** – $99/month, all Standard + priority support
- Each card: Features list, price, “Start Free Trial” and “Purchase” buttons (mocked, show alert).
- **Design:** Cards visually distinct, highlight "most popular" if needed.

## 1.7 Footer
- At page bottom, add:
  - Links: “Privacy Policy”, “Terms of Use”, “Contact” (email link)
  - Copyright notice
- **Accessibility:** Keyboard focusable links, high contrast text.

## 1.8 Design & Accessibility Compliance
- Use Tailwind’s spacing utilities for white space.
- Minimum font size, color contrast (WCAG 2.1 AA).
- Test with screen reader and tab navigation.
- **Responsiveness:** Check on mobile, tablet, desktop.

---

# 2. Patient Login UI (#Patient Login)

## 2.1 Login Screen
- Heading: “Login to Atlantis HMS”
- Form fields:
  - Username (required)
  - Password (required, type=password)
  - “Remember Me” checkbox (mock state, simulates persistent session)
- Buttons/links:
  - “Forgot Password?” – routes to #Recover Account
  - “Login” – validates fields, shows error or success (mock only)
  - “Sign Up” – routes to #Patient Register
- **Feedback:** Field-level validation, summary error “Invalid username or password.”
- **Security:** Input masking, prevent autofill on password, mark form with `autocomplete="off"`.
- **Logs:** Simulate logging login event in user activity (mock API).
- **Accessibility:** ARIA labels, error message roles, keyboard accessible.
- **HIPAA:** Use mock session and avoid storing PII in browser during UI phase.

---

# 3. Patient Register UI (#Patient Register, #Password Policy)

## 3.1 Registration Screen
- Heading: “Patient Registration”
- Form fields:
  - Name (required, 128 chars max)
  - Company name (optional, 256 chars max)
  - Email (required, valid, unique – check via mock API)
  - Password (required, shows password policy, type=password, `autocomplete="new-password"`)
  - Password Confirm (must match)
- Display password policy:
  - Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.
  - Show dynamic validation feedback for each rule as user types.
- Buttons:
  - “Register” – validates all, shows field errors, on success:
    - Mock account creation
    - Mock send verification email
    - Show “Registration successful, please verify your email”
    - Route to #Schedule Appointment
- **Accessibility:** Form labels, error message linking, keyboard navigation.
- **Security:** Sanitize inputs, never show password, use password fields.
- **API:** Use mock endpoint for registration and uniqueness check.

---

# 4. Patient Logout UI (#Patient logout)

## 4.1 Logout Flow
- In top-right user dropdown, add “Logout” menu item.
- On click: show confirmation modal: “Are you sure you want to logout?” with “Yes”/“No” buttons.
  - If “Yes”: 
    - End mock user session, clear session/token in frontend state.
    - Route to #Patient Login.
    - Show “Logged out successfully.”
  - If “No”: 
    - Close modal, do nothing.
- **Security:** Ensure all sensitive state is cleared on logout (mock only).
- **UX:** Modal is accessible, can be navigated by keyboard, and dismisses on ESC.

---

# 5. Patient Profile Management UI (#Profile Management)

## 5.1 Manage Profile Screen
- In user dropdown, add “Manage profile”.
- On click: Show Manage Profile page.
- Heading: “Manage Profile”
- Form: Pre-fill all fields as per #Patient Register with current mock user data.
- “Save Changes” button:
  - Validates inputs (same as registration)
  - Shows field errors if invalid
  - On success: update mock user profile, show “Profile updated successfully”, redirect to #Patient Dashboard
- **Accessibility:** Proper form labels, focus, and feedback.
- **Security:** All sensitive fields masked; use type="password" for password changes.

---

# 6. Account Recovery UI (#Recover Account)

## 6.1 Recovery Screen
- Heading: “Account Recovery”
- Options:
  - Email recovery (required)
  - Phone recovery (optional)
- “Submit” button:
  - Validates provided details (mock)
  - If invalid: show “Provided details do not match our records”
  - If valid: simulate sending password reset link/code, show “A reset link has been sent…”
- **API:** Mock Password API integration for reset requests.
- **Security:** 
  - Simulate use of HTTPS for API calls.
  - Enforce session expiry in mock state (e.g., token valid for 15 min).
  - Never expose sensitive data in responses.
- **oAuth:** Mock oAuth flow, with frontend state simulating token validation/expiry.

---

# 7. General Development Notes

## 7.1 Mock Data & API
- Use local mock data and mock API endpoints for all flows.
- Simulate API delays and error states for real-world testing.

## 7.2 Component & Folder Structure
- Place screens in `/app` directory.
- Place shared components (nav, footer, feature cards, etc.) in `/components/shared/`.
- Use `/lib/` for mock API clients.
- Store SVGs/images in `/public`.

## 7.3 Testing
- Add Storybook stories for all screens/components.
- Manually test for keyboard and screen reader accessibility.
- Validate forms and edge cases (long input, empty, invalid, etc.).

## 7.4 Styling
- Use Tailwind for all layout, color, and spacing.
- Apply the project's color palette and maintain strong white space.

## 7.5 Documentation
- Comment all components with usage notes and expected props.
- Document mock data flows and where API calls should be swapped in for production.

---

**End of Change Set**
