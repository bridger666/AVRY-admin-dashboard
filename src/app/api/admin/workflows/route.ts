// TODO: wire to real endpoint
import { NextRequest, NextResponse } from "next/server";

interface WorkflowRun {
  workflowId: string;
  workflowName: string;
  userId: string;
  status: "active" | "inactive" | "error";
  triggeredAt: string;
  durationMs: number;
  error?: string;
}

const now = Date.now();

const mockWorkflows: WorkflowRun[] = [
  {
    workflowId: "wf-001a2b3c",
    workflowName: "Lead Enrichment Pipeline",
    userId: "usr-a1b2c3d4",
    status: "active",
    triggeredAt: new Date(now - 3 * 60 * 1000).toISOString(),
    durationMs: 1850,
  },
  {
    workflowId: "wf-002b3c4d",
    workflowName: "CRM Sync",
    userId: "usr-b2c3d4e5",
    status: "error",
    triggeredAt: new Date(now - 10 * 60 * 1000).toISOString(),
    durationMs: 4200,
    error: "ConnectionError: Salesforce API rate limit exceeded (429)",
  },
  {
    workflowId: "wf-003c4d5e",
    workflowName: "Invoice Processing",
    userId: "usr-c3d4e5f6",
    status: "active",
    triggeredAt: new Date(now - 20 * 60 * 1000).toISOString(),
    durationMs: 2300,
  },
  {
    workflowId: "wf-004d5e6f",
    workflowName: "Slack Notifications",
    userId: "usr-d4e5f6g7",
    status: "inactive",
    triggeredAt: new Date(now - 35 * 60 * 1000).toISOString(),
    durationMs: 450,
  },
  {
    workflowId: "wf-005e6f7g",
    workflowName: "Customer Onboarding",
    userId: "usr-e5f6g7h8",
    status: "active",
    triggeredAt: new Date(now - 50 * 60 * 1000).toISOString(),
    durationMs: 3100,
  },
  {
    workflowId: "wf-006f7g8h",
    workflowName: "Data Pipeline",
    userId: "usr-f6g7h8i9",
    status: "active",
    triggeredAt: new Date(now - 65 * 60 * 1000).toISOString(),
    durationMs: 18200,
  },
  {
    workflowId: "wf-007g8h9i",
    workflowName: "Report Generator",
    userId: "usr-g7h8i9j0",
    status: "inactive",
    triggeredAt: new Date(now - 80 * 60 * 1000).toISOString(),
    durationMs: 9400,
  },
  {
    workflowId: "wf-008h9i0j",
    workflowName: "API Aggregator",
    userId: "usr-h8i9j0k1",
    status: "error",
    triggeredAt: new Date(now - 95 * 60 * 1000).toISOString(),
    durationMs: 2100,
    error: "RateLimitError: OpenAI API quota exceeded for this billing period",
  },
  {
    workflowId: "wf-009i0j1k",
    workflowName: "Email Campaign Trigger",
    userId: "usr-i9j0k1l2",
    status: "active",
    triggeredAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    durationMs: 1200,
  },
  {
    workflowId: "wf-010j1k2l",
    workflowName: "Webhook Processor",
    userId: "usr-j0k1l2m3",
    status: "active",
    triggeredAt: new Date(now - 2.5 * 60 * 60 * 1000).toISOString(),
    durationMs: 320,
  },
  {
    workflowId: "wf-011k2l3m",
    workflowName: "Inventory Sync",
    userId: "usr-k1l2m3n4",
    status: "inactive",
    triggeredAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    durationMs: 5600,
  },
  {
    workflowId: "wf-012l3m4n",
    workflowName: "Support Ticket Router",
    userId: "usr-l2m3n4o5",
    status: "error",
    triggeredAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
    durationMs: 800,
    error: "AuthError: Zendesk OAuth token expired — re-authentication required",
  },
  {
    workflowId: "wf-013m4n5o",
    workflowName: "Social Media Monitor",
    userId: "usr-m3n4o5p6",
    status: "active",
    triggeredAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    durationMs: 4100,
  },
  {
    workflowId: "wf-014n5o6p",
    workflowName: "Financial Reconciliation",
    userId: "usr-n4o5p6q7",
    status: "active",
    triggeredAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
    durationMs: 12300,
  },
  {
    workflowId: "wf-015o6p7q",
    workflowName: "User Churn Predictor",
    userId: "usr-o5p6q7r8",
    status: "inactive",
    triggeredAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
    durationMs: 7800,
  },
  {
    workflowId: "wf-016p7q8r",
    workflowName: "Content Moderation",
    userId: "usr-a1b2c3d4",
    status: "active",
    triggeredAt: new Date(now - 10 * 60 * 60 * 1000).toISOString(),
    durationMs: 2900,
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

  // Attempt to forward to real backend when available
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/v1/admin/workflows`, {
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

  return NextResponse.json({ workflows: mockWorkflows });
}
