Userdoc Implementation Plan

# 1. #Make Payment

## 1.1 Create UI and Payment Flow
- 1.1.1: Display heading "Make a Payment".
- 1.1.2: Show a list of mock outstanding balances with payment amount (read-only) and billing details.
- 1.1.3: Add a "Select Method of Payment" dropdown (Credit Card, ACH Transfer).
- 1.1.4: Show payment input fields based on selected method:
    - For Credit Card: Card Number, Expiry Date, CVV, Name on Card (all required; mock validation for format).
    - For ACH Transfer: (Fields optional for mock unless UI requires.)
- 1.1.5: Add "Process Payment" button.

## 1.2 Input Validation and Processing
- 1.2.1: Validate all required fields, including:
    - Credit card format, expiry date in the future (mock logic).
- 1.2.2: On validation error, show error messages beside relevant fields.
- 1.2.3: If all inputs are valid:
    - Mock payment processing.
    - Show success message.
    - Mock update to account balance.
    - Simulate sending confirmation email (show a message only).
    - Navigate to #Patient Billing Overview (leave UD-REF if not implemented).

## 1.3 Security, Accessibility, and Mock Data
- 1.3.1: Use password-type fields where required.
- 1.3.2: Clearly label all fields and ensure tab/focus order is accessible.
- 1.3.3: Use only mock data for balances and billing info.
- 1.3.4: Add comments for future secure backend/payment gateway integration.

## 1.4 Codebase Reference Replacement
- 1.4.1: Search project root for "UD-REF: #Make Payment" and replace.
- 1.4.2: For any # referenced stories not in this plan, search the codebase and leverage if present, otherwise leave UD-REF.

---

# 2. #Manage Payment Plans

## 2.1 UI and Entry Points
- 2.1.1: Add "Manage Payment Plans" button on the Billing screen.
- 2.1.2: Heading "Manage Payment Plans".
- 2.1.3: List mock current plans with details (amount, interval, payment method).

## 2.2 Create New Payment Plan
- 2.2.1: 'Create New Plan' button shows form:
    - Total Amount (read-only)
    - Payment Interval (Weekly, Monthly)
    - Payment Method (Credit Card, Bank Transfer)
- 2.2.2: Validate all fields, show errors if invalid.
- 2.2.3: On valid, mock creation of new plan and update account record.

## 2.3 Adjust Existing Plan
- 2.3.1: Each plan allows 'Adjust Existing Plan' to edit.
- 2.3.2: Fields same as 'Create New Plan'.
- 2.3.3: Validate and mock update on 'Update Plan'.

## 2.4 Security and Mock Data
- 2.4.1: Sensitive fields marked for future secure handling.
- 2.4.2: Access only for logged-in patient (UI-level).
- 2.4.3: Use only mock data for all plans and balances.

## 2.5 Codebase Reference Replacement
- 2.5.1: Search project root for "UD-REF: #Manage Payment Plans" and replace.
- 2.5.2: For any # referenced stories not in this plan, search and leverage or leave UD-REF.

---

# 3. #Process Payments

## 3.1 UI and Payment Listing
- 3.1.1: Add "Payments" section on Receptionist dashboard.
- 3.1.2: List all mock pending payments:
    - Patient ID (linked to #Receptionist-Assisted Registration)
    - Amount
    - Payment Method (Credit Card, Debit Card, Insurance, Cash)

## 3.2 Process Payment
- 3.2.1: 'Process Payment' button validates details.
- 3.2.2: Show error messages for invalid input.
- 3.2.3: On valid, mock payment processing:
    - Update mock account balance.
    - Generate mock receipt.
    - Show "Payment processed successfully".
    - Redirect to #Generate Patient Statements (leave UD-REF if not implemented).
    - Log to #User Activity Logs Table (leave UD-REF if not implemented).

## 3.3 Security, Access, Mock Data
- 3.3.1: Note in code for receptionist-only access (UI-level).
- 3.3.2: Only mock data, no real payment info stored.

## 3.4 Codebase Reference Replacement
- 3.4.1: Search root for "UD-REF: #Process Payments" and replace.
- 3.4.2: For referenced features, search and leverage or leave UD-REF.

---

# 4. #Automatic Late Payment Report

## 4.1 Automated Report (Mock UI)
- 4.1.1: Simulate weekly scheduler for Monday 6am.
- 4.1.2: Show sample email to Receptionist:
    - Subject: "Weekly Late Payment Report"
    - Body: Summary of late payments, link to #Process Payments or "No late payments this week".
    - Attach mock PDF report (Patient Name, Appointment Date, Provider, Amount Overdue).

## 4.2 No Real Scheduling or Email
- 4.2.1: Add button in UI to "Simulate Report Run".
- 4.2.2: Comment in code for future backend/email integration.

## 4.3 Codebase Reference Replacement
- 4.3.1: Search root for "UD-REF: #Automatic Late Payment Report" and replace.
- 4.3.2: For any referenced features, search and leverage or leave UD-REF.

---

# 5. #Receive Remittance Advice

## 5.1 Remittance Advice UI
- 5.1.1: Create section for "Remittance Advice".
- 5.1.2: Allow claim selection (dropdown of mock claim IDs).
- 5.1.3: Show remittance advice details (Claim ID, Payer, Amount Paid).
- 5.1.4: 'Reconcile' button to process reconciliation.

## 5.2 Reconciliation Flow
- 5.2.1: On reconcile, mock-update patient account (adjust balances).
- 5.2.2: Generate mock reconciliation report.
- 5.2.3: Show "Reconciliation completed successfully".
- 5.2.4: Redirect to #Process Payments (leave UD-REF if not implemented).
- 5.2.5: Log to #User Activity Logs Table (leave UD-REF if not implemented).

## 5.3 Security, Access, Mock Data
- 5.3.1: Comment for secure handling and receptionist-only UI (mock only).
- 5.3.2: All data is mock/stub.

## 5.4 Codebase Reference Replacement
- 5.4.1: Search root for "UD-REF: #Receive Remittance Advice" and replace.
- 5.4.2: For referenced features, search and leverage or leave UD-REF.

---

# 6. #View Patient Billing Info

## 6.1 Billing Info Display
- 6.1.1: Allow selection of patient from mock Billing & Payments Table.
- 6.1.2: Show billing details: total, paid, balance, claim ID, payment date.
- 6.1.3: List past transactions/payments (mock).
- 6.1.4: Add filters for date/service type.
- 6.1.5: Provide statement download/print (mock).

## 6.2 Outstanding, Claims, Notes
- 6.2.1: Show outstanding balances.
- 6.2.2: Display claim statuses linked to billing.
- 6.2.3: Show insurance details (mock).
- 6.2.4: Allow notes/comments on transactions.
- 6.2.5: 'Update' button for manual adjustment with field validation.
- 6.2.6: Log to #User Activity Logs Table (leave UD-REF if not implemented).

## 6.3 Security, Navigation, Access
- 6.3.1: Comment for future access control and security.
- 6.3.2: Link to #View Patient EHR for clinical details (leave UD-REF if not implemented).

## 6.4 Codebase Reference Replacement
- 6.4.1: Search root for "UD-REF: #View Patient Billing Info" and replace.
- 6.4.2: For referenced features, search and leverage or leave UD-REF.

---

# Notes

- For all implemented features, always perform root codebase search for UD-REF replacement.
- Always check if referenced #Features exist before leaving a UD-REF.
- All data flows are mock-only; no real backend or sensitive data handling in this UI phase.
