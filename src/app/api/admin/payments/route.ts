// TODO: wire to real endpoint
import { NextRequest, NextResponse } from "next/server";

interface Payment {
  paymentId: string;
  orderId: string;
  userId: string;
  email: string;
  product: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

const mockPayments: Payment[] = [
  {
    paymentId: "pay-001",
    orderId: "order-001",
    userId: "usr-a1b2c3d4",
    email: "alice.johnson@techcorp.com",
    product: "ai_blueprint",
    amount: 85,
    status: "paid",
    paymentMethod: "midtrans",
    createdAt: "2024-01-15T09:23:00Z",
  },
  {
    paymentId: "pay-002",
    orderId: "order-002",
    userId: "usr-b2c3d4e5",
    email: "bob.smith@startup.io",
    product: "ai_snapshot",
    amount: 29,
    status: "paid",
    paymentMethod: "midtrans",
    createdAt: "2024-02-20T11:45:00Z",
  },
  {
    paymentId: "pay-003",
    orderId: "order-003",
    userId: "usr-c3d4e5f6",
    email: "carol.white@agency.co",
    product: "ai_blueprint",
    amount: 85,
    status: "pending",
    paymentMethod: "bank_transfer",
    createdAt: "2024-03-05T08:12:00Z",
  },
  {
    paymentId: "pay-004",
    orderId: "order-004",
    userId: "usr-d4e5f6g7",
    email: "david.lee@freelance.dev",
    product: "ai_snapshot",
    amount: 29,
    status: "failed",
    paymentMethod: "credit_card",
    createdAt: "2024-03-18T16:30:00Z",
  },
  {
    paymentId: "pay-005",
    orderId: "order-005",
    userId: "usr-e5f6g7h8",
    email: "emma.davis@bigcorp.com",
    product: "subscription",
    amount: 499,
    status: "paid",
    paymentMethod: "midtrans",
    createdAt: "2023-11-01T10:00:00Z",
  },
  {
    paymentId: "pay-006",
    orderId: "order-006",
    userId: "usr-f6g7h8i9",
    email: "frank.miller@saas.com",
    product: "ai_blueprint",
    amount: 85,
    status: "refunded",
    paymentMethod: "midtrans",
    createdAt: "2024-01-28T13:20:00Z",
  },
  {
    paymentId: "pay-007",
    orderId: "order-007",
    userId: "usr-g7h8i9j0",
    email: "grace.chen@analytics.ai",
    product: "subscription",
    amount: 499,
    status: "paid",
    paymentMethod: "midtrans",
    createdAt: "2023-09-15T07:00:00Z",
  },
  {
    paymentId: "pay-008",
    orderId: "order-008",
    userId: "usr-h8i9j0k1",
    email: "henry.wilson@consulting.biz",
    product: "ai_snapshot",
    amount: 29,
    status: "paid",
    paymentMethod: "bank_transfer",
    createdAt: "2024-04-02T09:15:00Z",
  },
  {
    paymentId: "pay-009",
    orderId: "order-009",
    userId: "usr-i9j0k1l2",
    email: "isabella.brown@media.co",
    product: "credits",
    amount: 99,
    status: "pending",
    paymentMethod: "ewallet",
    createdAt: "2024-04-10T14:55:00Z",
  },
  {
    paymentId: "pay-010",
    orderId: "order-010",
    userId: "usr-j0k1l2m3",
    email: "james.taylor@fintech.io",
    product: "ai_blueprint",
    amount: 85,
    status: "paid",
    paymentMethod: "midtrans",
    createdAt: "2024-02-14T11:00:00Z",
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
      const res = await fetch(`${apiUrl}/api/v1/payments/history/admin`, {
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

  return NextResponse.json({ payments: mockPayments });
}
