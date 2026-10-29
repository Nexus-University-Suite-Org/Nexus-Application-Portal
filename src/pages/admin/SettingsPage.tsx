import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { apiUrl } from "@/lib/apiUrl";
import { clearSiteSettingsCache } from "@/hooks/useSiteSettings";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RotateCcw, Save } from "lucide-react";

interface SettingDefinition {
  key: string;
  label: string;
  group: string;
  type: string;
  defaultValue: string;
  description: string;
  chatRelevant: boolean;
}

interface SiteSettingRow {
  id: number;
  settingKey: string;
  settingValue: string;
}

const GROUP_META: Record<string, { label: string; description: string }> = {
  university: {
    label: "University Profile",
    description: "Identity, contact details and social links shown across the portal.",
  },
  chat: {
    label: "Chat Assistant",
    description: "Control the assistant's name, welcome copy, quick topics and knowledge scope.",
  },
  branding: {
    label: "Branding",
    description: "Theme accent and splash screen used while the portal loads.",
  },
};

const GROUP_ORDER = ["university", "chat", "branding"];

const SettingsPage = () => {
  const { token } = useAdminAuth();
  const [definitions, setDefinitions] = useState<SettingDefinition[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(apiUrl("admin/site-settings/schema"), { headers }).then((r) => {
        if (!r.ok) throw new Error(`schema ${r.status}`);
        return r.json() as Promise<SettingDefinition[]>;
      }),
      fetch(apiUrl("admin/site-settings"), { headers }).then((r) => {
        if (!r.ok) throw new Error(`settings ${r.status}`);
        return r.json() as Promise<SiteSettingRow[]>;
      }),
    ])
      .then(([schema, rows]) => {
        if (!active) return;
        const current: Record<string, string> = {};
        schema.forEach((d) => {
          current[d.key] = d.defaultValue ?? "";
        });
        rows.forEach((row) => {
          current[row.settingKey] = row.settingValue ?? "";
        });
        setDefinitions(schema);
        setValues(current);
        setOriginal({ ...current });
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        toast({
          title: "Could not load settings",
          description: err.message,
          variant: "destructive",
        });
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const groups = useMemo(() => {
    const byGroup = new Map<string, SettingDefinition[]>();
    definitions.forEach((d) => {
      if (!byGroup.has(d.group)) byGroup.set(d.group, []);
      byGroup.get(d.group)!.push(d);
    });
    const ordered = GROUP_ORDER.filter((g) => byGroup.has(g));
    byGroup.forEach((_, g) => {
      if (!ordered.includes(g)) ordered.push(g);
    });
    return ordered.map((g) => ({ group: g, defs: byGroup.get(g)! }));
  }, [definitions]);

  const changedKeys = useMemo(
    () => Object.keys(values).filter((k) => (values[k] ?? "") !== (original[k] ?? "")),
    [values, original],
  );

  const setValue = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!token || changedKeys.length === 0) {
      toast({ title: "No changes to save" });
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        changedKeys.map((key) =>
          fetch(apiUrl("admin/site-settings"), {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ settingKey: key, settingValue: values[key] }),
          }).then((r) => {
            if (!r.ok) throw new Error(`Failed to save "${key}" (${r.status})`);
          }),
        ),
      );
      setOriginal({ ...values });
      clearSiteSettingsCache();
      toast({
        title: "Settings saved",
        description: `${changedKeys.length} setting(s) updated.`,
      });
    } catch (err) {
      toast({
        title: "Save failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (d: SettingDefinition) => {
    const value = values[d.key] ?? "";
    if (d.type === "boolean") {
      return (
        <Switch
          checked={value === "true"}
          onCheckedChange={(checked) => setValue(d.key, checked ? "true" : "false")}
        />
      );
    }
    if (d.type === "textarea" || d.type === "json") {
      return (
        <Textarea
          value={value}
          onChange={(e) => setValue(d.key, e.target.value)}
          rows={3}
          className={d.type === "json" ? "font-mono text-xs" : ""}
          placeholder={d.defaultValue}
        />
      );
    }
    return (
      <Input
        value={value}
        onChange={(e) => setValue(d.key, e.target.value)}
        placeholder={d.defaultValue}
      />
    );
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure this university's identity and assistant. Changes apply to the
            public site after saving.
          </p>
        </div>
        <Button onClick={save} disabled={saving || changedKeys.length === 0}>
          <Save size={16} className="mr-2" />
          {saving ? "Saving…" : `Save${changedKeys.length ? ` (${changedKeys.length})` : ""}`}
        </Button>
      </div>

      <Tabs defaultValue={groups[0]?.group}>
        <TabsList className="flex-wrap h-auto">
          {groups.map(({ group }) => (
            <TabsTrigger key={group} value={group}>
              {GROUP_META[group]?.label ?? group}
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map(({ group, defs }) => (
          <TabsContent key={group} value={group} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{GROUP_META[group]?.label ?? group}</CardTitle>
                {GROUP_META[group]?.description && (
                  <CardDescription>{GROUP_META[group].description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-5">
                {defs.map((d) => (
                  <div
                    key={d.key}
                    className={
                      d.type === "boolean"
                        ? "flex items-center justify-between gap-4"
                        : "space-y-1.5"
                    }
                  >
                    <div>
                      <Label htmlFor={d.key} className="flex items-center gap-2">
                        {d.label}
                      </Label>
                      {d.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {d.description}
                        </p>
                      )}
                    </div>
                    <div className={d.type === "boolean" ? "" : "pt-1"}>
                      {renderField(d)}
                    </div>
                    {d.type !== "boolean" && valueDiffers(d, values, original) && (
                      <button
                        type="button"
                        onClick={() => setValue(d.key, d.defaultValue ?? "")}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <RotateCcw size={11} />
                        Reset to default
                      </button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const valueDiffers = (
  d: SettingDefinition,
  values: Record<string, string>,
  original: Record<string, string>,
) => (values[d.key] ?? "") !== (original[d.key] ?? "") && (values[d.key] ?? "") !== (d.defaultValue ?? "");

export default SettingsPage;
