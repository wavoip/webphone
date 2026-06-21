/**
 * Browser-level wrapper around the `Notification` constructor used by
 * {@link offerNotificationEffect}. Tracks open notifications by tag so the
 * effect can replace or close them deterministically. Tests inject a fake
 * notifier that records calls instead.
 */

export type NotifyArgs = {
  tag: string;
  title: string;
  body: string;
  icon?: string;
  onClick?: () => void;
};

export type BrowserNotifier = {
  notify: (args: NotifyArgs) => void;
  close: (tag?: string) => void;
  permission: () => NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
};

const DEFAULT_PERMISSION: NotificationPermission = "default";

export function domNotifier(): BrowserNotifier {
  const open = new Map<string, Notification>();

  const isSupported = () => typeof Notification !== "undefined";

  return {
    notify(args) {
      if (!isSupported() || Notification.permission !== "granted") return;
      open.get(args.tag)?.close();
      const n = new Notification(args.title, {
        body: args.body,
        icon: args.icon,
        tag: args.tag,
        requireInteraction: true,
      });
      n.onclick = () => {
        try {
          window.focus();
          args.onClick?.();
        } finally {
          n.close();
        }
      };
      n.onclose = () => {
        if (open.get(args.tag) === n) open.delete(args.tag);
      };
      open.set(args.tag, n);
    },
    close(tag) {
      if (tag === undefined) {
        for (const n of open.values()) n.close();
        open.clear();
        return;
      }
      open.get(tag)?.close();
      open.delete(tag);
    },
    permission: () => (isSupported() ? Notification.permission : DEFAULT_PERMISSION),
    requestPermission: async () => {
      if (!isSupported()) return DEFAULT_PERMISSION;
      return Notification.requestPermission();
    },
  };
}
