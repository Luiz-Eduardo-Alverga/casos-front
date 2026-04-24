"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarNavItem } from "@/components/ui/sidebar";
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
            "flex w-full items-center justify-between gap-3 px-4 py-3 rounded text-sm font-normal transition-colors",
            groupActive
              ? "bg-white/5 border-l-[3px] border-[#F8D33E] text-sidebar-text"
              : "text-sidebar-text hover:bg-white/5",
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 opacity-70 transition-transform",
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
                  "flex w-full items-center gap-3 px-4 py-2.5 pl-8 rounded text-sm transition-colors",
                  subActive
                    ? "bg-white/5 text-sidebar-text font-medium border-l-[3px] border-[#F8D33E] ml-[-3px]"
                    : "text-sidebar-text/90 hover:bg-white/5",
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
