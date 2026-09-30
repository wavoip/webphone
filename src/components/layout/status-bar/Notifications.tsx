import { createMemo, For, Show } from "solid-js";
import { Bell, CheckCircle, PhoneIncoming, PhoneX, Warning, X } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { t } from "@/lib/i18n";
import { useNotificationManager } from "@/lib/notifications";
import { relativeTime } from "@/lib/relative-time";
import type { Notification } from "@/middleware/store/slices/notificationsSlice";

const typeLabel = (type: Notification["type"]): string => {
  if (type === "MISSED_CALL") return t("Missed call");
  if (type === "CALL_FAILED") return t("Call failed");
  if (type === "DEVICE_RESTRICTED") return t("Device restricted");
  if (type === "DEVICE_RESTRICTION_LIFTED") return t("Restriction lifted");
  return t("Notice");
};

function TypeIcon(props: { type: Notification["type"] }) {
  const type = props.type;
  if (type === "MISSED_CALL") return <PhoneIncoming size={14} />;
  if (type === "CALL_FAILED") return <PhoneX size={14} />;
  if (type === "DEVICE_RESTRICTED") return <Warning size={14} />;
  if (type === "DEVICE_RESTRICTION_LIFTED") return <CheckCircle size={14} />;
  return <Bell size={14} />;
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

  // `filter` já devolve array novo, então ordenar aqui não encosta no estado.
  const visible = createMemo(() =>
    notifications()
      .filter((n) => !n.isHidden)
      .sort((a, b) => Number(a.isRead) - Number(b.isRead)),
  );
  const unreadCount = createMemo(() => visible().filter((n) => !n.isRead).length);

  return (
    <Popover>
      <PopoverTrigger
        aria-label={t("Notifications")}
        class="wv:relative wv:hover:cursor-pointer wv:hover:bg-accent wv:text-foreground wv:hover:text-foreground wv:rounded-full wv:size-fit wv:aspect-square wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:p-1 wv:max-sm:p-2"
        onClick={() => readNotifications()}
      >
        <Bell class="wv:max-sm:size-6 wv:max-sm:text-blue wv:pointer-events-none" />
        <Show when={unreadCount() > 0}>
          <Badge
            class="wv:absolute wv:bottom-0 wv:right-[-5px] wv:h-3 wv:w-3 wv:rounded-full wv:px-[1px] wv:bg-[red] wv:text-[8px]"
            variant="destructive"
          >
            {unreadCount()}
          </Badge>
        </Show>
      </PopoverTrigger>
      <PopoverContent class="wv:flex wv:flex-col wv:max-h-[320px] wv:w-[320px] wv:overflow-y-auto wv:p-0">
        <Show
          when={visible().length > 0}
          fallback={<p class="wv:text-center wv:py-6 wv:text-xs wv:text-foreground/60">{t("No notifications")}</p>}
        >
          <ul class="wv:flex wv:flex-col wv:divide-y wv:divide-foreground/10">
            <For each={visible()}>
              {(n) => (
                <li
                  data-notification-id={n.id}
                  class="wv:flex wv:flex-row wv:items-start wv:gap-2 wv:px-2 wv:py-1.5 wv:hover:bg-foreground/5"
                >
                  <span class="wv:flex wv:items-center wv:justify-center wv:size-6 wv:rounded-full wv:bg-foreground/10 wv:text-foreground wv:shrink-0 wv:mt-0.5">
                    <TypeIcon type={n.type} />
                  </span>

                  <div class="wv:flex wv:flex-col wv:flex-grow wv:min-w-0">
                    <div class="wv:flex wv:items-center wv:gap-1.5">
                      <Show when={!n.isRead}>
                        <output
                          aria-label={t("Unread")}
                          class="wv:size-1.5 wv:rounded-full wv:bg-blue-500 wv:shrink-0"
                        />
                      </Show>
                      <p class="wv:text-[12px] wv:font-medium wv:leading-tight wv:text-foreground wv:truncate">
                        {typeLabel(n.type)}
                      </p>
                    </div>
                    <p class="wv:text-[12px] wv:leading-tight wv:text-foreground/60 wv:truncate">{buildSecondary(n)}</p>
                  </div>

                  <div class="wv:flex wv:items-center wv:gap-1 wv:shrink-0">
                    <span class="wv:text-[12px] wv:text-foreground/50 wv:whitespace-nowrap">
                      {relativeTime(n.created_at)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label={t("Remove notification")}
                      class="wv:p-0 wv:size-4 wv:rounded-full wv:hover:bg-foreground/10 wv:text-foreground/60"
                      onClick={() => removeNotification(n.id)}
                    >
                      <X size={10} />
                    </Button>
                  </div>
                </li>
              )}
            </For>
          </ul>

          <div class="wv:flex wv:justify-end wv:border-t wv:border-foreground/10 wv:px-2 wv:py-1">
            <Button variant="link" onClick={clearNotifications} class="wv:text-[12px] wv:select-none wv:p-0 wv:h-auto">
              {t("Clear")}
            </Button>
          </div>
        </Show>
      </PopoverContent>
    </Popover>
  );
}
