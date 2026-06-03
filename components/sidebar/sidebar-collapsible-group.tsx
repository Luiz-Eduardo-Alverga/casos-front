"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarNavItem, sidebarNavItemStyles } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface SidebarSubitem {
  label: string;
  href: string;
  exact?: boolean;
}

function isHrefActive(pathname: string | null, href: string, exact?: boolean) {
  if (!pathname) return false;
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarCollapsibleGroupProps {
  isCollapsed: boolean;
  pathname: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collapsedHref: string;
  label: string;
  icon: LucideIcon;
  subitems: SidebarSubitem[];
  titleWhenCollapsed?: string;
}

export function SidebarCollapsibleGroup({
  isCollapsed,
  pathname,
  open,
  onOpenChange,
  collapsedHref,
  label,
  icon: Icon,
  subitems,
  titleWhenCollapsed,
}: SidebarCollapsibleGroupProps) {
  if (subitems.length === 0) return null;
  const groupActive = subitems.some((s) =>
    isHrefActive(pathname, s.href, s.exact),
  );

  if (isCollapsed) {
    return (
      <Link
        href={collapsedHref}
        className="block w-full"
        title={titleWhenCollapsed ?? label}
      >
        <SidebarNavItem
          isActive={groupActive}
          className="w-full justify-center"
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
        </SidebarNavItem>
      </Link>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            sidebarNavItemStyles(groupActive),
            "justify-between",
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-2.5 w-2.5 shrink-0 opacity-70 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-0.5 pl-2 pt-1 pb-1">
        {subitems.map((sub) => {
          const subActive = isHrefActive(pathname, sub.href, sub.exact);
          return (
            <Link key={sub.href} href={sub.href} className="block w-full">
              <span
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg py-2 pl-9 pr-3 text-sm transition-colors",
                  subActive
                    ? "bg-white/5 font-medium border-l-[3px] border-brand-yellow text-white ml-[-3px]"
                    : "text-sidebar-text-muted hover:bg-white/5",
                )}
              >
                {sub.label}
              </span>
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
