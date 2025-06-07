"use client";

import { useState } from "react";
import { AppSidebar } from "./sidebar";
import { DashboardOverview } from "./overview";
import { RedisKeys } from "./redis";
import { PostgresTables } from "./postgres";
import { SidebarInset, SidebarProvider } from "~/shadcn/components/ui/sidebar";

export default function DatabaseDashboard() {
  const [activeView, setActiveView] = useState("dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardOverview />;
      case "redis-keys":
        return <RedisKeys />;
      case "postgres-tables":
        return <PostgresTables />;
      case "analytics":
        return (
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">soon tf tf</p>
          </div>
        );
      case "files":
        return (
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">soon tf tf</p>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4">
          <div className="min-h-[100vh] flex-1 bg-muted/50 p-6 md:min-h-min">
            {renderContent()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
