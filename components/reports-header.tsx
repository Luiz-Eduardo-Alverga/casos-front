"use client";

import { Menu, Bell, Moon, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDropDown } from "@/components/user-dropdown";
import { useSidebar } from "@/components/sidebar-provider";

export function ReportsHeader() {
  const { toggleSidebar, isCollapsed } = useSidebar();

  return (
    <header 
      className="fixed bg-white border-b border-border top-0 z-30 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] transition-all duration-300"
      style={{
        left: isCollapsed ? "64px" : "256px",
        right: "0",
        width: `calc(100% - ${isCollapsed ? "64px" : "256px"})`
      }}
    >
      <div className="flex items-center justify-between px-6 h-[60px] w-full">
        {/* Menu Hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-muted"
          onClick={toggleSidebar}
        >
          <Menu className="h-[18px] w-[15.75px] text-foreground" />
        </Button>

        {/* Right side - Icons and User */}
        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-muted relative"
          >
            <Bell className="h-[18px] w-[15.75px] text-foreground" />
            <span className="absolute top-[-2.75px] right-[-4px] w-2 h-2 bg-destructive rounded-full border-2 border-white" />
          </Button>

          {/* Moon Icon (Dark Mode) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-muted"
          >
            <Moon className="h-[18px] w-[13.5px] text-foreground" />
          </Button>

          {/* Maximize Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-muted"
          >
            <Maximize2 className="h-[18px] w-[15.75px] text-foreground" />
          </Button>

          {/* Vertical Divider */}
          <div className="h-8 w-px bg-border-input" />

          {/* User Dropdown */}
          <UserDropDown />
        </div>
      </div>
    </header>
  );
}
