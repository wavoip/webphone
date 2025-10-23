import { Bell, PhoneOutgoing, X, XIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useNotificationManager } from "@/providers/NotificationsProvider";

// @ts-ignore
import "moment/dist/locale/pt-br";
import moment from "moment";

export function Notifications() {
  const [items, setItems] = useState(3);

  const { notifications, readNotifications, clearNotifications, removeNotification } = useNotificationManager();

  const handleSeeMore = () => {
    setItems(items + 5);
  }

  // console.log(fr1, "fr1")
  const hasNotification = notifications.filter(notification => !notification.isHidden).length > 0;

  const notificationsToRead = useMemo(() => {
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  return (
    <Popover>
      <PopoverTrigger className="wv:relative wv:hover:cursor-pointer wv:hover:bg-accent  wv:hover:text-foreground wv:p-0.5 wv:rounded-md wv:size-fit wv:aspect-square" onClick={() => {
        readNotifications();
      }}>

        <Bell />
        {notificationsToRead > 0 && (
          <Badge
            className="wv:absolute wv:bottom-0 wv:right-[-5px] wv:h-3 wv:w-3 wv:rounded-full wv:px-[1px] wv:bg-[red] wv:text-[8px]"
            variant="destructive"
          >
            {notificationsToRead}
          </Badge>
        )}
        {/* <Button
          type="button"
          variant={"ghost"}
          className="wv:flex wv:justify-center wv:relative wv:size-fit wv:!p-0.5 wv:aspect-square"
          onClick={() => close()}
        >
          

        </Button> */}

      </PopoverTrigger>
      <PopoverContent className="wv:flex wv:flex-col wv:max-h-[200px] wv:w-[300px] wv:overflow-y-scroll wv:p-2">
        <div className="wv:flex wv:flex-col">
          {notifications.slice(0, items).map((notification, key) => (
            <div
              className={`${notification.isHidden ? " notification exit" : "wv:flex notification"}  wv:flex-col wv:p-1 wv:gap-2`}
              key={key}
            >
              <div className="wv:flex wv:flex-row wv:gap-2 wv:full">
                <div className="wv:relative wv:flex wv:flex-row wv:w-8 wv:h-8 wv:justify-center wv:items-center wv:bg-[#00000010] wv:rounded-full ">
                  <PhoneOutgoing size={15} />
                  <Badge
                    className="wv:absolute wv:bottom-0 wv:right-0 wv:h-3 wv:w-3 wv:rounded-full wv:px-[1px] wv:bg-red-400"
                    variant="destructive"
                  >
                    <X size={20} />
                  </Badge>
                </div>

                <div className="wv:flex wv:flex-col wv:flex-grow wv:gap-1">
                  {notification.type === "CALL_FAILED" && (
                    <p className="wv:text-[14px] wv:leading-none">Ligação falhou</p>
                  )}

                  <p className="wv:text-[10px] wv:truncate wv:max-w-[100px]">{notification.token}</p>
                </div>

                <div className="wv:flex wv:flex-row wv:justify-start wv:items-start">
                  <div className="wv:flex wv:flex-row wv:justify-center wv:items-center wv:gap-1">
                    {!notification.isRead && (<Badge
                      className={`${notification.isRead ? " notificationView exit" : "wv:flex notificationView "}  wv:h-2 wv:w-2 wv:rounded-full wv:px-[1px] wv:bg-blue-500`}
                      variant="destructive"
                    />)}

                    <p className="wv:text-[12px] wv:opacity-90 wv:truncate wv:max-w-[100px]">{moment(notification.created_at).locale("pt-br").fromNow()}</p>
                    <Button
                      type="button"
                      variant={"ghost"}
                      className=" wv:[&_svg:not([class*=size-])]:size-2  wv:!p-0.5 wv:aspect-square wv:w-4 wv:h-4"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <XIcon size={2} />
                    </Button>
                  </div>

                </div>

              </div>

              <div className="wv:flex wv:flex-col">
                <p className="wv:text-[12px] wv:opacity-50 wv:break-all ">{notification.detail}</p>
                <p className="wv:text-[12px] wv:opacity-50 wv:break-all ">{notification.message}</p>
              </div>
            </div>

          ))
          }

          {!hasNotification && (
            <p className="wv:text-center wv:pt-2">Nenhuma notificação</p>
          )}

          <div className="wv:flex wv:gap-2 wv:justify-center wv:items-center">
            <Button variant="link" className="wv:text-[blue] wv:text-[12px] wv:select-none wv:p-1" disabled={items >= notifications.length}>
              <p onClick={handleSeeMore} >Ver mais</p>
            </Button>
            <Button variant="link" className="wv:text-[blue] wv:text-[12px] wv:select-none wv:p-1" disabled={!hasNotification}>
              <p onClick={clearNotifications}>Limpar</p>
            </Button>

          </div>
        </div>

      </PopoverContent>
    </Popover>
  );
}
