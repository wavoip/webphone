import { t } from "@/lib/i18n";

export function AboutTab() {
  return (
    <div className="wv:flex wv:flex-col wv:gap-3 wv:text-foreground">
      <Row label={t("Webphone version")} value={`v${__WEBPHONE_VERSION__}`} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="wv:flex wv:items-center wv:justify-between wv:gap-3 wv:py-2 wv:border-b wv:border-foreground/10">
      <span className="wv:text-sm wv:text-foreground/60">{label}</span>
      <span className="wv:text-sm wv:text-foreground">{value}</span>
    </div>
  );
}
