# 📦 Package Management Guide

This guide explains how to manage dependencies in the **SkySentinel** monorepo using Turborepo and npm workspaces.

---

## 🚀 Core Principle: One Lockfile, Multiple Scopes

In this monorepo, you should **never manually copy `node_modules` or files** between folders. All dependencies are managed from the root using the `package.json` workspaces.

### 1. Where to Install?

| Dependency Type | Location | Example | Command |
| :--- | :--- | :--- | :--- |
| **Global Tools** | Root `devDependencies` | `turbo`, `prettier`, `eslint`, `husky` | `npm install <pkg> -D` |
| **App-Specific** | App `dependencies` | `@nestjs/core` (backend), `lucide-react` (frontend) | `npm install <pkg> -w apps/<app-name>` |
| **Shared Logic** | Internal Package | Shared DTOs, UI Components, Configs | Create in `packages/*` and link |

---

## 🛠️ Common Commands

### Installing a package to a specific App
Do not `cd` into the app folder. Stay at the root and use the `-w` (workspace) flag.

```bash
# Add 'axios' to the frontend app
npm install axios -w apps/frontend

# Add 'lodash' to the backend app
npm install lodash -w apps/backend
```

### Installing a dev-dependency to a specific App
```bash
# Add '@types/lodash' as dev-dependency to backend
npm install @types/lodash -D -w apps/backend
```

### Installing shared tools to the Root
Shared tools that run across the whole project (like formatting or linting) belong in the root.
```bash
npm install lint-staged -D
```

---

## 🔄 Internal Dependencies (The "Turborepo Way")

If you want to share code (e.g., a `ValidationPipe` or a `UI Button`) between apps, follow this workflow:

1. **Create a package:** Add a folder in `packages/shared-utils`.
2. **Define it:** Give it a name in its own `package.json` (e.g., `"name": "@sky-sentinel/utils"`).
3. **Link it:** Install it in your app:
   ```bash
   npm install @sky-sentinel/utils -w apps/backend
   ```
4. **Usage:** Turborepo will automatically link the local folder. You don't need to publish it to npm.

---

## ⚠️ Important Rules

1. **Avoid Duplication:** If both apps use `typescript`, ensure they use the **same version** (ideally managed at the root).
2. **Never `npm install` inside `apps/` folders:** Always run commands from the project root. This ensures the `package-lock.json` at the root stays as the "single source of truth."
3. **Prisma Generation:** After changing the schema, always run `npm run db:generate` (via Turbo) to update the client in `node_modules`.

---

## 🧹 Cleaning the Workspace
If things get weird with dependencies, run:
```bash
# Removes all node_modules and build artifacts
npm run clean 
```
*(Note: You may need to add this script to your root package.json)*

---

## 🛑 The "TypeScript in Production" Myth

**Question:** "Will my app shut down in production if I don't have TypeScript in each app folder?"

**The Short Answer:** **No.** 

### 🏗️ Build-time vs. 🏃 Run-time
1.  **Build-time:** You need TypeScript (`tsc`) to compile your `.ts` files into `.js` files. This happens **before** your app goes to production (e.g., during a CI/CD build or when you run `npm run build`).
2.  **Run-time:** In production, you run the **compiled JavaScript** (the `dist/` or `build/` folder) using `node`. **Node.js does not understand or need TypeScript.**

### ⚠️ Why people get confused
*   **The `ts-node` trap:** If you try to run your app in production using `ts-node src/main.ts`, it **will** fail without TypeScript. **Never use `ts-node` in production.** It is slow and memory-intensive.
*   **The "Hoisting" Issue:** In a monorepo, if you only have TypeScript at the root, a standalone Docker build for one app might fail because it can't find `tsc`. 

### ✅ Best Practice
To be safe and "self-contained":
1.  Keep TypeScript as a **`devDependency`** in the **Root** (for your editor).
2.  Also include it as a **`devDependency`** in each **App** (`apps/backend`, `apps/frontend`).
3.  **Result:** Your app remains "self-aware" of how to build itself, but stays lightweight because `devDependencies` are not included in the final production package.
