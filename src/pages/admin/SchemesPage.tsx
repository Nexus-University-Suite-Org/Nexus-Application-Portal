import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SchemeProgram {
  id: number;
  programName: string;
  programCode: string;
  programType: string;
}

interface Scheme {
  id: number;
  schemeName: string;
  category: string;
  academicYear: string;
  intakeMonth: string;
  description: string;
  appOpenDate: string | null;
  appCloseDate: string | null;
  capacity: number | null;
  applicationFees: string;
  preferredStartDate: string | null;
  serviceFee: number | null;
  status: string;
  daysLeft: number | null;
  programCount: number;
  programs: SchemeProgram[];
  createdAt: string;
  updatedAt: string;
}

interface ProgramOption {
  id: number;
  programName: string;
  programCode: string;
  programType: string;
  facultySchool: string;
}

const EMPTY_FORM = {
  schemeName: "",
  category: "",
  academicYear: "",
  intakeMonth: "",
  description: "",
  appOpenDate: "",
  appCloseDate: "",
  capacity: "",
  applicationFeesUgandan: "",
  applicationFeesEastAfrican: "",
  applicationFeesNonEastAfrican: "",
  preferredStartDate: "",
  serviceFee: "",
  status: "OPEN",
  programIds: [] as number[],
};

const AWARD_ORDER = ["BACHELOR", "DIPLOMA", "CERTIFICATE", "MASTER", "PHD"];
const AWARD_LABELS: Record<string, string> = {
  BACHELOR: "Bachelor Degrees",
  DIPLOMA: "Diplomas",
  CERTIFICATE: "Certificates",
  MASTER: "Master Degrees",
  PHD: "Doctorates (PhD)",
};

