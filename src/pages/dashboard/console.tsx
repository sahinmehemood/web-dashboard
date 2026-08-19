import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Input } from "@/components/ui/input";
import { useSendCommand } from "@/hooks/use-dashboard";
import { DID } from "@/lib/demo";

type QuickType =
  | "crown_status"
  | "restart_hermes"
  | "check_providers"
  | "run_health"
  | "git_sync"
  | "list_crons";

type CommandType = QuickType | "custom";

interface LogLine {
  id: number;
  type: CommandType;
  input: string;
  output: string;
  at: number;
}

const QUICK_COMMANDS: { type: QuickType; label: string }[] = [
  { type: "crown_status", label: "crown_status" },
  { type: "restart_hermes", label: "restart_hermes" },
  { type: "check_providers", label: "check_providers" },
  { type: "run_health", label: "run_health" },
  { type: "git_sync", label: "git_sync" },
  { type: "list_crons", label: "list_crons" },
];

const COMMAND_OUTPUTS: Record<QuickType, string> = {
  crown_status:
    "runsvdir -P $PREFIX/var/service/\n7/7 services up · 0 orphans",
  restart_hermes: "hermes gateway restarting… done (pid 25899)",
  check_providers: "5/7 providers healthy · 2 rate-limited",
  run_health: "StackGov: 6/6 departments GREEN",
  git_sync: "git sync complete · 12 files changed",
  list_crons: "3 crons active · next run: brain-git in 9m",
};

const PROMPT = "hermes@device:~$";

export default function ConsolePage() {
  const send = useSendCommand();
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<LogLine[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const run = async (type: CommandType, text: string) => {
    if (!text.trim()) {
      toast.warning("Command required", {
        description: "Enter a command to dispatch.",
      });
      return;
    }
    const output =
      type === "custom"
        ? `$ ${text}\nexit 0 · completed in 0.42s`
        : COMMAND_OUTPUTS[type];
    setLines((prev) => [
      ...prev,
      { id: ++idRef.current, type, input: text, output, at: Date.now() },
    ]);
    if (type === "custom") setInput("");
    setSending(true);
    try {
      await send({
        deviceId: DID,
        commandType: type,
        payload: type === "custom" ? text : undefined,
      });
      toast.success("Command sent", {
        description: `${text} dispatched to ${DID}.`,
      });
    } catch (error) {
      toast.error("Failed to send command", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void run("custom", input);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Console"
        description="Dispatch commands to your Hermes agent and view responses."
      >
        <span className="font-mono text-xs text-muted-foreground">
          {lines.length} dispatched
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => setLines([])}
          disabled={lines.length === 0}
        >
          <Trash2 className="size-3.5" />
          Clear
        </Button>
      </PageHeader>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Send className="size-4 text-muted-foreground" />
            Terminal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            ref={scrollRef}
            className="max-h-[420px] overflow-y-auto rounded-lg border border-border bg-secondary/40 p-4 font-mono text-xs leading-relaxed"
          >
            {lines.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center text-center text-muted-foreground">
                No commands yet — type a command or pick a quick command.
              </div>
            ) : (
              <div className="space-y-3">
                {lines.map((line) => (
                  <div key={line.id} className="space-y-1">
                    <div className="break-all">
                      <span className="text-muted-foreground">{PROMPT}</span>{" "}
                      <span className="text-foreground">{line.input}</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-muted-foreground">
                      {line.output}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_COMMANDS.map((cmd) => (
              <button
                key={cmd.type}
                type="button"
                onClick={() => void run(cmd.type, cmd.label)}
                disabled={sending}
                className="cursor-pointer rounded-md border border-border bg-secondary/40 px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                {cmd.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {PROMPT}
            </span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a command…"
              className="font-mono text-xs"
              disabled={sending}
              autoFocus
            />
            <Button
              className="cursor-pointer"
              onClick={() => void run("custom", input)}
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Run
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}