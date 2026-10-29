import { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Building2, Users, Loader2, KeyRound } from "lucide-react";

interface Tenant {
  id: number;
  code: string;
  name: string;
  domain: string | null;
  active: boolean;
  createdAt: string;
  adminCount: number;
}

interface AdminAccount {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "—";

const PlatformPage = () => {
  const { token } = useAdminAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isTenantOpen, setIsTenantOpen] = useState(false);
  const [tenantForm, setTenantForm] = useState({ name: "", code: "", domain: "" });
  const [savingTenant, setSavingTenant] = useState(false);

  const [adminsFor, setAdminsFor] = useState<Tenant | null>(null);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [adminForm, setAdminForm] = useState({ email: "", password: "", fullName: "" });
  const [savingAdmin, setSavingAdmin] = useState(false);

  const [resetFor, setResetFor] = useState<AdminAccount | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [savingReset, setSavingReset] = useState(false);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/platform/tenants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to load universities (${response.status})`);
      }
      setTenants(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load universities");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const createTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTenant(true);
    setError("");
    try {
      const body = {
        name: tenantForm.name.trim(),
        code: tenantForm.code.trim().toLowerCase(),
        domain: tenantForm.domain.trim() || null,
      };
      const response = await fetch("/api/v1/platform/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || `Failed to create university (${response.status})`);
      }
      setIsTenantOpen(false);
      setTenantForm({ name: "", code: "", domain: "" });
      fetchTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create university");
    } finally {
      setSavingTenant(false);
    }
  };

  const toggleStatus = async (tenant: Tenant) => {
    const nextActive = !tenant.active;
    const verb = nextActive ? "enable" : "disable";
    if (
      !window.confirm(
        `${nextActive ? "Enable" : "Disable"} ${tenant.name}? ` +
          (nextActive
            ? "Its admins will be able to sign in again."
            : "Its admins will be locked out of the admin portal."),
      )
    ) {
      return;
    }
    setError("");
    try {
      const response = await fetch(`/api/v1/platform/tenants/${tenant.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: nextActive }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || `Failed to ${verb} university (${response.status})`);
      }
      fetchTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${verb} university`);
    }
  };

  const openAdmins = async (tenant: Tenant) => {
    setAdminsFor(tenant);
    setAdmins([]);
    setAdminForm({ email: "", password: "", fullName: "" });
    setError("");
    try {
      const response = await fetch(`/api/v1/platform/tenants/${tenant.id}/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to load admins (${response.status})`);
      }
      setAdmins(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admins");
    }
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminsFor) return;
    setSavingAdmin(true);
    setError("");
    try {
      const response = await fetch(`/api/v1/platform/tenants/${adminsFor.id}/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminForm),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || `Failed to create admin (${response.status})`);
      }
      setAdminForm({ email: "", password: "", fullName: "" });
      openAdmins(adminsFor);
      fetchTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setSavingAdmin(false);
    }
  };

  const resetAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminsFor || !resetFor) return;
    setSavingReset(true);
    setError("");
    try {
      const response = await fetch(
        `/api/v1/platform/tenants/${adminsFor.id}/admins/${resetFor.id}/password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword: resetPassword }),
        },
      );
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || `Failed to reset password (${response.status})`);
      }
      setResetFor(null);
      setResetPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setSavingReset(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Universities</h1>
          <p className="text-sm text-muted-foreground">
            Onboard universities and provision their admin accounts
          </p>
        </div>
        <Button onClick={() => setIsTenantOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add University
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 size={18} />
            Tenant List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 size={20} className="animate-spin mr-2" />
              Loading...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Admins</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No universities yet. Add the first one to get started.
                    </TableCell>
                  </TableRow>
                )}
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-mono text-xs">{tenant.code}</TableCell>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>{tenant.domain || "—"}</TableCell>
                    <TableCell>{tenant.adminCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={tenant.active ? "default" : "secondary"}>
                          {tenant.active ? "Active" : "Disabled"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => toggleStatus(tenant)}
                        >
                          {tenant.active ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openAdmins(tenant)}>
                        <Users size={14} className="mr-2" />
                        Admins
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isTenantOpen} onOpenChange={setIsTenantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a University</DialogTitle>
            <DialogDescription>
              Onboarding seeds default portal settings and content areas for the
              new tenant.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createTenant} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-name">University name</Label>
              <Input
                id="tenant-name"
                placeholder="Makerere University"
                value={tenantForm.name}
                onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-code">Code</Label>
              <Input
                id="tenant-code"
                placeholder="muk"
                value={tenantForm.code}
                onChange={(e) => setTenantForm({ ...tenantForm, code: e.target.value })}
                required
                pattern="[a-z0-9-]{2,64}"
                title="Lowercase letters, digits or hyphens (2-64 characters)"
              />
              <p className="text-xs text-muted-foreground">
                Used to resolve the tenant (e.g. subdomain or integration header).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-domain">Custom domain (optional)</Label>
              <Input
                id="tenant-domain"
                placeholder="portal.mak.ac.ug"
                value={tenantForm.domain}
                onChange={(e) => setTenantForm({ ...tenantForm, domain: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsTenantOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingTenant}>
                {savingTenant ? "Creating..." : "Create University"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!adminsFor} onOpenChange={(open) => !open && setAdminsFor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Admins — {adminsFor?.name}</DialogTitle>
            <DialogDescription>
              These accounts can sign in to the admin portal for this university.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border divide-y">
              {admins.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No admins yet.</p>
              )}
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{admin.email}</p>
                    <p className="text-xs text-muted-foreground">{admin.fullName || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">{admin.role}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        setResetFor(admin);
                        setResetPassword("");
                        setError("");
                      }}
                    >
                      <KeyRound size={13} className="mr-1" />
                      Reset password
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={createAdmin} className="space-y-3 border-t pt-4">
              <p className="text-sm font-medium">Add an admin</p>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@mak.ac.ug"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-fullname">Full name</Label>
                <Input
                  id="admin-fullname"
                  placeholder="Jane Doe"
                  value={adminForm.fullName}
                  onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Temporary password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={savingAdmin} className="w-full">
                {savingAdmin ? "Creating..." : "Create Admin"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetFor} onOpenChange={(open) => !open && setResetFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              Set a new password for {resetFor?.email}. Share it with them so they
              can sign in, then change it.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={resetAdminPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New password</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="At least 8 characters"
                minLength={8}
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setResetFor(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingReset}>
                {savingReset ? "Saving..." : "Reset password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformPage;