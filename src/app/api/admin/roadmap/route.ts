// TODO: wire to real endpoint
import { NextRequest, NextResponse } from "next/server";

export interface RoadmapItem extends Record<string, unknown> {
  id: string;
  userId: string;
  userEmail: string;
  tier: string;
  title: string;
  category: "automation" | "integration" | "ai_agent" | "analytics" | "infrastructure";
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "deferred";
  estimatedWeeks: number;
  completionPercent: number;
  createdAt: string;
  updatedAt: string;
}

const now = Date.now();

const mockRoadmap: RoadmapItem[] = [
  {
    id: "rm-001",
    userId: "usr-a1b2c3d4",
    userEmail: "alice.johnson@techcorp.com",
    tier: "blueprint",
    title: "Automate lead enrichment pipeline with HubSpot",
    category: "automation",
    priority: "high",
    status: "in_progress",
    estimatedWeeks: 3,
    completionPercent: 60,
    createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rm-002",
    userId: "usr-a1b2c3d4",
    userEmail: "alice.johnson@techcorp.com",
    tier: "blueprint",
    title: "Deploy AI agent for customer support triage",
    category: "ai_agent",
    priority: "high",
    status: "pending",
    estimatedWeeks: 4,
    completionPercent: 0,
    createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rm-003",
    userId: "usr-e5f6g7h8",
    userEmail: "emma.davis@saas.com",
    tier: "blueprint",
    title: "Integrate Stripe billing with internal CRM",
    category: "integration",
    priority: "high",
    status: "completed",
    estimatedWeeks: 2,
    completionPercent: 100,
    createdAt: new Date(now - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rm-004",
    userId: "usr-e5f6g7h8",
    userEmail: "emma.davis@saas.com",
    tier: "blueprint",
    title: "Build churn prediction analytics dashboard",
    category: "analytics",
    priority: "medium",
    status: "in_progress",
    estimatedWeeks: 5,
    completionPercent: 35,
    createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rm-005",
    userId: "usr-g7h8i9j0",
    userEmail: "grace.kim@fintech.io",
    tier: "blueprint",
    title: "Automate KYC document verification workflow",
    category: "automation",
    priority: "high",
    status: "pending",
    estimatedWeeks: 6,
    completionPercent: 0,
    createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rm-006",
    userId: "usr-c3d4e5f6",
    userEmail: "carol.white@enterprise.com",
    tier: "blueprint",
    title: "Set up multi-cloud infrastructure monitoring",
    category: "infrastructure",
    priority: "medium",
    status: "deferred",
    estimatedWeeks: 8,
    completionPercent: 10,
    createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rm-007",
    userId: "usr-j0k1l2m3",
    userEmail: "julia.chen@healthtech.com",
    tier: "blueprint",
    title: "Integrate EHR system with appointment automation",
    category: "integration",
    priority: "high",
    status: "in_progress",
    estimatedWeeks: 4,
    completionPercent: 75,
    createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rm-008",
    userId: "usr-k1l2m3n4",
    userEmail: "kevin.okonkwo@edtech.ng",
    tier: "blueprint",
    title: "Deploy AI tutor agent for personalized learning",
    category: "ai_agent",
    priority: "medium",
    status: "pending",
    estimatedWeeks: 5,
    completionPercent: 0,
    createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
      const res = await fetch(`${apiUrl}/api/v1/admin/roadmap`, {
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

  return NextResponse.json({ roadmap: mockRoadmap });
}
