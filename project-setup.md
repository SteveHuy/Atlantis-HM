# 🧱 Next.js Project Structure Guideline

This guide outlines the recommended setup and structure for a new **Next.js** project using **TypeScript**, **Tailwind CSS**, **ESLint**, the **App Router**, and **shadcn/ui**.

---

## 🚀 Project Setup

Run the following commands to create and initialize the project:

```bash
npx create-next-app@latest atlantis-hms-webapp --ts --tailwind --eslint --app
cd atlantis-hms-webapp
npx shadcn-ui@latest init
```

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