import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  searchable?: boolean;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "switch" | "date";
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
}

interface AdminCrudPageProps<T> {
  title: string;
  apiEndpoint: string;
  columns: Column<T>[];
  fields: FieldConfig[];
  searchPlaceholder?: string;
  token: string | null;
  createFields?: FieldConfig[];
  hideCreate?: boolean;
  hideEdit?: boolean;
  hideDelete?: boolean;
}

export function AdminCrudPage<T extends { id: number }>({
  title,
  apiEndpoint,
  columns,
  fields,
  searchPlaceholder = "Search...",
  token,
  createFields,
  hideCreate = false,
  hideEdit = false,
  hideDelete = false,
}: AdminCrudPageProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", page.toString());
      params.append("size", "10");

      const response = await fetch(`${apiEndpoint}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result)) {
          setData(result);
          setTotalPages(1);
        } else if (result.content) {
          setData(result.content);
          setTotalPages(result.totalPages || 1);
        } else {
          setData([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, page, token]);

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateOpen(false);
        setFormData({});
        fetchData();
      } else {
        const body = await response.json().catch(() => null);
        setError(body?.message || body?.detail || `Failed to create (${response.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${apiEndpoint}/${editItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditItem(null);
        setFormData({});
        fetchData();
      } else {
        const body = await response.json().catch(() => null);
        setError(body?.message || body?.detail || `Failed to update (${response.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${apiEndpoint}/${itemToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setIsDeleteOpen(false);
        setItemToDelete(null);
        fetchData();
      } else {
        const body = await response.json().catch(() => null);
        setError(body?.message || body?.detail || `Failed to delete (${response.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item: T) => {
    setEditItem(item);
    const form: Record<string, unknown> = {};
    fields.forEach((f) => {
      form[f.key] = (item as Record<string, unknown>)[f.key] ?? "";
    });
    setFormData(form);
  };

  const openCreate = () => {
    setFormData({});
    setIsCreateOpen(true);
  };

  const renderFormFields = (fieldConfigs: FieldConfig[]) => (
    <div className="space-y-4">
      {fieldConfigs.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.type === "text" && (
            <Input
              id={field.key}
              value={(formData[field.key] as string) || ""}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              required={field.required}
            />
          )}
          {field.type === "textarea" && (
            <Textarea
              id={field.key}
              value={(formData[field.key] as string) || ""}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              required={field.required}
            />
          )}
          {field.type === "number" && (
            <Input
              id={field.key}
              type="number"
              value={(formData[field.key] as number) || ""}
              onChange={(e) => setFormData({ ...formData, [field.key]: Number(e.target.value) })}
              placeholder={field.placeholder}
              required={field.required}
            />
          )}
          {field.type === "select" && (
            <Select
              value={(formData[field.key] as string) || ""}
              onValueChange={(value) => setFormData({ ...formData, [field.key]: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Select..."} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {field.type === "switch" && (
            <Switch
              checked={(formData[field.key] as boolean) || false}
              onCheckedChange={(checked) => setFormData({ ...formData, [field.key]: checked })}
            />
          )}
          {field.type === "date" && (
            <Input
              id={field.key}
              type="datetime-local"
              value={(formData[field.key] as string) || ""}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
              required={field.required}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl">{title}</h1>
          <p className="text-muted-foreground">Manage {title.toLowerCase()}</p>
        </div>
        {!hideCreate && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No data found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                      ))}
                      {(!hideEdit || !hideDelete) && (
                        <TableHead className="w-[100px]">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id}>
                        {columns.map((col) => (
                          <TableCell key={col.key}>
                            {col.render
                              ? col.render(item)
                              : String((item as Record<string, unknown>)[col.key] ?? "")}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!hideEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {!hideDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setItemToDelete(item);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      {!hideCreate && (
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setError(""); }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create {title.slice(0, -1)}</DialogTitle>
              <DialogDescription>Add a new {title.toLowerCase().slice(0, -1)}</DialogDescription>
            </DialogHeader>
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}
            {renderFormFields(createFields || fields)}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {!hideEdit && (
        <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) { setEditItem(null); setError(""); } }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
              <DialogDescription>Update {title.toLowerCase().slice(0, -1)}</DialogDescription>
            </DialogHeader>
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}
            {renderFormFields(fields)}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditItem(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={saving}>
                {saving ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {!hideDelete && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {title.slice(0, -1)}</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                {saving ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
