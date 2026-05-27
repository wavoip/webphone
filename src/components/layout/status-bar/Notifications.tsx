import { BellIcon, CheckCircleIcon, PhoneIncomingIcon, PhoneXIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { relativeTimePt } from "@/lib/relative-time";
import type { Notification } from "@/middleware/store/slices/notificationsSlice";
import { useNotificationManager } from "@/providers/NotificationsProvider";

const TYPE_LABEL: Record<Notification["type"], string> = {
  MISSED_CALL: "Chamada perdida",
  CALL_FAILED: "Ligação falhou",
  INFO: "Aviso",
  DEVICE_RESTRICTED: "Dispositivo restrito",
  DEVICE_RESTRICTION_LIFTED: "Restrição removida",
};

function TypeIcon({ type }: { type: Notification["type"] }) {
  if (type === "MISSED_CALL") return <PhoneIncomingIcon size={14} weight="fill" />;
  if (type === "CALL_FAILED") return <PhoneXIcon size={14} weight="fill" />;
  if (type === "DEVICE_RESTRICTED") return <WarningIcon size={14} weight="fill" />;
  if (type === "DEVICE_RESTRICTION_LIFTED") return <CheckCircleIcon size={14} weight="fill" />;
  return <BellIcon size={14} weight="fill" />;
}

function buildSecondary(n: Notification): string {
  if (n.type === "MISSED_CALL") {
    if (n.detail && n.detail !== n.message) return `${n.message} · ${n.detail}`;
    return n.message;
  }
  return n.message;
}

export function Notifications() {
  const { notifications, readNotifications, clearNotifications, removeNotification } = useNotificationManager();

  const visible = useMemo(
    () => notifications.filter((n) => !n.isHidden).sort((a, b) => Number(a.isRead) - Number(b.isRead)),
    [notifications],
  );
  const unreadCount = useMemo(() => visible.filter((n) => !n.isRead).length, [visible]);
  const hasAny = visible.length > 0;

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Notificações"
        className="wv:relative wv:hover:cursor-pointer wv:hover:bg-accent wv:text-foreground wv:hover:text-foreground wv:rounded-full wv:size-fit wv:aspect-square wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:p-1 wv:max-sm:p-2"
        onClick={() => readNotifications()}
      >
        <BellIcon className="wv:max-sm:size-6 wv:max-sm:text-blue wv:pointer-events-none" />
        {unreadCount > 0 && (
          <Badge
            className="wv:absolute wv:bottom-0 wv:right-[-5px] wv:h-3 wv:w-3 wv:rounded-full wv:px-[1px] wv:bg-[red] wv:text-[8px]"
            variant="destructive"
          >
            {unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className="wv:flex wv:flex-col wv:max-h-[320px] wv:w-[320px] wv:overflow-y-auto wv:p-0">
        {!hasAny && <p className="wv:text-center wv:py-6 wv:text-xs wv:text-foreground/60">Nenhuma notificação</p>}

        {hasAny && (
          <ul className="wv:flex wv:flex-col wv:divide-y wv:divide-foreground/10">
            {visible.map((n) => (
              <li
                key={`notification_${n.id.getTime()}`}
                data-notification-id={n.id.getTime()}
                className="wv:flex wv:flex-row wv:items-start wv:gap-2 wv:px-2 wv:py-1.5 wv:hover:bg-foreground/5"
              >
                <span className="wv:flex wv:items-center wv:justify-center wv:size-6 wv:rounded-full wv:bg-foreground/10 wv:text-foreground wv:shrink-0 wv:mt-0.5">
                  <TypeIcon type={n.type} />
                </span>

                <div className="wv:flex wv:flex-col wv:flex-grow wv:min-w-0">
                  <div className="wv:flex wv:items-center wv:gap-1.5">
                    {!n.isRead && (
                      <output
                        aria-label="não lida"
                        className="wv:size-1.5 wv:rounded-full wv:bg-blue-500 wv:shrink-0"
                      />
                    )}
                    <p className="wv:text-[12px] wv:font-medium wv:leading-tight wv:text-foreground wv:truncate">
                      {TYPE_LABEL[n.type]}
                    </p>
                  </div>
                  <p className="wv:text-[11px] wv:leading-tight wv:text-foreground/60 wv:truncate">
                    {buildSecondary(n)}
                  </p>
                </div>

                <div className="wv:flex wv:items-center wv:gap-1 wv:shrink-0">
                  <span className="wv:text-[10px] wv:text-foreground/50 wv:whitespace-nowrap">
                    {relativeTimePt(n.created_at)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Remover notificação"
                    className="wv:p-0 wv:size-4 wv:rounded-full wv:hover:bg-foreground/10 wv:text-foreground/60"
                    onClick={() => removeNotification(n.id)}
                  >
                    <XIcon size={10} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {hasAny && (
          <div className="wv:flex wv:justify-end wv:border-t wv:border-foreground/10 wv:px-2 wv:py-1">
            <Button
              variant="link"
              onClick={clearNotifications}
              className="wv:text-[11px] wv:select-none wv:p-0 wv:h-auto"
            >
              Limpar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
