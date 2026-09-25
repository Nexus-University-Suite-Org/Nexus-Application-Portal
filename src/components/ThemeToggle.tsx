import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = ({ solid = false }: { solid?: boolean }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const base =
    "flex items-center justify-center rounded-full size-9 transition-colors duration-500";

  // resolvedTheme is undefined until next-themes has read storage, so
  // render a disabled placeholder rather than guessing the wrong icon.
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        disabled
        className={`${base} opacity-50 ${solid ? "text-foreground" : "text-primary-foreground"}`}
      >
        <Sun size={16} />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const target = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      aria-label={`Switch to ${target} mode`}
      title={`Switch to ${target} mode`}
      onClick={() => setTheme(target)}
      className={`${base} ${
        solid
          ? "text-foreground hover:bg-foreground/10"
          : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
      }`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};

export default ThemeToggle;
