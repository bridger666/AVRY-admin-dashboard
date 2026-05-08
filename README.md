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

Required variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **server-side only** |
| `NEXT_PUBLIC_API_URL` | Aivory backend base URL (no trailing slash) |
| `SETUP_SECRET` | Secret token for the `/api/admin/setup-user` utility route |

### Start the development server

```bash
npm run dev
```

**Default dev port: 3001**

The main Aivory console (`nextjs-console`) runs on port 3000. When both are running simultaneously, Next.js automatically assigns port 3001 to this app.

To run on a specific port:

```bash
PORT=3002 npm run dev
# or
npm run dev -- -p 3002
```

---

## First-time user setup

Supabase Auth users need `user_metadata.account_type` set to `"superadmin"` or `"admin"` before they can log in to this dashboard.

Use the `/api/admin/setup-user` utility route to set this:

```bash
curl -X POST http://localhost:3001/api/admin/setup-user \
  -H "Content-Type: application/json" \
  -H "x-setup-secret: YOUR_SETUP_SECRET" \
  -d '{
    "userId": "<supabase-user-uid>",
    "accountType": "superadmin",
    "fullName": "Irfan Reichmann"
  }'
```

Find the user UID in the Supabase dashboard → Authentication → Users.

**Example for the default superadmin:**

```bash
curl -X POST http://localhost:3001/api/admin/setup-user \
  -H "Content-Type: application/json" \
  -H "x-setup-secret: aivory-setup-2026" \
  -d '{
    "userId": "d69d23d1-686e-48dc-a39e-2615dadb078b",
    "accountType": "superadmin",
    "fullName": "Irfan Reichmann"
  }'
```

On success you'll get:

```json
{
  "success": true,
  "userId": "d69d23d1-...",
  "email": "irfan.reichmann@aivory.id",
  "user_metadata": { "account_type": "superadmin", "full_name": "Irfan Reichmann" }
}
```

After that, log in with `irfan.reichmann@aivory.id` and your Supabase password.

---

## Build

```bash
npm run build
npm run start
```

## Deployment

Deploy to Vercel. Set all environment variables in the Vercel project settings. The `vercel.json` in the project root configures the deployment for the `sin1` region.
