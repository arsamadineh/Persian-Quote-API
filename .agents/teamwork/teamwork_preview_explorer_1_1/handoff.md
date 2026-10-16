# Handoff Report: Phase 1 Bun Workspaces Monorepo Architecture

## 1. Observation

### 1.1 Existing Codebase & Execution Baselines
1. **Root `package.json`**:
   - Lines 1–11: Name is `"my-v0-project"`, single-package setup with `"scripts": { "build": "next build", "dev": "next dev", "lint": "next lint", "start": "next start", "test": "bun test" }`.
   - Lines 12–67: 54 runtime dependencies primarily for Next.js, React 19, and Radix UI components, including `zod: "3.25.67"`.
   - Lines 68–79: DevDependencies including `@types/bun: "^1.4.0"`, `@types/node: "^22"`, `typescript: "^5"`, and recently added `playwright: "^1.64.1"`.
2. **Root `tsconfig.json`**:
   - Lines 1–28: Single-package configuration with `"paths": { "@/*": ["./*"] }`, `"moduleResolution": "bundler"`, `"target": "ES6"`, and `"include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]`.
3. **Current Test Suite Baseline**:
   - Executing `bun test` in `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`:
     `86 pass, 0 fail, 9011 expect() calls across 15 files [590.00ms]`.
   - Tests include: `tests/engine.test.ts`, `tests/poem-lines.test.ts`, `tests/store.test.ts`, and 12 E2E test suites in `tests/e2e/`.
4. **Current Next.js Build Baseline**:
   - Executing `bun run build` generates 16 routes (Static: `/`, `/_not-found`, `/changelog`, `/contribute`, `/docs`, `/embed`, `/examples`, `/icon.svg`, `/manifest.webmanifest`, `/privacy`, `/robots.txt`, `/sakhtar`, `/sitemap.xml`, `/terms`; Dynamic: API routes and icons). First load JS shared by all: 101 KB. Exit code: 0.
5. **Critical Coupling Points Identified**:
   - `tests/e2e/harness.ts` lines 1–4:
     ```typescript
     import { engine, createNextHandler } from "@/lib/engine/instance";
     import { GET as embedGet } from "@/app/api/embed/route";
     import { GET as benchmarkGet } from "@/app/api/engine/benchmark/route";
     import { GET as engineStatsGet } from "@/app/api/engine/stats/route";
     ```
   - `tests/engine.test.ts` lines 2–5: Relative imports `from "../lib/engine/router"`, `from "../lib/engine/cache"`, etc.
   - `tests/store.test.ts` line 2: Relative import `from "../lib/data/store"`.
   - `tests/poem-lines.test.ts` line 2: Relative import `from "../lib/data/poem-lines"`.
   - `AGENTS.md` Rule §1: Explicitly mandates that changes must be logged in `lib/changelog.ts`.
6. **Empirical Monorepo Verification Findings (executed in isolated clone)**:
   - When configuring `workspaces: ["apps/*", "packages/*"]` in root `package.json` and adding `@persian-quote/schema: "workspace:*"` and `@persian-quote/persian: "workspace:*"`, `bun install` automatically creates symlinks under `node_modules/@persian-quote/`:
     - `node_modules/@persian-quote/persian -> ../../packages/persian`
     - `node_modules/@persian-quote/schema -> ../../packages/schema`
   - In `tsconfig.json`, TypeScript 5 reports:
     `error TS5102: Option 'baseUrl' has been removed. Please remove it from your configuration.`
     `error TS5090: Non-relative paths are not allowed. Did you forget a leading './'?`
     Therefore, path aliases MUST be written with a leading `./`:
     `"@persian-quote/schema": ["./packages/schema/src/index.ts"]`.
   - In `next.config.mjs`, adding `transpilePackages: ["@persian-quote/schema", "@persian-quote/persian"]` allows `next build` to directly compile TypeScript source from `packages/*` without requiring an intermediate pre-compilation step.
   - In the clone test with packages and `transpilePackages` added, `next build` compiled 16 routes successfully with exit code 0, and `bun test` passed all 86 existing tests plus 2 package tests in 47 ms.

---

## 2. Logic Chain

1. **Workspace Declaration**:
   - From Observation 1.1 and 1.6, Bun natively orchestrates multi-package monorepos through the root `package.json` field `"workspaces": ["apps/*", "packages/*"]`.
   - Running `bun install` symlinks workspace packages into `node_modules/@persian-quote/*`.
2. **Zero-Overhead Resolution for Tests (`bun test`) and TypeScript (`tsc`)**:
   - Because Bun natively executes TypeScript files (`.ts`), packages do not require pre-compilation with `tsc` or `bun build` to a `dist/` directory during development.
   - Configuring `package.json` exports to point to `./src/index.ts` ensures Bun loads the live source files directly.
   - In `tsconfig.json`, defining path aliases with leading `./` (`"@persian-quote/schema": ["./packages/schema/src/index.ts"]`) allows `tsc --noEmit` and IDEs to resolve types with zero ambiguity and without deprecated `baseUrl`.
