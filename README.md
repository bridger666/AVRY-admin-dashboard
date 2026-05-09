# Aivory Admin Dashboard

Internal operations dashboard for the Aivory platform. Built on Next.js 16, Tailwind CSS v4, and Supabase Auth.

---

## Development Setup

### Prerequisites

- Node.js 20+
- A Supabase project (see environment variables below)

### Install dependencies

```bash
npm install --legacy-peer-deps
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```


### Start the development server

```bash
npm run dev
```

**Default dev port: 3001**


## Deployment

Deploy to Vercel. Set all environment variables in the Vercel project settings. The `vercel.json` in the project root configures the deployment for the `sin1` region.
