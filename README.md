# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```



tudyQuest Technology Stack Breakdown
Frontend Technologies
Next.js 14

What: React framework with built-in routing, server-side rendering (SSR), and static site generation (SSG)
Why: Industry standard for modern React apps, makes your resume stand out
You'll learn: App Router, Server Components, API routes, image optimization

React 18

What: JavaScript library for building user interfaces
Why: Most popular frontend framework, required by 90% of frontend jobs
You'll learn: Hooks (useState, useEffect), component composition, props, context

TypeScript

What: JavaScript with type checking
Why: Required by most companies, catches bugs before runtime
You'll learn: Type definitions, interfaces, generics, type inference

Tailwind CSS

What: Utility-first CSS framework
Why: Fast development, consistent design, no CSS files needed
Example: <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">

Framer Motion

What: Animation library for React
Why: Makes your app feel professional and polished
You'll learn: Page transitions, hover effects, smooth animations

Recharts

What: Chart library built on React components
Why: Create beautiful analytics graphs easily
You'll learn: Line charts, bar charts, pie charts for your dashboard

TanStack Query (formerly React Query)

What: Data fetching and caching library
Why: Handles API calls elegantly, automatic refetching, caching
You'll learn: useQuery, useMutation, cache invalidation

Zustand

What: Lightweight state management
Why: Simpler than Redux, perfect for managing global state (user info, theme, etc.)
You'll learn: Global state stores, state updates

@dnd-kit

What: Drag-and-drop library
Why: For your kanban board (drag cards between columns)
You'll learn: Draggable items, drop zones, reordering


Backend Technologies
Python

What: Programming language
Why: You already know it! Easier than Node.js for beginners
You'll learn: Async programming, API development

FastAPI

What: Modern Python web framework for building APIs
Why: Fast, automatic API documentation, async support
You'll learn: REST API design, request/response handling, dependency injection

PostgreSQL

What: Relational database (SQL)
Why: Industry standard, better than MySQL/SQLite for complex data
You'll learn: Database design, SQL queries, relationships (foreign keys), indexes

Redis

What: In-memory data store (key-value database)
Why: Super fast caching, session storage, real-time pub/sub
You'll learn: Caching strategies, session management

Socket.io

What: Real-time communication library (WebSockets)
Why: Multiple users can edit the same board simultaneously
You'll learn: Real-time events, pub/sub patterns, WebSocket connections

JWT (JSON Web Tokens)

What: Token-based authentication
Why: Secure, stateless authentication (no server-side sessions)
You'll learn: Token generation, validation, authentication flows

OAuth 2.0 (Google)

What: "Sign in with Google" functionality
Why: Better UX, secure authentication
You'll learn: OAuth flow, third-party authentication


DevOps & Infrastructure
Docker

What: Containerization platform
Why: Everyone on team has identical environment, easy deployment
You'll learn: Containers, images, volumes, multi-container apps

Docker Compose

What: Tool to run multiple Docker containers together
Why: Start your entire app (frontend, backend, database, Redis) with one command
You'll learn: Service orchestration, networking between containers

GitHub Actions

What: CI/CD (Continuous Integration/Deployment) pipeline
Why: Automatic testing and deployment on every code push
You'll learn: Automated testing, build pipelines, deployment automation

Vercel

What: Hosting platform (made by Next.js creators)
Why: Free tier, automatic deployments from Git, CDN, perfect for Next.js
You'll learn: Frontend deployment, environment variables, custom domains

Railway

What: Cloud hosting platform
Why: Easy backend deployment, free tier includes PostgreSQL and Redis
You'll learn: Backend deployment, database hosting, environment management


Development Tools
Git & GitHub

What: Version control
Why: Collaborate with team, track changes, code reviews
You'll learn: Branching, pull requests, merge conflicts, code reviews

VS Code

What: Code editor
Why: Best editor for web development
Extensions you'll use: Prettier, ESLint, Tailwind IntelliSense

Postman (or Thunder Client)

What: API testing tool
Why: Test your backend endpoints before connecting frontend
You'll learn: API testing, request/response debugging