3. **Zero-Disruption Next.js Build (`next build`)**:
   - Next.js bundles code using webpack/turbopack. By default, files outside the Next.js root or in `node_modules` might not be transpiled unless configured.
   - Adding `transpilePackages: ["@persian-quote/schema", "@persian-quote/persian"]` in `next.config.mjs` instructs Next.js to transpile those packages from TypeScript into the production bundle.
   - As proved in Observation 1.6, `next build` succeeded with exit code 0 when importing directly from `@persian-quote/schema` and `@persian-quote/persian`.
4. **Migration Sequence & Safety Invariant**:
   - From Observation 1.5, the existing test suite (`tests/` and `tests/e2e/`) relies heavily on `@/lib/...`, `@/app/api/...`, and relative `../lib/...` paths.
   - Furthermore, `AGENTS.md` Rule §1 explicitly monitors `lib/changelog.ts`.
   - In Phase 1, `packages/core`, `packages/store`, and `packages/poem` do NOT exist yet (they are scheduled for Phase 2 and Phase 3).
   - Abruptly moving `app/` and `lib/` into `apps/web/` in Phase 1 before extracting core engines would break:
     a) 86 existing tests due to broken relative and alias imports.
     b) `AGENTS.md` tool compatibility targeting `lib/changelog.ts`.
     c) Root build scripts if path aliases are not bridged.
   - Therefore, the safest and cleanest architecture is:
     - Set up the root Bun workspace with `"workspaces": ["apps/*", "packages/*"]`.
     - Implement `packages/schema` and `packages/persian` as fully independent workspace packages.
     - Prepare `apps/web` with its workspace definition.
     - Provide dual path mapping in `tsconfig.json` (`"@/*": ["./apps/web/*", "./*"]`) and symlink bridges so that both root and `apps/web` layouts resolve cleanly with zero test or build breakage.

---

## 3. Caveats

1. **TypeScript baseUrl Deprecation**: In TypeScript 5, `baseUrl` is deprecated and will trigger errors if paired with certain compiler settings. All paths in `tsconfig.json` MUST use explicit relative prefixes (`./packages/...`).
2. **Next.js Package Transpilation**: Every new internal package added to `packages/*` (`@persian-quote/core`, `@persian-quote/poem`, etc.) that is consumed by Next.js must be added to `transpilePackages` in `next.config.mjs`.
3. **Zero-Dependency Hot Path (Rule R10)**: `packages/persian` must have strictly empty runtime `dependencies: {}`. All utility libraries like `fast-check` must be in `devDependencies`.

---

## 4. Conclusion & Actionable Specifications

### 4.1 Target Monorepo File Tree for Phase 1
```
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/
├── apps/
│   └── web/
│       └── package.json            # Prepared web workspace package
├── packages/
│   ├── schema/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   └── index.ts            # Canonical Zod schemas & types
│   │   └── test/
│   │       └── schema.test.ts
│   └── persian/
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   └── index.ts            # Normalizer, tokenizer, stemmer, digits, bidi, finglish
│       └── test/
│           ├── persian.test.ts     # Unit tests
│           └── property.test.ts    # Fast-check property tests (>=90% branch coverage)
├── app/                            # Active Next.js App Router (coexists seamlessly)
├── components/                     # Active UI components
├── lib/                            # Active legacy engine & store (migrated in Phase 2/3)
│   └── changelog.ts                # Maintained per AGENTS.md §1
├── tests/                          # Active test suites (86 tests)
│   ├── e2e/
│   ├── engine.test.ts
│   ├── poem-lines.test.ts
│   └── store.test.ts
├── package.json                    # Monorepo root with workspaces: ["apps/*", "packages/*"]
├── tsconfig.json                   # Path aliases for @persian-quote/* and @/*
└── next.config.mjs                 # transpilePackages: ["@persian-quote/schema", "@persian-quote/persian"]
```

### 4.2 Exact File Templates for the Worker

#### Template 1: Root `package.json`
```json
{
  "name": "persian-quote-api-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "bun test",
    "test:packages": "bun test packages/",
    "test:e2e": "bun test tests/e2e/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-aspect-ratio": "1.1.1",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-collapsible": "1.1.2",
    "@radix-ui/react-context-menu": "2.2.4",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-hover-card": "1.1.4",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-menubar": "1.1.4",
    "@radix-ui/react-navigation-menu": "1.2.3",
    "@radix-ui/react-popover": "1.1.4",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-radio-group": "1.2.2",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-switch": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-toggle-group": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.6",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "autoprefixer": "^10.4.20",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.4",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.5.1",
    "geist": "^1.3.1",
    "input-otp": "1.4.1",
    "lucide-react": "^0.454.0",
    "next": "15.2.8",
    "next-themes": "latest",
    "radix-ui": "^1.6.1",
    "react": "^19",
    "react-aria-components": "^1.19.0",
    "react-day-picker": "9.8.0",
    "react-dom": "^19",
    "react-hook-form": "^7.60.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "zod": "3.25.67"
  },
  "devDependencies": {
    "@persian-quote/persian": "workspace:*",
    "@persian-quote/schema": "workspace:*",
    "@tailwindcss/postcss": "^4.1.9",
    "@types/bun": "^1.4.0",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "playwright": "^1.64.1",
    "postcss": "^8.5",
    "tailwindcss": "^4.1.9",
    "tw-animate-css": "1.3.3",
    "typescript": "^5"
  }
}
```

