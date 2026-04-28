"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { parsePhoneNumber } from "libphonenumber-js";
import type { DeviceState } from "@/hooks/useDeviceManager";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useShadowRoot } from "@/providers/ShadowRootProvider";
import { useSelectedDevice } from "@/providers/SelectedDeviceProvider";
import { useWavoip } from "@/providers/WavoipProvider";

function normalizePhone(raw: string): { national: string; international: string } | null {
    if (!raw) return null;
    try {
        const digits = raw.replace(/\D/g, "");
        const phone = parsePhoneNumber(`+${digits}`);
        return {
            national: phone.formatNational(),
            international: phone.formatInternational(),
        };
    } catch {
        return null;
    }
}

function getRawPhone(device: DeviceState): string | null {
    return device.contact?.official?.phone ?? device.contact?.unofficial?.phone ?? null;
}

function getDeviceLabel(device: DeviceState): string {
    const raw = getRawPhone(device);
    if (!raw) return device.token.split(":")[0];
    return normalizePhone(raw)?.international ?? raw;
}

function getDeviceTooltip(device: DeviceState): string {
    const raw = getRawPhone(device);
    if (!raw) return device.token;
    return normalizePhone(raw)?.international ?? raw;
}

function getDeviceSelectedLabel(device: DeviceState): string {
    const raw = getRawPhone(device);
    if (!raw) return device.token.split(":")[0];
    return normalizePhone(raw)?.national ?? raw;
}

function StatusDot({ status }: { status: DeviceState["status"] }) {
    const connected = status === "open";
    return (
        <span
            className={`wv:inline-block wv:shrink-0 wv:size-2 wv:rounded-full ${connected ? "wv:bg-green-500" : "wv:bg-red-500"}`}
        />
    );
}

export const DeviceSwitcher = React.forwardRef(() => {
    const { devices } = useWavoip();
    const shadowRoot = useShadowRoot();
    const { selectedToken, setSelectedToken } = useSelectedDevice();
    const selectedDevice = React.useMemo(() => {
        if (!selectedToken) return null;
        return devices.find((d) => d.token === selectedToken) ?? null;
    }, [selectedToken, devices]);

    const selectedLabel = selectedDevice ? getDeviceSelectedLabel(selectedDevice) : "Padrão";
    const activeCount = React.useMemo(() => devices.filter((d) => d.status === "open").length, [devices]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="wv:bg-transparent wv:border-0 wv:p-0 wv:outline-none">
                <div className="wv:peer/menu-button wv:flex wv:w-full wv:items-center wv:gap-2 wv:overflow-hidden wv:rounded-md wv:p-2 wv:py-0 wv:text-left wv:outline-hidden wv:ring-sidebar-ring wv:transition-[width,height,padding] wv:focus-visible:ring-2 wv:active:bg-sidebar-accent wv:active:text-sidebar-accent-foreground wv:disabled:pointer-events-none wv:disabled:opacity-50 wv:group-has-data-[sidebar=menu-action]/menu-item:pr-8 wv:aria-disabled:pointer-events-none wv:aria-disabled:opacity-50 wv:data-[active=true]:bg-sidebar-accent wv:data-[active=true]:font-medium wv:data-[active=true]:text-sidebar-accent-foreground wv:data-[state=open]:hover:bg-sidebar-accent wv:data-[state=open]:hover:text-sidebar-accent-foreground wv:group-data-[collapsible=icon]:size-8! wv:[&>svg]:size-4 wv:[&>svg]:shrink-0 wv:hover:bg-sidebar-accent wv:hover:text-sidebar-accent-foreground wv:h-6 wv:text-xs wv:group-data-[collapsible=icon]:p-0! wv:data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground wv:text-foreground wv:max-w-[140px]">
                    {selectedDevice
                        ? <StatusDot status={selectedDevice.status} />
                        : <span className="wv:inline-flex wv:items-center wv:justify-center wv:shrink-0 wv:h-3.5 wv:min-w-3.5 wv:rounded-full wv:bg-blue-500 wv:text-white wv:text-[9px] wv:font-medium wv:px-0.5">{activeCount}</span>
                    }
                    <span className="wv:truncate wv:text-xs wv:flex-1">{selectedLabel}</span>
                    <ChevronsUpDown className="wv:shrink-0 wv:size-3" />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="wv:w-(--radix-dropdown-menu-trigger-width) wv:min-w-[180px]"
                align="start"
                container={shadowRoot}
            >
                <DropdownMenuItem onSelect={() => setSelectedToken(null)}>
                    <span className="wv:flex-1">Padrão</span>
                    {selectedToken === null && <Check className="wv:ml-auto wv:shrink-0" />}
                </DropdownMenuItem>

                {devices.map((device) => (
                    <Tooltip key={device.token}>
                        <DropdownMenuItem onSelect={() => setSelectedToken(device.token)}>
                            <TooltipTrigger asChild>
                                <span className="wv:flex-1 wv:min-w-0 wv:truncate">{getDeviceLabel(device)}</span>
                            </TooltipTrigger>
                            {selectedToken === device.token && <Check className="wv:ml-1 wv:shrink-0" />}
                            <StatusDot status={device.status} />
                        </DropdownMenuItem>
                        <TooltipContent
                            side="right"
                            container={shadowRoot}
                            sideOffset={8}
                            className="wv:bg-surface wv:text-foreground wv:[&_svg]:hidden"
                        >
                            {getDeviceTooltip(device)}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});
