import { fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Notifications } from "@/components/layout/status-bar/Notifications";
import type { Notification } from "@/middleware/store/slices/notificationsSlice";
import { renderWithProviders, resetPublicApiBetweenTests } from "@/middleware/testing/renderWithMiddleware";

async function seed(notifications: Notification[]) {
  const result = await renderWithProviders({ children: <Notifications /> });
  result.api.notifications.clear();
  for (const n of notifications) result.api.notifications.add(n);
  return result;
}

function makeMissed(id: number, displayName = "Maria", phone = "5511999999999"): Notification {
  return {
    id: new Date(id),
    type: "MISSED_CALL",
    created_at: new Date(id),
    message: displayName,
    detail: phone,
    token: "tok-abc",
    isHidden: false,
    isRead: false,
  };
}

function makeFailed(id: number, error = "Número não atende"): Notification {
  return {
    id: new Date(id),
    type: "CALL_FAILED",
    created_at: new Date(id),
    message: error,
    detail: "5511888888888",
    token: "tok-xyz",
    isHidden: false,
    isRead: false,
  };
}

async function openPopover() {
  const trigger = await screen.findByRole("button", { name: /notificações/i });
  fireEvent.click(trigger);
}

describe("Notifications popover — compact redesign", () => {
  beforeEach(() => {
    resetPublicApiBetweenTests();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("shows empty state when there are no notifications", async () => {
    await seed([]);
    await openPopover();
    expect(screen.getByText("Nenhuma notificação")).toBeTruthy();
  });

  it("renders 'Chamada perdida' label for MISSED_CALL entries", async () => {
    await seed([makeMissed(1)]);
    await openPopover();
    expect(screen.getByText("Chamada perdida")).toBeTruthy();
  });

  it("renders 'Ligação falhou' label for CALL_FAILED entries", async () => {
    await seed([makeFailed(1)]);
    await openPopover();
    expect(screen.getByText("Ligação falhou")).toBeTruthy();
  });

  it("shows peer name on MISSED_CALL secondary line", async () => {
    await seed([makeMissed(1, "Maria José", "5511999999999")]);
    await openPopover();
    expect(screen.getByText(/Maria José/)).toBeTruthy();
  });

  it("shows the error message on CALL_FAILED secondary line", async () => {
    await seed([makeFailed(1, "Caixa postal cheia")]);
    await openPopover();
    expect(screen.getByText("Caixa postal cheia")).toBeTruthy();
  });

  it("does not show the device token as primary content", async () => {
    await seed([makeMissed(1, "Maria", "5511999999999")]);
    await openPopover();
    expect(screen.queryByText("tok-abc")).toBeNull();
  });

  it("renders all entries (no item-count limit) when there are 4+", async () => {
    await seed([makeMissed(1), makeMissed(2), makeMissed(3), makeMissed(4)]);
    await openPopover();
    expect(screen.getAllByText("Chamada perdida")).toHaveLength(4);
  });

  it("removes a notification when its close button is clicked", async () => {
    const { api } = await seed([makeMissed(1, "Maria"), makeMissed(2, "João")]);
    await openPopover();
    const mariaRow = screen.getByText(/Maria/).closest("[data-notification-id]");
    if (!mariaRow) throw new Error("expected row to be found");
    const closeBtn = within(mariaRow as HTMLElement).getByRole("button", { name: /remover/i });
    fireEvent.click(closeBtn);
    const remaining = api.notifications.get().map((n) => n.message);
    expect(remaining).toEqual(["João"]);
  });

  it("'Limpar' clears all notifications", async () => {
    const { api } = await seed([makeMissed(1), makeMissed(2)]);
    await openPopover();
    fireEvent.click(screen.getByRole("button", { name: /limpar/i }));
    expect(api.notifications.get()).toEqual([]);
  });

  it("sorts unread before read", async () => {
    const read = { ...makeMissed(1, "Read"), isRead: true };
    const unread = makeMissed(2, "Unread");
    await seed([read, unread]);
    await openPopover();
    const rows = document.querySelectorAll("[data-notification-id]");
    expect(rows[0]?.textContent).toContain("Unread");
    expect(rows[1]?.textContent).toContain("Read");
  });
});
