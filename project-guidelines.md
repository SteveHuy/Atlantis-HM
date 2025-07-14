# 🧠 Expert Full-Stack & Secure Next.js Project Guidelines

This document combines architectural, coding, security, and process guidelines to help developers produce highly maintainable, secure, and performant **Next.js** applications using **TypeScript**, **Tailwind CSS**, and **modern UI/UX frameworks**.

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

## 🔤 Special Character Handling

- Replace all special characters with their appropriate HTML entities:
  - `'` → `&apos;` (apostrophe)
  - `"` → `&quot;` (quotation mark)
  - `&` → `&amp;` (ampersand)
  - `<` → `&lt;` (less than)
  - `>` → `&gt;` (greater than)
- Apply this consistently across all text content, especially in:
  - JSX/TSX components
  - API responses
  - Database strings
  - Configuration files
  - Documentation

---