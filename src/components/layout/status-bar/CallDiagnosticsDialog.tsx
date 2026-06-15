import type { CallActive, ConnectivityIssue, IceDiagnostics, Unsubscribe } from "@wavoip/wavoip-api";
import { type ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import { useShadowRoot } from "@/providers/ShadowRootProvider";

type Props = {
  call: CallActive;
  children: ReactNode;
};

type IssueRecord = { at: number; issue: ConnectivityIssue };

export function CallDiagnosticsDialog({ call, children }: Props) {
  const { root } = useShadowRoot();
  const [open, setOpen] = useState(false);
  const [lastIce, setLastIce] = useState<IceDiagnostics | null>(null);
  const [issues, setIssues] = useState<IssueRecord[]>([]);

  useEffect(() => {
    const unsubs: Unsubscribe[] = [
      call.on("iceDiagnostics", (diag) => setLastIce(diag)),
      call.on("connectivityIssue", (issue) => setIssues((prev) => [...prev, { at: Date.now(), issue }].slice(-20))),
    ];
    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [call]);

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        container={root}
        onClick={(e) => e.stopPropagation()}
        className="wv:flex wv:flex-col wv:gap-3 wv:max-w-md wv:p-6"
      >
        <DialogHeader>
          <DialogTitle>{t("Call diagnostics")}</DialogTitle>
          <DialogDescription className="wv:text-xs wv:font-mono">{`call: ${call.id}`}</DialogDescription>
        </DialogHeader>

        <section className="wv:flex wv:flex-col wv:gap-2">
          <h3 className="wv:text-xs wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">ICE</h3>
          <pre className="wv:text-xs wv:font-mono wv:whitespace-pre-wrap wv:break-all wv:rounded wv:bg-muted/40 wv:p-2">
            {lastIce ? JSON.stringify(lastIce, null, 2) : "—"}
          </pre>
        </section>

        <section className="wv:flex wv:flex-col wv:gap-2">
          <h3 className="wv:text-xs wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">
            {t("Recent issues")}
          </h3>
          {issues.length === 0 ? (
            <p className="wv:text-xs wv:text-muted-foreground">—</p>
          ) : (
            <ul className="wv:text-xs wv:font-mono wv:break-all wv:flex wv:flex-col wv:gap-1">
              {issues
                .slice()
                .reverse()
                .map((r, idx) => (
                  <li key={`${r.at}-${idx}`} className="wv:flex wv:gap-2">
                    <span className="wv:text-muted-foreground">{new Date(r.at).toISOString()}</span>
                    <span className="wv:text-red-500">{r.issue}</span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}
