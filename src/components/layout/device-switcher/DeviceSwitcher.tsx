"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useShadowRoot } from "@/providers/ShadowRootProvider";

export const DeviceSwitcher = React.forwardRef(() => {
    const versions = ["Padrão", "+55 (11) 97395-1769", "(11) 97395-1769"];
    const defaultVersion = versions[0];

    const [selectedVersion, setSelectedVersion] = React.useState(defaultVersion);
    const shadowRoot = useShadowRoot();

    return (

        <DropdownMenu>
            <DropdownMenuTrigger>
                <div
                    className="wv:peer/menu-button wv:flex wv:w-full wv:items-center wv:gap-2 wv:overflow-hidden wv:rounded-md wv:p-2 wv:py-0 wv:text-left wv:outline-hidden wv:ring-sidebar-ring wv:transition-[width,height,padding] wv:focus-visible:ring-2 wv:active:bg-sidebar-accent wv:active:text-sidebar-accent-foreground wv:disabled:pointer-events-none wv:disabled:opacity-50 wv:group-has-data-[sidebar=menu-action]/menu-item:pr-8 wv:aria-disabled:pointer-events-none wv:aria-disabled:opacity-50 wv:data-[active=true]:bg-sidebar-accent wv:data-[active=true]:font-medium wv:data-[active=true]:text-sidebar-accent-foreground wv:data-[state=open]:hover:bg-sidebar-accent wv:data-[state=open]:hover:text-sidebar-accent-foreground wv:group-data-[collapsible=icon]:size-8! wv:[&>span:last-child]:truncate wv:[&>svg]:size-4 wv:[&>svg]:shrink-0 wv:hover:bg-sidebar-accent wv:hover:text-sidebar-accent-foreground wv:h-8 wv:text-sm wv:group-data-[collapsible=icon]:p-0! wv:data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground wv:text-foreground"
                >
                    {/* <div className="wv:bg-sidebar-primary wv:text-sidebar-primary-foreground wv:flex wv:aspect-square wv:size-8 wv:items-center wv:justify-center wv:rounded-lg">
                        <GalleryVerticalEnd className="wv:size-4" />
                    </div> */}
                    <div className="wv:flex wv:flex-col wv:gap-0.5 wv:leading-none">
                        {/* <span className="wv:font-medium">Documentation</span> */}
                        <span className="wv:text-base">{selectedVersion}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="wv:w-(--radix-dropdown-menu-trigger-width)" align="start" container={shadowRoot}>
                {versions.map((version) => (
                    <DropdownMenuItem key={version} onSelect={() => setSelectedVersion(version)}>
                        {version} {version === selectedVersion && <Check className="wv:ml-auto" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>

    );
});