#### Template 2: `packages/schema/package.json`
```json
{
  "name": "@persian-quote/schema",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./*": {
      "types": "./src/*.ts",
      "import": "./src/*.ts",
      "default": "./src/*.ts"
    }
  },
  "scripts": {
    "test": "bun test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "3.25.67"
  },
  "devDependencies": {
    "@types/bun": "^1.4.0",
    "@types/node": "^22",
    "typescript": "^5"
  }
}
```

#### Template 3: `packages/schema/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["bun"]
  },
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

#### Template 4: `packages/persian/package.json`
```json
{
  "name": "@persian-quote/persian",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./*": {
      "types": "./src/*.ts",
      "import": "./src/*.ts",
      "default": "./src/*.ts"
    }
  },
  "scripts": {
    "test": "bun test",
    "test:coverage": "bun test --coverage",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/bun": "^1.4.0",
    "@types/node": "^22",
    "fast-check": "^3.23.2",
    "typescript": "^5"
  }
}
```

#### Template 5: `packages/persian/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["bun"]
  },
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

#### Template 6: `apps/web/package.json`
```json
{
  "name": "@persian-quote/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@persian-quote/schema": "workspace:*",
    "@persian-quote/persian": "workspace:*"
  }
}
```

#### Template 7: Root `tsconfig.json`
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@persian-quote/schema": ["./packages/schema/src/index.ts"],
      "@persian-quote/schema/*": ["./packages/schema/src/*"],
      "@persian-quote/persian": ["./packages/persian/src/index.ts"],
      "@persian-quote/persian/*": ["./packages/persian/src/*"],
      "@/*": ["./*", "./apps/web/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "packages/**/*.ts",
    "apps/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

#### Template 8: `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@persian-quote/schema",
    "@persian-quote/persian",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // ... (keep existing headers and redirects unmodified)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
      {
        source: "/llms-full.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
      {
        source: "/((?!api).*)",
        headers: [
          { key: "X-Robots-Tag", value: "all, max-image-preview:large" },
        ],
      },
    ]
  },
  redirects: async () => [
    {
      source: "/robots.txt",
      destination: "/robots",
      permanent: false,
    },
  ],
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
```

### 4.3 Step-by-Step Implementation Procedure for the Worker
1. **Pre-flight Check**: Run `bun test` and ensure all 86 tests pass.
2. **Directory Scaffolding**:
   ```bash
   mkdir -p apps/web packages/schema/src packages/schema/test packages/persian/src packages/persian/test
   ```
3. **Workspace Configuration**:
   - Write `packages/schema/package.json` and `packages/schema/tsconfig.json`.
   - Write `packages/persian/package.json` and `packages/persian/tsconfig.json`.
   - Write `apps/web/package.json`.
   - Update root `package.json` with `"workspaces": ["apps/*", "packages/*"]` and workspace devDependencies.
4. **TypeScript & Bundler Linking**:
   - Update root `tsconfig.json` paths and includes.
   - Update `next.config.mjs` with `transpilePackages: ["@persian-quote/schema", "@persian-quote/persian"]`.
5. **Install & Symlink Verification**:
   - Run `bun install`.
   - Verify `ls -la node_modules/@persian-quote/` displays active symlinks to `packages/persian` and `packages/schema`.
6. **Implement Phase 1 Package Code**:
   - Implement canonical Zod schemas in `packages/schema/src/index.ts`.
   - Implement Persian NLP functions in `packages/persian/src/index.ts`.
   - Add unit and property-based test suites in `packages/*/test/`.
7. **Regression Gating**:
   - Run `bun test`: All 86 legacy/e2e tests + new package tests must pass green.
   - Run `bun run build`: Next.js must build all 16 routes with exit code 0.
   - Run `bun x tsc --noEmit`: Strict typecheck must pass with 0 errors.
   - Update `lib/changelog.ts` according to AGENTS.md §1.

---

## 5. Verification Method

To independently verify this monorepo architecture:
1. **Test Discovery & Execution**:
   Run: `bun test`
   Expected result: All 86 existing tests (unit + E2E tiers) and all new workspace tests execute cleanly in under 2 seconds.
2. **Package Isolation Verification**:
   Run: `bun test packages/`
   Expected result: Only package unit tests and property tests execute and pass.
3. **TypeScript Strict Typecheck**:
   Run: `bun x tsc --noEmit`
   Expected result: Process exits with code 0 without any path resolution errors or `baseUrl` warnings.
4. **Next.js Production Build**:
   Run: `bun run build`
   Expected result: Next.js compiles all pages and API routes without module resolution errors and outputs 16 optimized routes.
5. **Symlink Inspection**:
   Run: `ls -la node_modules/@persian-quote`
   Expected result: Shows valid symlinks pointing to `../../packages/persian` and `../../packages/schema`.
