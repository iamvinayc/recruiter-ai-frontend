"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";

export interface NavMainItemProps {
  title: string;
  link: string;
  icon?: ReactElement;
  isActive?: boolean;
}
export function NavMain({ items }: { items: NavMainItemProps[] }) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu className="gap-y-2">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={pathname == item.link}
              asChild
              tooltip={item.title}
            >
              <Link to={item.link}>
                {item.icon && item.icon}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
