import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectGroup {
  label: string;
  options: string[];
}

interface GroupedSearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  groups: SelectGroup[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function GroupedSearchableSelect({
  value,
  onValueChange,
  groups,
  placeholder = "Select an option",
  className,
  disabled,
}: GroupedSearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const flattened = groups.flatMap((g) => g.options);
  const filteredGroups = query
    ? groups
        .map((g) => ({
          label: g.label,
          options: g.options.filter((o) =>
            o.toLowerCase().includes(query.toLowerCase()),
          ),
        }))
        .filter((g) => g.options.length > 0)
    : groups;

  const displayText = value || placeholder;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen(!open);
          setQuery("");
        }}
        className={cn(
          "mt-2 w-full flex items-center justify-between border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm text-left transition-colors",
          open && "ring-2 ring-ring",
          !value && "text-muted-foreground",
        )}
      >
        <span className="truncate">{displayText}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-[12px] border border-border bg-popover shadow-lg">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type to search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-body outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-1">
            {flattened.length === 0 || filteredGroups.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No programme found
              </div>
            ) : (
              filteredGroups.map((group, gi) => (
                <div key={gi}>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-accent">
                    {group.label}
                  </p>
                  {group.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onValueChange(opt);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full items-center rounded-lg px-3 py-2 text-sm font-body text-left transition-colors hover:bg-accent hover:text-accent-foreground",
                        value === opt && "bg-accent text-accent-foreground",
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          value === opt ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{opt}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
