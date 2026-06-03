"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  isMobile?: boolean;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      isCollapsed = false,
      isMobileOpen = false,
      isMobile = false,
      ...props
    },
    ref,
  ) => (
    <aside
      ref={ref}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-primary border-r border-sidebar-border",
        isMobile
          ? isMobileOpen
            ? "w-[256px] translate-x-0"
            : "-translate-x-full"
          : isCollapsed
            ? "w-[64px]"
            : "w-[256px]",
        className,
      )}
      {...props}
    />
  ),
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center border-b border-sidebar-border h-[64px] px-6",
      className,
    )}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col flex-1 overflow-y-auto", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
));
SidebarSection.displayName = "SidebarSection";

const SidebarNav = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn("flex flex-col gap-1 px-2", className)}
    {...props}
  />
));
SidebarNav.displayName = "SidebarNav";

const SidebarSectionLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "px-3 pt-6 pb-2 text-[10px] font-bold uppercase tracking-[1px] text-sidebar-section-label",
      className,
    )}
    {...props}
  />
));
SidebarSectionLabel.displayName = "SidebarSectionLabel";

const sidebarNavItemStyles = (isActive: boolean) =>
  cn(
    "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
    isActive
      ? "bg-white/5 border-l-[3px] border-brand-yellow text-white font-medium"
      : "text-sidebar-text-muted hover:bg-white/5 font-normal",
  );

const SidebarNavItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive?: boolean;
  }
>(({ className, isActive = false, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(sidebarNavItemStyles(isActive), className)}
    {...props}
  />
));
SidebarNavItem.displayName = "SidebarNavItem";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSection,
  SidebarNav,
  SidebarSectionLabel,
  SidebarNavItem,
  sidebarNavItemStyles,
};
