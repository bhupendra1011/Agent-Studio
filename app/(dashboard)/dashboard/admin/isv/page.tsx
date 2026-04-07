export default function AdminIsvManagementPage() {
  return (
    <div className="space-y-2">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--studio-ink)]">
        ISV Management
      </h1>
      <p className="max-w-lg text-sm text-[var(--studio-ink-muted)]">
        Tenant / ISV onboarding and settings will live here. Connect your ISV admin
        API to list organizations, quotas, and billing hooks.
      </p>
    </div>
  );
}
