Userdoc Implementation Plan

 
1. #Submit Insurance Details

 
High-Level Steps

    Add "Insurance Details" menu option in the Patient's top-right user dropdown.
    Create an "Insurance Details" form page:
        Heading: "Insurance Details"
        Fields: Provider (dropdown with mock data), Policy Number (text input)
        'Submit' button
    Implement form validation using zod:
        Ensure provider is selected and policy number is not empty.
        Display inline validation feedback.
    On successful validation:
        Simulate API call to submit data (use mock data and delay for realism).
        Show confirmation: "Insurance details submitted for verification."
        Redirect to Patient Dashboard.
    Add test cases to check form validation, happy path, and error states.
    Add corresponding logic for replacing references in the codebase (search for "UD-REF: #Submit Insurance Details", replace with actual implementation).

Technical Considerations

 
Input Validation & Security

    Use client-side zod schema validation for form data.
    Sanitize all outputs and error feedback.
    Do not save to real database yet—use mock data/state for UI validation.

UI/UX

    Follow shadcn/ui and Tailwind CSS for input elements and feedback.
    Use accessible ARIA roles for form elements and status messages.

Referenced Stories

    If #Patient Dashboard is referenced, check if implemented. If not, leave a comment: UD-REF: #Patient Dashboard.

 
2. #Submit Insurance Claims

 
High-Level Steps

    Create the Claim Submission Interface for Receptionists:
        Auto-filled Patient details (use mock patient data).
        Encounter Info (dropdown, populated from mock encounters).
        Charges field (currency input).
    Add "Submit Claim" button with:
        zod/similar schema validation for all fields.
        Real-time inline field validation and error display.
    On successful submission:
        Simulate formatting the claim using a standard (mock HIPAA 5010–styled JSON/XML object).
        Mock API call to "submit" the claim.
        Show confirmation message on success; error message on failure.
        Save to mock claims list.
    Update mock audit trail state with submission action.
    Notify user via in-page alert/message about submission.
    After success, redirect to #Track Claim Status.
    Search the codebase and replace any "UD-REF: #Submit Insurance Claims" with the completed implementation.

Technical Considerations

 
Input Security & Validation

    Strong field validation, currency normalization, prevent empty/invalid submissions.
    Use consistent error reporting patterns as per guidelines.

Audit Trail

    For this UI mock, simply log/subtract in in-memory audit state.

Redirection/Navigation

    Use Next.js navigation after claim submission.

Referenced Stories

    Check if #Track Claim Status is implemented. If not, add UD-REF: #Track Claim Status.

 
3. #Verify Insurance on Registration

 
High-Level Steps

    During patient registration (Receptionist flow), include an insurance verification section:
        Provider (dropdown with mock values)
        Policy Number (text input)
        'Verify' button
    On "Verify":
        Validate both fields are filled.
        Show inline error feedback if invalid/missing.
    If valid, simulate a verification request (mock API with real-time status: active/inactive/invalid).
    Show real-time status:
        If "active": show success, allow registration continuation, mark patient insurance as "active" (mock).
        If "inactive"/"invalid": show detailed error message, allow corrections or skip.
    Log verification attempts in a mock audit trail.
    Redirect back to #Receptionist-Assisted Registration or advance registration process.
    Search codebase for "UD-REF: #Verify Insurance on Registration" and update as required.

Technical Considerations

 
Real-Time Feedback

    Use loading indicators during mock API verification.
    Show clear, distinct statuses using accessible component patterns.

Audit Logging

    Log verification state to in-memory logs for mock/demo.

Referenced Stories

    Check if #Receptionist-Assisted Registration is present. If not, add UD-REF: #Receptionist-Assisted Registration.

 
4. #Track Claim Status

 
High-Level Steps

    Create claim tracking UI for Receptionists:
        Search by Claim ID or Patient ID (inputs).
        "Search" button triggers mock claim fetch.
    Show results in a table:
        Columns: Claim ID, Date Submitted, Status, Amount.
        Support pagination, result count, and page track.
    Allow sorting by Status and Date Submitted (column header click).
    Filtering dropdown for claim status.
    Show status changes in real-time (simulate with occasional state updates).
    "View Details" expands/collapses claim row, with payer/rejection info if relevant.
    Log search/view in audit trail.
    Allow claim updates/required actions inline.
    On managing rejected claims, redirect to #Manage Rejections and Appeals as needed.
    Update codebase, replacing "UD-REF: #Track Claim Status" references.

