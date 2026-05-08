// TODO: wire to real endpoint
import { NextRequest, NextResponse } from "next/server";

export interface DiagnosticRun extends Record<string, unknown> {
  id: string;
  userId: string;
  userEmail: string;
  tier: string;
  type: "free" | "deep";
  status: "completed" | "in_progress" | "failed";
  score: number | null;
  phases: number;
  completedPhases: number;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
}

const now = Date.now();

const mockDiagnostics: DiagnosticRun[] = [
  {
    id: "diag-001",
    userId: "usr-a1b2c3d4",
    userEmail: "alice.johnson@techcorp.com",
    tier: "blueprint",
    type: "deep",
    status: "completed",
    score: 82,
    phases: 5,
    completedPhases: 5,
    startedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(now - 1.5 * 60 * 60 * 1000).toISOString(),
    durationMs: 1800000,
  },
  {
    id: "diag-002",
    userId: "usr-b2c3d4e5",
    userEmail: "bob.smith@startup.io",
    tier: "snapshot",
    type: "free",
    status: "completed",
    score: 61,
    phases: 3,
    completedPhases: 3,
    startedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(now - 3.8 * 60 * 60 * 1000).toISOString(),
    durationMs: 720000,
  },
  {
    id: "diag-003",
    userId: "usr-c3d4e5f6",
    userEmail: "carol.white@enterprise.com",
    tier: "blueprint",
    type: "deep",
    status: "in_progress",
    score: null,
    phases: 5,
    completedPhases: 2,
    startedAt: new Date(now - 30 * 60 * 1000).toISOString(),
    completedAt: null,
    durationMs: null,
  },
  {
    id: "diag-004",
    userId: "usr-d4e5f6g7",
    userEmail: "david.lee@consulting.biz",
    tier: "snapshot",
    type: "deep",
    status: "failed",
    score: null,
    phases: 5,
    completedPhases: 1,
    startedAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(now - 5.9 * 60 * 60 * 1000).toISOString(),
    durationMs: 360000,
  },
  {
    id: "diag-005",
    userId: "usr-e5f6g7h8",
    userEmail: "emma.davis@saas.com",
    tier: "blueprint",
    type: "deep",
    status: "completed",
    score: 94,
    phases: 5,
    completedPhases: 5,
    startedAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(now - 7.2 * 60 * 60 * 1000).toISOString(),
    durationMs: 2880000,
  },
  {
    id: "diag-006",
    userId: "usr-f6g7h8i9",
    userEmail: "frank.miller@agency.co",
    tier: "free",
    type: "free",
    status: "completed",
    score: 45,
    phases: 3,
    completedPhases: 3,
    startedAt: new Date(now - 10 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(now - 9.8 * 60 * 60 * 1000).toISOString(),
    durationMs: 480000,
  },
  {
    id: "diag-007",
    userId: "usr-g7h8i9j0",
    userEmail: "grace.kim@fintech.io",
    tier: "blueprint",
    type: "deep",
    status: "completed",
    score: 77,
    phases: 5,
    completedPhases: 5,
    startedAt: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(now - 11.5 * 60 * 60 * 1000).toISOString(),
    durationMs: 1800000,
  },
  {
    id: "diag-008",
    userId: "usr-h8i9j0k1",
    userEmail: "henry.wilson@ecommerce.shop",
    tier: "snapshot",
    type: "free",
    status: "completed",
    score: 58,
    phases: 3,
    completedPhases: 3,
    startedAt: new Date(now - 14 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(now - 13.9 * 60 * 60 * 1000).toISOString(),
    durationMs: 360000,
  },
];

export async function GET(request: NextRequest) {
  const token = request.cookies.get("aivory_access_token")?.value;

  if (!token) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    response.cookies.delete("aivory_access_token");
    response.cookies.delete("aivory_refresh_token");
    return response;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/v1/admin/diagnostics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        response.cookies.delete("aivory_access_token");
        response.cookies.delete("aivory_refresh_token");
        return response;
      }

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend not available — fall through to mock data
    }
  }

  return NextResponse.json({ diagnostics: mockDiagnostics });
}
