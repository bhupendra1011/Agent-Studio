"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INITIAL_ADMIN_MOCK_USERS,
  type AdminPortalUserRow,
  type AdminPortalUserRole,
} from "@/lib/admin-mock-users";
import { writeImpersonation } from "@/lib/impersonation-storage";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

function maskAgora(suffix: string): string {
  return `****${suffix}`;
}

function RoleBadge({ role }: { role: AdminPortalUserRole }) {
  if (role === "admin") {
    return (
      <Badge
        variant="outline"
        className="rounded-lg border-[var(--studio-mauve)]/40 bg-[var(--studio-mauve)]/15 font-medium capitalize text-[var(--studio-ink)]"
      >
        {role}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)] font-medium capitalize text-[var(--studio-ink-muted)]"
    >
      {role}
    </Badge>
  );
}

export function UserManagementPageClient() {
  const [users, setUsers] = useState<AdminPortalUserRow[]>(INITIAL_ADMIN_MOCK_USERS);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminPortalUserRow | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminPortalUserRole>("user");
  const [newIsv, setNewIsv] = useState("");

  const resetCreateForm = () => {
    setNewEmail("");
    setNewRole("user");
    setNewIsv("");
  };

  const handleCreate = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    setUsers((prev) => [
      ...prev,
      {
        id: `u_${Date.now()}`,
        email,
        role: newRole,
        isv: newRole === "admin" ? null : newIsv.trim() || "—",
        agoraIdSuffix: suffix,
      },
    ]);
    setCreateOpen(false);
    resetCreateForm();
  };

  const viewAs = (row: AdminPortalUserRow) => {
    writeImpersonation({ label: row.email, note: `user:${row.id}` });
    window.dispatchEvent(new Event("studio-impersonation-change"));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--studio-ink)]">
            User Management
          </h1>
          <p className="mt-1 text-sm text-[var(--studio-ink-muted)]">
            Mock data — replace with your ISV user API when available.
          </p>
        </div>
        <Button
          type="button"
          className="shrink-0 gap-2 rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create user
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50">
              <th className="px-4 py-3 font-medium text-[var(--studio-ink)]">User</th>
              <th className="px-4 py-3 font-medium text-[var(--studio-ink)]">Role</th>
              <th className="px-4 py-3 font-medium text-[var(--studio-ink)]">ISV</th>
              <th className="px-4 py-3 font-medium text-[var(--studio-ink)]">Agora ID</th>
              <th className="px-4 py-3 font-medium text-[var(--studio-ink)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--studio-border)]/60 last:border-0"
              >
                <td className="px-4 py-3 font-medium text-[var(--studio-ink)]">
                  {row.email}
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={row.role} />
                </td>
                <td className="px-4 py-3 text-[var(--studio-ink-muted)]">
                  {row.isv ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--studio-ink-muted)]">
                  {maskAgora(row.agoraIdSuffix)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="text-sm font-medium text-[var(--studio-teal)] hover:underline"
                      onClick={() => setEditUser(row)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={row.role === "admin"}
                      className={cn(
                        "text-sm font-medium hover:underline",
                        row.role === "admin"
                          ? "cursor-not-allowed text-[var(--studio-ink-muted)]/50"
                          : "text-[var(--studio-ink-muted)] hover:text-[var(--studio-ink)]"
                      )}
                      onClick={() => row.role !== "admin" && viewAs(row)}
                    >
                      View as
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>
              Demo only — no request is sent. The user appears in the table locally.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="admin-new-email">Email</Label>
              <Input
                id="admin-new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="rounded-xl"
                placeholder="name@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={newRole}
                onValueChange={(v) => {
                  if (v === "admin" || v === "user") setNewRole(v);
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newRole === "user" ? (
              <div className="grid gap-2">
                <Label htmlFor="admin-new-isv">ISV / company</Label>
                <Input
                  id="admin-new-isv"
                  value={newIsv}
                  onChange={(e) => setNewIsv(e.target.value)}
                  className="rounded-xl"
                  placeholder="Acme Corp"
                />
              </div>
            ) : null}
          </div>
          <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[var(--studio-teal)] text-[var(--studio-ink)]"
              onClick={handleCreate}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editUser)} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="max-w-md rounded-2xl" showCloseButton>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Mock editor — wire PATCH to your user API when ready.
            </DialogDescription>
          </DialogHeader>
          {editUser ? (
            <p className="text-sm text-[var(--studio-ink-muted)]">
              <span className="font-medium text-[var(--studio-ink)]">{editUser.email}</span>
            </p>
          ) : null}
          <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
