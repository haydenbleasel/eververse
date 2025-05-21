# Eververse

Eververse is an open source product management platform. It is a simple alternative to tools like Productboard and Cycle. Bring your product team together to explore problems, ideate solutions, prioritize features and plan roadmaps with the help of AI.

Structurally, Eververse is a monorepo built on [`next-forge`](https://www.next-forge.com) - a production-grade Turborepo template for Next.js apps.

## Setup

### Prerequisites

- Mac, Linux or Windows
- [Node.js](https://nodejs.org/en/download/) v20 or higher
- [pnpm](https://pnpm.io/installation)
- [Stripe CLI](https://docs.stripe.com/stripe-cli)

### Environment Variables

Eververse uses next-forge's [environment variables](https://docs.next-forge.com/setup/env) architecture to manage secrets, where each package manages its own environment variables. These environment variables are exported and composed into each app's `env.ts` file.

Each relevant app has an `.env.example` file that you can use as a reference. Simply copy the `.env.example` file to `.env.local` and fill in the missing values.

### Development

After cloning the repo, install the dependencies with:

```sh
pnpm install
```

Then, run the development server with:

```sh
pnpm dev
```

Open the localhost URLs with the relevant ports listed below.

## Structure

`next-forge` is a monorepo, which means it contains multiple packages in a single repository. This is a common pattern for modern web applications, as it allows you to share code between different parts of the application, and manage them all together.

The monorepo is managed by [Turborepo](https://turbo.build/repo), which is a tool for managing monorepos. It provides a simple way to manage multiple packages in a single repository, and is designed to work with modern web applications.

### Apps

The monorepo contains the following apps:

| App | Description | URL |
| --- | ----------- | --- |
| `adf-validator` | The ADF validator, which helps validate Atlassian Document Format (ADF) schemas. | - |
| `api` | The API, which contains serverless functions designed to run separately from the main app e.g. webhooks and cron jobs. | [localhost:3004](http://localhost:3004/) |
| `app` | The main, which contains the Next.js app. | [localhost:3000](http://localhost:3000/) |
| `email` | The email templates preview server, powered by react-email. | [localhost:3003](http://localhost:3003/) |
| `portal` | The customer-facing portal. | [localhost:3001](http://localhost:3001/) |
| `studio` | Prisma Studio, which is used to visually edit the local database. | [localhost:5005](http://localhost:5005/) |
| `web` | The website, which contains the static website for the app e.g. marketing pages and legal docs. | [localhost:3002](http://localhost:3002/) |
| `widget` | The embeddable Eververse widget. | [localhost:3005](http://localhost:3005/) |

### Packages

It also contains the following packages:

| Package | Description |
| --- | ----------- |
| `ai` | The AI library, which contains the AI provider for the app. |
| `analytics` | The analytics library, including Vercel Analytics, PostHog and Google Analytics. |
| `atlassian` | An OpenAPI client for the Atlassian API. |
| `backend` | The backend powered by Supabase, containing the database and auth system. |
| `canny` | The Canny API client. |
| `canvas` | The Excalidraw canvas. |
| `design-system` | The design system, powered by shadcn/ui. |
| `editor` | The rich text editor, powered by Novel and TipTap. |
| `eleven-labs` | The Eleven Labs API client for generating voice from text. |
| `email` | The email provider and templates, powered by Resend and react-email. |
| `github` | The GitHub API client (Octokit). |
| `lib` | Various utility functions and types. |
| `linear` | The Linear API client. |
| `next-config` | Shared Next.js configuration for the apps. |
| `observability` | The observability library, including Sentry and BetterStack. |
| `payments` | The payments library, powered by Stripe. |
| `productboard` | The Productboard API client. |
| `seo` | Utility functions for SEO. |
| `slack` | The Slack API client. |
| `tailwind-config` | The Tailwind configuration, which contains the shared Tailwind configuration for the app. |
| `typescript-config` | The TypeScript configuration, which contains the shared TypeScript configuration for the app. |
| `widget` | The core functionality for the embeddable Eververse widget. |

## Deploying

Eververse is designed to be deployed on Vercel. To deploy Eververse on Vercel, you need to create 5 new projects:

- `app`
- `api`
- `web`
- `portal`
- `widget`

After selecting your repository, change the Root Directory option to the app of choice e.g. `apps/app`. This should automatically detect the Next.js setup and as such, the build command and output directory.

Then, add all your environment variables to the project. Finally, just hit "Deploy" and Vercel will take care of the rest!

### Environment variables

If you're deploying on Vercel, we recommend making use of the Team Environment Variables feature. Variables used by libraries need to exist in all packages and duplicating them can be a headache. Learn more about how [environment variables](https://docs.next-forge.com/setup/env) work in next-forge.

### Integrations

Eververse makes use of the following integrations to sync environment variables:

- [Supabase](https://vercel.com/marketplace/supabase)
- [Sentry](https://vercel.com/marketplace/sentry)
- [BetterStack](https://vercel.com/marketplace/betterstack)
