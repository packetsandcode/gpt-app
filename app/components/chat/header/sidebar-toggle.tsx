'use client';

import { ComponentProps, memo } from "react";
import { SidebarLeftIcon } from "../../common/icons";
import { Button } from "../../common/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../common/tooltip";
import { useSidebar, type SidebarTrigger } from "../../common/sidebar";

function PureSidebarToggle({ }: ComponentProps<typeof SidebarTrigger>) {
    const { toggleSidebar } = useSidebar();
    return (
        <div className="">
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            data-testid="sidebar-toggle-button"
                            onClick={toggleSidebar}
                            variant="outline"
                            className="md:px-2 md:h-fit border border-zinc-400">
                            <SidebarLeftIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent align="start">Toogle Sidebar</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
export const SidebarToggle = memo(PureSidebarToggle, () => {
    return true;
})