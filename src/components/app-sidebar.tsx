"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain, NavMainItemProps } from "./nav-main";

export function AppSidebar({
  items,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  items: NavMainItemProps[];
}) {
  return (
    <Sidebar collapsible="icon" className="z-[101]" {...props}>
      <SidebarHeader className="mt-2">
        <img className="w-[80%]" src="/logo.svg" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
