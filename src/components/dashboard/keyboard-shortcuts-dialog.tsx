import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Kbd } from "@/components/ui/kbd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShortcutsContextValue {
  open: () => void;
}

const ShortcutsContext = createContext<ShortcutsContextValue>({ open: () => {} });

export function useShortcutsDialog() {
  return useContext(ShortcutsContext);
}

const isMac =
  typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const GROUPS: { title: string; items: { label: string; keys: string[] }[] }[] = [
  {
    title: "Global",
    items: [
      { label: "Open command center", keys: [isMac ? "⌘" : "Ctrl", "K"] },
      { label: "Show this dialog", keys: ["?"] },
      { label: "Toggle theme", keys: [isMac ? "⌘" : "Ctrl", "T"] },
    ],
  },
  {
    title: "Navigation",
    items: [
      { label: "Jump to page 1-0", keys: ["1", "…", "0"] },
      { label: "Overview", keys: ["G", "O"] },
      { label: "Crown", keys: ["G", "C"] },
      { label: "Providers", keys: ["G", "P"] },
      { label: "Crons", keys: ["G", "R"] },
      { label: "Activity", keys: ["G", "A"] },
      { label: "Brain", keys: ["G", "B"] },
      { label: "Console", keys: ["G", "N"] },
      { label: "Bots", keys: ["G", "T"] },
      { label: "Health", keys: ["G", "H"] },
      { label: "Settings", keys: ["G", "S"] },
    ],
  },
];

export function ShortcutsDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <ShortcutsContext.Provider value={{ open: useCallback(() => setOpen(true), []) }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>
              Move faster across the Hermes dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {GROUPS.map((group) => (
              <div key={group.title}>
                <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </div>
                <dl className="space-y-2">
                  {group.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4"
                    >
                      <dt className="text-sm">{item.label}</dt>
                      <dd className="flex items-center gap-1">
                        {item.keys.map((k, i) => (
                          <Kbd key={i}>{k}</Kbd>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </ShortcutsContext.Provider>
  );
}