export default function SchemesPage() {
  const { token } = useAdminAuth();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [allPrograms, setAllPrograms] = useState<ProgramOption[]>([]);
  const [programSearch, setProgramSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    BACHELOR: true,
  });

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token],
  );

  const fetchSchemes = async () => {
    try {
      const res = await fetch("/api/v1/admin/schemes", { headers: authHeaders });
      if (res.ok) setSchemes(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/v1/programs", { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setAllPrograms(
          data
            .filter((p: ProgramOption) => p.status === "Active")
            .map((p: ProgramOption) => ({
              id: p.id,
              programName: p.programName,
              programCode: p.programCode,
              programType: p.programType || "BACHELOR",
              facultySchool: p.facultySchool || "",
            })),
        );
      }
    } catch {}
  };

  useEffect(() => {
    fetchSchemes();
    fetchPrograms();
  }, []);

  const groupedPrograms = useMemo(() => {
    const groups: Record<string, ProgramOption[]> = {};
    for (const p of allPrograms) {
      const key = AWARD_ORDER.includes(p.programType) ? p.programType : "BACHELOR";
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    const filtered: Record<string, ProgramOption[]> = {};
    for (const key of AWARD_ORDER) {
      if (!groups[key]) continue;
      const q = programSearch.toLowerCase();
      const matches = groups[key].filter(
        (p) =>
          !q ||
          p.programName.toLowerCase().includes(q) ||
          p.programCode.toLowerCase().includes(q) ||
          p.facultySchool.toLowerCase().includes(q),
      );
      if (matches.length > 0) filtered[key] = matches;
    }
    return filtered;
  }, [allPrograms, programSearch]);

  const filteredSchemes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return schemes.filter(
      (s) =>
        !q ||
        s.schemeName.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.academicYear.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q),
    );
  }, [schemes, searchQuery]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (scheme: Scheme) => {
    setEditingId(scheme.id);
    const fees = (() => {
      try {
        return JSON.parse(scheme.applicationFees || "{}");
      } catch {
        return {};
      }
    })();
    setForm({
      schemeName: scheme.schemeName,
      category: scheme.category || "",
      academicYear: scheme.academicYear || "",
      intakeMonth: scheme.intakeMonth || "",
      description: scheme.description || "",
      appOpenDate: scheme.appOpenDate ? scheme.appOpenDate.slice(0, 16) : "",
      appCloseDate: scheme.appCloseDate ? scheme.appCloseDate.slice(0, 16) : "",
      capacity: scheme.capacity != null ? String(scheme.capacity) : "",
      applicationFeesUgandan: fees.ugandan != null ? String(fees.ugandan) : "",
      applicationFeesEastAfrican: fees.eastAfrican != null ? String(fees.eastAfrican) : "",
      applicationFeesNonEastAfrican: fees.nonEastAfrican != null ? String(fees.nonEastAfrican) : "",
      preferredStartDate: (() => {
        if (!scheme.preferredStartDate) return "";
        try {
          const parsed = JSON.parse(scheme.preferredStartDate);
          return Array.isArray(parsed) ? parsed.join(", ") : String(parsed);
        } catch {
          return scheme.preferredStartDate;
        }
      })(),
      serviceFee: scheme.serviceFee != null ? String(scheme.serviceFee) : "",
      status: scheme.status,
      programIds: scheme.programs.map((p) => p.id),
    });
    const selectedTypes = new Set(scheme.programs.map((p) => {
      const t = p.programType || "BACHELOR";
      return AWARD_ORDER.includes(t) ? t : "BACHELOR";
    }));
    setExpandedGroups({ BACHELOR: true, ...Object.fromEntries([...selectedTypes].map((t) => [t, true])) });
    setDialogOpen(true);
  };

  const toggleProgram = (id: number) => {
    setForm((prev) => ({
      ...prev,
      programIds: prev.programIds.includes(id)
        ? prev.programIds.filter((x) => x !== id)
        : [...prev.programIds, id],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        schemeName: form.schemeName,
        category: form.category,
        academicYear: form.academicYear,
        intakeMonth: form.intakeMonth,
        description: form.description,
        appOpenDate: form.appOpenDate ? form.appOpenDate + ":00" : null,
        appCloseDate: form.appCloseDate ? form.appCloseDate + ":00" : null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        applicationFees: JSON.stringify({
          ugandan: form.applicationFeesUgandan ? Number(form.applicationFeesUgandan) : undefined,
          eastAfrican: form.applicationFeesEastAfrican ? Number(form.applicationFeesEastAfrican) : undefined,
          nonEastAfrican: form.applicationFeesNonEastAfrican ? Number(form.applicationFeesNonEastAfrican) : undefined,
        }),
        preferredStartDate: form.preferredStartDate
          ? JSON.stringify(form.preferredStartDate.split(",").map((d) => d.trim()).filter(Boolean))
          : null,
        serviceFee: form.serviceFee ? Number(form.serviceFee) : null,
        status: form.status,
        programIds: form.programIds,
      };

      const url = editingId ? `/api/v1/admin/schemes/${editingId}` : "/api/v1/admin/schemes";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(payload) });
      if (res.ok) {
        setDialogOpen(false);
        fetchSchemes();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this scheme?")) return;
    await fetch(`/api/v1/admin/schemes/${id}`, { method: "DELETE", headers: authHeaders });
    fetchSchemes();
  };

  const setField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleGroup = (group: string) =>
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading">Admission Schemes</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" /> New Scheme
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search schemes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-transparent"
        />
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Scheme Name</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Academic Year</th>
              <th className="text-left px-4 py-3 font-medium">Closes</th>
              <th className="text-left px-4 py-3 font-medium">Programs</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : filteredSchemes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No schemes found.
                </td>
              </tr>
            ) : (
              filteredSchemes.map((scheme) => (
                <tr key={scheme.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{scheme.schemeName}</td>
                  <td className="px-4 py-3">{scheme.category}</td>
                  <td className="px-4 py-3">{scheme.academicYear}</td>
                  <td className="px-4 py-3">
                    {scheme.appCloseDate
                      ? new Date(scheme.appCloseDate).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{scheme.programCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={scheme.status === "OPEN" ? "default" : scheme.status === "SCHEDULED" ? "secondary" : "outline"}>
                      {scheme.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(scheme)} className="p-1 hover:bg-muted rounded">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(scheme.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded ml-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Scheme" : "New Scheme"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Scheme Name *</label>
                <input value={form.schemeName} onChange={(e) => setField("schemeName", e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</label>
                <select value={form.category} onChange={(e) => setField("category", e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent">
                  <option value="">Select</option>
                  <option value="UNDERGRADUATE">Undergraduate</option>
                  <option value="POSTGRADUATE">Postgraduate</option>
                  <option value="MASTER">Master</option>
                  <option value="PHD">PhD</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="DIPLOMA">Diploma</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</label>
                <select value={form.status} onChange={(e) => setField("status", e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent">
                  <option value="OPEN">Open</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Academic Year</label>
                <input value={form.academicYear} onChange={(e) => setField("academicYear", e.target.value)} placeholder="e.g. 2026/2027" className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Intake Month</label>
                <input value={form.intakeMonth} onChange={(e) => setField("intakeMonth", e.target.value)} placeholder="e.g. August" className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Application Opens</label>
                <input type="datetime-local" value={form.appOpenDate} onChange={(e) => setField("appOpenDate", e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Application Closes *</label>
                <input type="datetime-local" value={form.appCloseDate} onChange={(e) => setField("appCloseDate", e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Capacity</label>
                <input type="number" value={form.capacity} onChange={(e) => setField("capacity", e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Service Fee (UGX)</label>
                <input type="number" value={form.serviceFee} onChange={(e) => setField("serviceFee", e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Preferred Start Dates (comma-separated)</label>
              <input value={form.preferredStartDate} onChange={(e) => setField("preferredStartDate", e.target.value)} placeholder="e.g. August 2026, January 2027" className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent" />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</label>
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={2} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent resize-none" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ugandan Fee (UGX)</label>
                <input type="number" value={form.applicationFeesUgandan} onChange={(e) => setField("applicationFeesUgandan", e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">East African Fee (UGX)</label>
                <input type="number" value={form.applicationFeesEastAfrican} onChange={(e) => setField("applicationFeesEastAfrican", e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Non East African Fee (UGX)</label>
                <input type="number" value={form.applicationFeesNonEastAfrican} onChange={(e) => setField("applicationFeesNonEastAfrican", e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
                Select Programme(s) * <span className="text-muted-foreground font-normal normal-case">— Grouped by award type. {form.programIds.length} selected.</span>
              </label>
              <div className="border border-border rounded-lg">
                <div className="p-2 bg-background border-b border-border">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Type to search programmes..."
                      value={programSearch}
                      onChange={(e) => setProgramSearch(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 text-sm border-2 border-border rounded-lg bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {programSearch && (
                      <button onClick={() => setProgramSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {Object.entries(groupedPrograms).map(([group, programs]) => (
                    <div key={group}>
                      <button
                        onClick={() => toggleGroup(group)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 hover:bg-muted/50 sticky top-0 z-[1]"
                      >
                        {expandedGroups[group] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {AWARD_LABELS[group] || group}
                        <span className="ml-auto text-[10px] font-normal normal-case">
                          {programs.filter((p) => form.programIds.includes(p.id)).length}/{programs.length}
                        </span>
                      </button>
                      {expandedGroups[group] &&
                        programs.map((prog) => (
                          <label
                            key={prog.id}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30 cursor-pointer border-b border-border/50 last:border-0"
                          >
                            <input
                              type="checkbox"
                              checked={form.programIds.includes(prog.id)}
                              onChange={() => toggleProgram(prog.id)}
                              className="rounded border-border"
                            />
                            <div className="min-w-0">
                              <p className="text-sm truncate">{prog.programName}</p>
                              <p className="text-[10px] text-muted-foreground">{prog.programCode} — {prog.facultySchool}</p>
                            </div>
                          </label>
                        ))}
                    </div>
                  ))}
                  {Object.keys(groupedPrograms).length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted-foreground">No programmes match your search.</p>
                  )}
                </div>
                {form.programIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-3 py-2 border-t border-border bg-muted/20">
                    {allPrograms
                      .filter((p) => form.programIds.includes(p.id))
                      .map((p) => (
                        <Badge key={p.id} variant="secondary" className="text-[10px] gap-1">
                          {p.programCode}
                          <button onClick={() => toggleProgram(p.id)} className="hover:text-destructive">
                            <X size={10} />
                          </button>
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.schemeName}>
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
