"use client";

import { Database, Key, Table, BarChart3, Home, Folder } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/shadcn/components/ui/sidebar";

const navigation = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", icon: Home, id: "dashboard" },
      { title: "Analytics", icon: BarChart3, id: "analytics" },
    ],
  },
  {
    title: "Database",
    items: [
      { title: "Redis Keys", icon: Key, id: "redis-keys" },
      { title: "Postgres Tables", icon: Table, id: "postgres-tables" },
      { title: "Music Files", icon: Folder, id: "files" },
    ],
  },
];

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Database className="h-6 w-6" />
          <span className="font-semibold">DB Manager</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeView === item.id}
                      onClick={() => onViewChange(item.id)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