Technical Considerations

 
UI Patterns and Accessibility

    Use shadcn/ui Table, Dropdown, and Pagination components.
    Support keyboard navigation.

Real-Time Status Simulation

    Use mock websocket or timed state updates to demonstrate dynamic updates.

Data Mocking

    Implement a robust set of mock claims (with all statuses) and patient datasets.

Referenced Stories

    Check if #Manage Rejections and Appeals is implemented; if not, add UD-REF: #Manage Rejections and Appeals.

 
5. #Review Insurance Eligibility

 
High-Level Steps

    Add "Eligibility Verification" interface for Service Providers:
        Patient Insurance Info (text, required)
        Service Date (date, required)
    'Check Eligibility' button:
        Form validated with zod.
        Simulate API checking eligibility (mock: active, inactive, coverage details).
    On response, show:
        Status, Limit, Co-pay/deductible info.
        If eligible: show "Eligible for Service"; enable next service actions.
        If not: show "Service Not Covered"; provide prompt for self-pay/alternative.
    Allow printing or downloading eligibility summary (PDF/download as text).
    Log result in mock patient record audit trail.
    Display historical verification attempts.
    Update "UD-REF: #Review Insurance Eligibility" in the codebase.

Technical Considerations

 
Security & Data Handling

    Sensitive patient info must be simulated only (never real).
    Downloaded/printed files to omit identifying details for privacy during mock/demo.

Integration

    Abstract insurance API simulation through a shared utilities layer (lib/).

 
6. #Process Claim Submissions

 
High-Level Steps

    Allow service provider to select patient and claim (from mock lists).
    Show claim form with prefilled details from mock EHR/Insurance Claims Table.
    Support claim editing (dates, codes, amounts).
        Use zod for robust validation.
    "Submit" triggers:
        Validate input; format for transmission.
        Simulate electronic claim submission to payer (mock API).
        Confirm submission, show claim ref number.
        Save submission to in-memory claims list.
    After submission:
        Show real-time claim status as it updates.
        Errors prompt corrections and allow resubmission.
        Update history for each patient with claim results.
        Redirect to #Track Claim Status post-processing.
    Update "UD-REF: #Process Claim Submissions" strings in codebase appropriately.

Technical Considerations

 
Data Consistency

    Always keep claim lists in sync across roles by updating shared mock data/state.

Error Simulation

    Simulate status transitions (e.g., submitted → processed → paid/denied) for demo.

Referenced Stories

    Ensure #Track Claim Status is referenced/implemented; add UD-REF: #Track Claim Status if not.

 
7. #View Insurance Claims

 
High-Level Steps

    For Patients: create "Insurance Claims" viewing UI:
        Heading: "Insurance Claims"
        List of claims with: ID, Date, Amount, Status
        Dropdown for status filtering; search bar for ID/Date.
        Allow sorting by columns (click).
    Clicking a claim expands for detail:
        Patient Details (read-only)
        Encounter Info and Billing Codes
        Download summary as PDF (simulate download).
    'Back' button returns to #Patient Dashboard.
    Simulate real-time status updates if available.
    Update "UD-REF: #View Insurance Claims" strings in codebase.

Technical Considerations

 
Security & Data Privacy

    Claims summary must exclude sensitive identifiers for mock/demo PDF.

UI and State

    Render with shadcn/table, responsive for mobile/desktop.

Referenced Stories

    #Patient Dashboard: check existence, otherwise note UD-REF: #Patient Dashboard.

 
8. Cross-story Search & Reference Handling

 
High-Level Steps

    For any referenced stories (via a #) not in this plan, search the codebase to see if it has already been implemented, and leverage if it has. Otherwise, leave the appropriate comment (UD-REF: #feature A) at the relevant places.

 
End of Change Set.
