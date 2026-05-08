"use client";
import React, { useState, useEffect, useCallback } from "react";
import DataTable, { Column } from "@/components/shared/DataTable";
import DetailView from "@/components/shared/DetailView";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import ErrorState from "@/components/shared/ErrorState";
import WriteGate from "@/components/rbac/WriteGate";
import { useAuth } from "@/hooks/useAuth";
import { EyeIcon, EyeCloseIcon } from "@/icons";

interface AdminAccount extends Record<string, unknown> {
  id: string;
  email: string;
  fullName: string;
  status: "active" | "suspended";
  createdAt: string;
  lastLogin: string | null;
  forcePasswordChange: boolean;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminAccountsPage() {
  const { role, user } = useAuth();
  const currentUserEmail = user?.email ?? "";

  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password management state
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [pwActionLoading, setPwActionLoading] = useState(false);
  const [pwActionMessage, setPwActionMessage] = useState<string | null>(null);

  // Create modal state
  const [createEmail, setCreateEmail] = useState("");
  const [createFullName, setCreateFullName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createConfirmPassword, setCreateConfirmPassword] = useState("");
  const [createForceReset, setCreateForceReset] = useState(true);
  const [createShowPassword, setCreateShowPassword] = useState(false);
  const [createShowConfirm, setCreateShowConfirm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/admin-accounts");
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error(`Failed to load admin accounts (${res.status})`);
      }
      const data = await res.json();
      setAccounts(data.accounts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin accounts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSuspend = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/admin-accounts/${id}/suspend`, {
        method: "PATCH",
      });
      if (res.ok) {
        await fetchAccounts();
        if (selectedAccount?.id === id) {
          setSelectedAccount((prev) =>
            prev ? { ...prev, status: "suspended" } : null
          );
        }
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/admin-accounts/${id}/reactivate`, {
        method: "PATCH",
      });
      if (res.ok) {
        await fetchAccounts();
        if (selectedAccount?.id === id) {
          setSelectedAccount((prev) =>
            prev ? { ...prev, status: "active" } : null
          );
        }
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (id: string) => {
    setPwActionLoading(true);
    setPwActionMessage(null);
    setTempPassword(null);
    try {
      const res = await fetch(`/api/admin/admin-accounts/${id}/reset-password`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setTempPassword(data.temporaryPassword);
        setShowTempPassword(false);
      } else {
        setPwActionMessage("Failed to reset password. Please try again.");
      }
    } catch {
      setPwActionMessage("Failed to reset password. Please try again.");
    } finally {
      setPwActionLoading(false);
    }
  };

  const handleForceReset = async (id: string) => {
    setPwActionLoading(true);
    setPwActionMessage(null);
    try {
      const res = await fetch(`/api/admin/admin-accounts/${id}/force-reset`, {
        method: "PATCH",
      });
      if (res.ok) {
        setPwActionMessage("✓ Force password change enabled. User must reset on next login.");
        await fetchAccounts();
      } else {
        setPwActionMessage("Failed to set force reset. Please try again.");
      }
    } catch {
      setPwActionMessage("Failed to set force reset. Please try again.");
    } finally {
      setPwActionLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createEmail || !createFullName || !createPassword) {
      setCreateError("All fields are required.");
      return;
    }
    if (createPassword.length < 8) {
      setCreateError("Password must be at least 8 characters.");
      return;
    }
    if (createPassword !== createConfirmPassword) {
      setCreateError("Passwords do not match.");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/admin-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail,
          full_name: createFullName,
          password: createPassword,
          force_password_change: createForceReset,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.error ?? "Failed to create admin account.");
        return;
      }

      // Success
      setShowCreateModal(false);
      setCreateEmail("");
      setCreateFullName("");
      setCreatePassword("");
      setCreateConfirmPassword("");
      setCreateForceReset(true);
      setSuccessMessage("Admin account created successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchAccounts();
    } catch {
      setCreateError("Something went wrong. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const columns: Column<AdminAccount>[] = [
    { key: "id", header: "User ID", width: "140px" },
    { key: "email", header: "Email" },
    { key: "fullName", header: "Full Name" },
    {
      key: "status",
      header: "Status",
      width: "110px",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.status === "active"
              ? "bg-[#00e59e]/15 text-[#00e59e]"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {row.status === "active" ? "Active" : "Suspended"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      width: "140px",
      render: (row) => formatDate(row.createdAt as string),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      width: "140px",
      render: (row) => formatDate(row.lastLogin as string | null),
    },
    {
      key: "actions",
      header: "Actions",
      width: "120px",
      render: (row) => (
        <WriteGate>
          {row.status === "active" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSuspend(row.id as string);
              }}
              disabled={
                actionLoading === row.id || row.email === currentUserEmail
              }
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
            >
              {actionLoading === row.id ? "..." : "Suspend"}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReactivate(row.id as string);
              }}
              disabled={actionLoading === row.id}
              className="rounded-lg border border-[#00e59e]/30 bg-[#00e59e]/10 px-3 py-1 text-xs font-medium text-[#00e59e] hover:bg-[#00e59e]/20 disabled:opacity-40 transition-colors"
            >
              {actionLoading === row.id ? "..." : "Reactivate"}
            </button>
          )}
        </WriteGate>
      ),
    },
  ];

  // Access guard
  if (!isLoading && role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-white mb-2">Access Denied</p>
        <p className="text-sm text-gray-400">
          This page is only accessible to superadmin users.
        </p>
      </div>
    );
  }

  if (isLoading) return <LoadingSkeleton rows={8} />;
  if (error) return <ErrorState message={error} onRetry={fetchAccounts} />;

  const detailData = selectedAccount
    ? {
        "Account ID": selectedAccount.id,
        Email: selectedAccount.email,
        "Full Name": selectedAccount.fullName,
        Status: selectedAccount.status,
        "Created At": new Date(selectedAccount.createdAt).toLocaleString(),
        "Last Login": selectedAccount.lastLogin
          ? new Date(selectedAccount.lastLogin).toLocaleString()
          : "Never",
        "Force Password Change": selectedAccount.forcePasswordChange ? "Yes" : "No",
      }
    : {};

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Admin Accounts</h1>
        <WriteGate>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setCreateError(null);
            }}
            className="rounded-lg bg-[#00e59e]/15 border border-[#00e59e]/30 px-4 py-2 text-sm font-medium text-[#00e59e] hover:bg-[#00e59e]/25 transition-colors"
          >
            + Create Admin
          </button>
        </WriteGate>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="rounded-lg bg-[#00e59e]/10 border border-[#00e59e]/20 px-4 py-3 text-sm text-[#00e59e]">
          {successMessage}
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={accounts}
        onRowClick={(row) => {
          setSelectedAccount(row);
          setTempPassword(null);
          setPwActionMessage(null);
        }}
        emptyMessage="No admin accounts found."
      />

      {/* Password management panel — shown when an account is selected */}
      {selectedAccount && (
        <div className="rounded-xl border border-white/[0.07] bg-[#2a2a27] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Password Management —{" "}
              <span className="text-[#00e59e]">{selectedAccount.email}</span>
            </h2>
            <button
              onClick={() => {
                setSelectedAccount(null);
                setTempPassword(null);
                setPwActionMessage(null);
              }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>

          <WriteGate>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleResetPassword(selectedAccount.id as string)}
                disabled={pwActionLoading}
                className="rounded-lg border border-white/[0.07] px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                {pwActionLoading ? "Processing..." : "Reset Password"}
              </button>
              <button
                onClick={() => handleForceReset(selectedAccount.id as string)}
                disabled={pwActionLoading || (selectedAccount.forcePasswordChange as boolean)}
                className="rounded-lg border border-white/[0.07] px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                {selectedAccount.forcePasswordChange
                  ? "Force Reset Already Set"
                  : "Force Password Change"}
              </button>
            </div>
          </WriteGate>

          {/* Temp password display */}
          {tempPassword && (
            <div className="rounded-lg border border-[#00e59e]/20 bg-[#00e59e]/5 px-4 py-3 space-y-2">
              <p className="text-xs text-gray-400">Temporary password generated:</p>
              <div className="flex items-center gap-3">
                <code className="text-sm font-mono text-[#00e59e]">
                  {showTempPassword ? tempPassword : "•".repeat(tempPassword.length)}
                </code>
                <button
                  onClick={() => setShowTempPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                  aria-label={showTempPassword ? "Hide password" : "Show password"}
                >
                  {showTempPassword ? (
                    <EyeCloseIcon className="fill-gray-400" />
                  ) : (
                    <EyeIcon className="fill-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(tempPassword)}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Share this securely with the admin. It will not be shown again.
              </p>
            </div>
          )}

          {/* Action feedback */}
          {pwActionMessage && (
            <p
              className={`text-sm ${
                pwActionMessage.startsWith("✓")
                  ? "text-[#00e59e]"
                  : "text-red-400"
              }`}
            >
              {pwActionMessage}
            </p>
          )}
        </div>
      )}

      {/* Detail view slide-over */}
      {selectedAccount && (
        <DetailView
          title={`Admin: ${selectedAccount.email}`}
          recordType="user"
          recordId={selectedAccount.id as string}
          data={detailData as Record<string, unknown>}
          onClose={() => {
            setSelectedAccount(null);
            setTempPassword(null);
            setPwActionMessage(null);
          }}
        />
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowCreateModal(false)}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-[#2a2a27] border-l border-white/[0.07] z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <h2 className="text-base font-semibold text-white">Create Admin Account</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                aria-label="Close panel"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form onSubmit={handleCreateSubmit} className="space-y-5">
                {createError && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {createError}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="admin@aivory.id"
                    required
                    className="w-full rounded-lg border border-white/[0.07] bg-white/5 px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00e59e]/50"
                  />
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={createFullName}
                    onChange={(e) => setCreateFullName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full rounded-lg border border-white/[0.07] bg-white/5 px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00e59e]/50"
                  />
                </div>

                {/* Temporary Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                    Temporary Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={createShowPassword ? "text" : "password"}
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      className="w-full rounded-lg border border-white/[0.07] bg-white/5 px-3 py-2.5 pr-10 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00e59e]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setCreateShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      aria-label={createShowPassword ? "Hide password" : "Show password"}
                    >
                      {createShowPassword ? (
                        <EyeCloseIcon className="fill-gray-400" />
                      ) : (
                        <EyeIcon className="fill-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={createShowConfirm ? "text" : "password"}
                      value={createConfirmPassword}
                      onChange={(e) => setCreateConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full rounded-lg border border-white/[0.07] bg-white/5 px-3 py-2.5 pr-10 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00e59e]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setCreateShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      aria-label={createShowConfirm ? "Hide password" : "Show password"}
                    >
                      {createShowConfirm ? (
                        <EyeCloseIcon className="fill-gray-400" />
                      ) : (
                        <EyeIcon className="fill-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Force password change */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="forceReset"
                    checked={createForceReset}
                    onChange={(e) => setCreateForceReset(e.target.checked)}
                    className="h-4 w-4 rounded border-white/[0.07] bg-white/5 accent-[#00e59e]"
                  />
                  <label htmlFor="forceReset" className="text-sm text-gray-300 cursor-pointer">
                    Require password change on first login
                  </label>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="w-full rounded-lg bg-[#00e59e]/15 border border-[#00e59e]/30 px-4 py-2.5 text-sm font-medium text-[#00e59e] hover:bg-[#00e59e]/25 disabled:opacity-50 transition-colors"
                  >
                    {createLoading ? "Creating..." : "Create Admin Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
