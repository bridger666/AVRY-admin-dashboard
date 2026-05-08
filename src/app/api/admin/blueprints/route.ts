// TODO: wire to real endpoint
import { NextRequest, NextResponse } from "next/server";

export interface BlueprintRecord extends Record<string, unknown> {
  id: string;
  userId: string;
  userEmail: string;
  tier: string;
  title: string;
  status: "draft" | "generating" | "completed" | "failed";
  sections: number;
  completedSections: number;
  generatedAt: string | null;
  createdAt: string;
  pdfUrl: string | null;
}

const now = Date.now();

const mockBlueprints: BlueprintRecord[] = [
  {
    id: "bp-001",
    userId: "usr-a1b2c3d4",
    userEmail: "alice.johnson@techcorp.com",
    tier: "blueprint",
    title: "TechCorp AI Automation Blueprint",
    status: "completed",
    sections: 8,
    completedSections: 8,
    generatedAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    pdfUrl: "/blueprints/bp-001.pdf",
  },
  {
    id: "bp-002",
    userId: "usr-e5f6g7h8",
    userEmail: "emma.davis@saas.com",
    tier: "blueprint",
    title: "SaaS Growth Automation Strategy",
    status: "completed",
    sections: 8,
    completedSections: 8,
    generatedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
    pdfUrl: "/blueprints/bp-002.pdf",
  },
  {
    id: "bp-003",
    userId: "usr-g7h8i9j0",
    userEmail: "grace.kim@fintech.io",
    tier: "blueprint",
    title: "FinTech Compliance Automation",
    status: "generating",
    sections: 8,
    completedSections: 3,
    generatedAt: null,
    createdAt: new Date(now - 20 * 60 * 1000).toISOString(),
    pdfUrl: null,
  },
  {
    id: "bp-004",
    userId: "usr-c3d4e5f6",
    userEmail: "carol.white@enterprise.com",
    tier: "blueprint",
    title: "Enterprise Workflow Optimization",
    status: "completed",
    sections: 8,
    completedSections: 8,
    generatedAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - 7 * 60 * 60 * 1000).toISOString(),
    pdfUrl: "/blueprints/bp-004.pdf",
  },
  {
    id: "bp-005",
    userId: "usr-i9j0k1l2",
    userEmail: "ivan.petrov@logistics.ru",
    tier: "blueprint",
    title: "Logistics AI Integration Blueprint",
    status: "failed",
    sections: 8,
    completedSections: 2,
    generatedAt: null,
    createdAt: new Date(now - 10 * 60 * 60 * 1000).toISOString(),
    pdfUrl: null,
  },
  {
    id: "bp-006",
    userId: "usr-j0k1l2m3",
    userEmail: "julia.chen@healthtech.com",
    tier: "blueprint",
    title: "HealthTech Patient Journey Automation",
    status: "completed",
    sections: 8,
    completedSections: 8,
    generatedAt: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - 13 * 60 * 60 * 1000).toISOString(),
    pdfUrl: "/blueprints/bp-006.pdf",
  },
  {
    id: "bp-007",
    userId: "usr-k1l2m3n4",
    userEmail: "kevin.okonkwo@edtech.ng",
    tier: "blueprint",
    title: "EdTech Student Engagement Automation",
    status: "draft",
    sections: 8,
    completedSections: 0,
    generatedAt: null,
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
    pdfUrl: null,
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
      const res = await fetch(`${apiUrl}/api/v1/admin/blueprints`, {
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

  return NextResponse.json({ blueprints: mockBlueprints });
}
