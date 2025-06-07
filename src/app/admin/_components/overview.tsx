"use client";

import { Music, Key, Table, Users } from "lucide-react";
import { Button } from "~/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shadcn/components/ui/card";
import { api } from "~/trpc/react";

const stats = [
  {
    title: "Redis Keys",
    key: "redisKeys",
    icon: Key,
  },
  {
    title: "PostgreSQL Row Count",
    key: "postgresRowCount",
    icon: Table,
  },
  {
    title: "Music Files",
    key: "filesCount",
    icon: Music,
  },
  {
    title: "Users Amount",
    key: "usersCount",
    icon: Users,
  },
];

export function DashboardOverview() {
  const { data, isLoading, refetch } = api.admin.getOverviewData.useQuery();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button
          onClick={() => {
            refetch().catch((error) => {
              console.error("Failed to refetch data:", error);
            });
          }}
        >
          Refetch
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? "loading"
          : !data
            ? "ups"
            : stats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {/*@ts-ignore*/}
                    <div className="text-2xl font-bold">{data[stat.key]}</div>
                  </CardContent>
                </Card>
              ))}
      </div>
    </div>
  );
}
