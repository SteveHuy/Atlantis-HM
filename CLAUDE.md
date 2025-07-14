# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You MUST ALWAYS log ALL your activity within "claude.log" such as your TODO plan and the individiual steps within the TODO plan.

# 🧱 Userdoc Project Guideline

First, you have to check you can connect to a Userdoc MCP server if you cannot connect to the MCP stop immediately and respond with "I cannot access Userdoc".

This guide indicates how you MUST implement implementation plans from markdown documents. These documents will start with "Userdoc Implementation Plan"

You will be given implementation plans which are markdown documents that contain all of the steps you need to implement an epic within the system. Ensure when you are implementing the plan you DO NOT effect any code that is not effected by the epic within the implementation plan.

Within the implementation plan there will be "#" which are requirements in Userdoc - you MUST retrieve those requirements via MCP to get their full details.

Features ALWAYS map to a Userdoc Requirement through the "#"

## Implementation Plan vs Userdoc Requirements Resolution
1. **If a Userdoc requirement references a feature (#Something) that is NOT mentioned in the current implementation plan:**
    - MUST add a comment in the code: `UD-REF: #Something - will be implemented in future epic`
    - Implement a temporary placeholder/mock behavior for the current epic
    - Do NOT implement the missing feature

2. **If the implementation plan contradicts a Userdoc requirement:**
    - Follow the implementation plan for the current epic
    - Add a comment noting the discrepancy for future resolution

3. **Priority order:**
    - Implementation plan scope defines what gets built in THIS epic
    - Userdoc requirements define the final behavior
    - Missing references get deferred with UD-REF comments

So for the Patient Login, the correct approach would be:
- Implement a temporary success message or placeholder redirect
- Add comment: // UD-REF: #Patient Dashboard - will be implemented in future epic
- Follow the implementation plan's scope for this epic

## Implementing Future Features

### 🔍 **TRIGGER PATTERN RECOGNITION**
**AUTOMATICALLY trigger the following process when you encounter ANY heading that matches this pattern:**

**Pattern:** `# [number]. #[RequirementName]`

**Examples that trigger this process:**
- `# 1. #Patient Dashboard`
- `# 2. #Service Provider Login`
- `# 3. #Appointment Management`
- `# 4.1 #Profile Management`

**Recognition Rules:**
- Starts with `#` (h1 heading)
- Contains a number (can include decimals like `1.1` or `2.3`)
- Contains a period after the number
- Contains another `#` symbol followed by the requirement name
- The requirement name after `#` is the Userdoc requirement identifier

### 🚀 **MANDATORY IMPLEMENTATION PROCESS**
**When implementing ANY feature that matches the trigger pattern above:**

1. **Before starting implementation of any new feature:**
   - Search the entire codebase for `UD-REF: #RequirementName` comments
   - Create a list of all places that reference the new feature being implemented

2. **During implementation:**
   - For each UD-REF comment found that matches the current feature:
   - Replace the temporary placeholder/mock behavior with the actual implementation
   - Remove the `UD-REF: #RequirementName` comment
   - Link the existing code to the newly created feature
   - Do not add a comment

3. **Search strategy:**
   - Use grep/search tools to find: `UD-REF: #FeatureName`
   - Check all file types: `.tsx`, `.ts`, `.js`, `.jsx`
   - Look in comments, TODOs, and code documentation

4. **Example workflow:**
   ```bash
   # When implementing Patient Dashboard in a future epic:
   grep -r "UD-REF: #Patient Dashboard" . --include="*.tsx" --include="*.ts"

   # Results might show:
   # ./app/patient/login/page.tsx: // UD-REF: #Patient Dashboard - will be implemented in future epic
   # ./app/patient/profile/page.tsx: // UD-REF: #Patient Dashboard - will be implemented in future epic
   ```

5. **Update process:**
   - Replace temporary redirects with actual navigation to the new feature
   - Update placeholder text/alerts with real functionality
   - Ensure all connected flows work end-to-end
   - Test that the previously deferred functionality now works properly

### ⚠️ **CRITICAL REMINDER**
**EVERY TIME you see a heading like `# 1. #Patient Dashboard`, you MUST:**
1. Recognize this as a Userdoc requirement implementation
2. Search for existing `UD-REF: #Patient Dashboard` comments
3. Follow the complete implementation process above
4. Connect all previously deferred functionality
    
Please autonomously complete these tasks, ensuring you retrieve the requirements and implement.

Make sure to make frequent git commits with descriptive messages as you go through

# 🧠 Expert Full-Stack & Secure Next.js Project Guidelines

---

## 🎯 Objective

Create a Next.js solution that is:
- Highly maintainable and scalable
- Secure by design
- Optimized for performance
- Built using modern clean code standards

---


## 🗂️ Folder Structure
```
atlantis-hms-webapp/
├── app/                    # App Router pages and layouts
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── ...                # Other routes
│
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   └── shared/            # Custom shared components
│
├── lib/                   # Utility functions (helpers, API clients, etc.)
│   ├── db.ts              # Database or Prisma client setup
│   └── utils.ts           # General utilities
│
├── hooks/                 # Custom React hooks
│
├── types/                 # Global TypeScript type definitions
│   └── index.d.ts
│
├── constants/             # Static constants and enums
│   └── routes.ts          # Route name mappings, etc.
│
├── config/                # Project-specific configuration (e.g., theme, env)
│   └── theme.ts           # Tailwind/shadcn theme config
│
├── styles/                # Global and custom styles
│   └── globals.css
│
├── public/                # Static assets (images, icons, etc.)
│
├── .env.local             # Environment variables
├── tailwind.config.ts     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── tsconfig.json          # TypeScript configuration
├── next.config.js         # Next.js configuration
└── README.md
```

## 🧱 Code Style and Structure

- Use **TypeScript** with strict types.
- Prefer **functional and declarative programming** (no classes).
- Use **modular file structures** with reusable exports:
  ```
  components/auth-wizard/
  ├── index.tsx
  ├── form.tsx
  ├── helpers.ts
  ├── content.ts
  └── types.ts
  ```
- Use lowercase kebab-case for folders: `components/user-profile/`
- Descriptive variable names: `isAuthenticated`, `hasPermission`, `shouldRedirect`

---

## ⚡ Optimization and Best Practices

- Use **React Server Components (RSC)** and **Next.js SSR** wherever possible.
- Limit client components (`'use client'`), `useEffect`, `setState`.
- Use **dynamic imports** with `suspense` and `loading.tsx`.
- Design **mobile-first** and ensure responsive behavior with Tailwind.
- Optimize images with `next/image`, WebP format, and lazy loading.

---

## 🛡️ Security and Input Handling

### Secure Node.js Development Rules

1. **Do Not Use User Input in File Paths or Commands**
2. **Avoid `eval`, `Function`, and `vm` on Dynamic Input**
3. **Avoid Synchronous `child_process` Execution**
4. **Use Environment Variables for Secrets**
5. **Sanitize and Validate All External Input**
6. **Escape Output for HTML or CLI**
7. **Avoid Insecure HTTP Libraries or Defaults**
8. **Keep Dependencies Updated and Scanned**
9. **Restrict Dangerous Globals and Prototypes**
10. **Use Strict Equality and Type Checks**
11. **Avoid Dynamic `require()`**

Use libraries like `zod` for input validation and sanitize outputs before rendering or logging.

---

## ✅ Error Handling and Validation

- Always use **early returns** and **guard clauses**.
- Implement **custom error classes** for consistent error types.
- Catch errors in both API routes and server components.
- Return informative, secure messages and HTTP status codes.

---

## 🎨 UI and Styling

- Use **Tailwind CSS**, **Shadcn UI**, and **Radix UI** for styling.
- Apply consistent spacing, colors, and component styles using shared config.
- Use accessible, semantic HTML and ARIA attributes.

---

## 🔄 State Management and Data Fetching

- Use **Zustand** for global state.
- Use **TanStack Query (React Query)** for API data and caching.
- Define shared schemas using `zod` to validate data client and server side.

---

## 🔬 Testing and Documentation

- Write unit tests using `Jest` + `@testing-library/react`.
- Include `__tests__/` directories close to logic.
- Use **JSDoc** and inline comments for clarity.
- Add `.md` files for modules with API usage or intent explanations.

---

## 🧪 Commit and Branch Practices

- Follow **Conventional Commits**: `feat:`, `fix:`, `chore:`
- Squash commits before merging to `main`
- Use draft PRs early and reference issues in commits.
- Use `husky` for pre-commit hooks (lint, format, test)

---

## 🌐 Backend Patterns

- Use `app/api/*` route handlers with typed responses.
- Use Prisma as ORM with migrations.
- Validate every input and return consistent shapes `{ success, data, error }`.
- Use URL versioning like `/api/v1/...`.

---

## 📦 Library & Utility Best Practices

- **Date**: `date-fns` (format, timezone)
- **Crypto**: `bcrypt`, `crypto.randomUUID()`
- **Validation**: `zod`
- **Data Fetching**: `axios`
- **Image & Asset**: `next/image`, CDN, preload fonts
- **File Upload**: `uploadthing`, `next-cloudinary`
- **Email**: `resend`, `nodemailer`
- **Charts**: `recharts`, `chart.js`
- **Real-time**: `Pusher`, `Ably`, `WebSocket`

---

## 🧠 Methodology and Development Process

1. **System 2 Thinking** – Break down features into sub-tasks.
2. **Tree of Thoughts** – Brainstorm alternative approaches and consequences.
3. **Iterative Refinement** – Revisit and refactor before finalizing code.

**Process**:
- 🔍 Deep Dive Analysis
- 🗂 Planning using `<PLANNING>` tags
- 🧱 Implementation with best practices
- 🔎 Review and Optimization
- ✅ Finalization (secure, test-covered, documented)

---