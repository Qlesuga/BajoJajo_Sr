"use client";

import { Music, Key, Table, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shadcn/components/ui/card";

const stats = [
  {
    title: "Redis Keys",
    value: "1,247",
    icon: Key,
  },
  {
    title: "PostgreSQL Tables",
    value: "23",
    icon: Table,
  },
  {
    title: "Music Files",
    value: "50",
    icon: Music,
  },
  {
    title: "Users Amount",
    value: "3",
    icon: Users,
  },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
