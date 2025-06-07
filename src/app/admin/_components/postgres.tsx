"use client";

import { Eye } from "lucide-react";
import { Button } from "~/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shadcn/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/components/ui/dialog";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shadcn/components/ui/table";

const mockTables = [
  {
    name: "users",
    rows: 1247,
    size: "2.3 MB",
    data: [
      {
        id: 1,
        email: "john@example.com",
        name: "John Doe",
        created_at: "2024-01-15 10:30:00",
      },
      {
        id: 2,
        email: "jane@example.com",
        name: "Jane Smith",
        created_at: "2024-01-16 14:22:00",
      },
      {
        id: 3,
        email: "bob@example.com",
        name: "Bob Johnson",
        created_at: "2024-01-17 09:15:00",
      },
      {
        id: 1,
        email: "john@example.com",
        name: "John Doe",
        created_at: "2024-01-15 10:30:00",
      },
      {
        id: 2,
        email: "jane@example.com",
        name: "Jane Smith",
        created_at: "2024-01-16 14:22:00",
      },
      {
        id: 3,
        email: "bob@example.com",
        name: "Bob Johnson",
        created_at: "2024-01-17 09:15:00",
      },
      {
        id: 1,
        email: "john@example.com",
        name: "John Doe",
        created_at: "2024-01-15 10:30:00",
      },
      {
        id: 2,
        email: "jane@example.com",
        name: "Jane Smith",
        created_at: "2024-01-16 14:22:00",
      },
      {
        id: 3,
        email: "bob@example.com",
        name: "Bob Johnson",
        created_at: "2024-01-17 09:15:00",
      },
      {
        id: 1,
        email: "john@example.com",
        name: "John Doe",
        created_at: "2024-01-15 10:30:00",
      },
      {
        id: 2,
        email: "jane@example.com",
        name: "Jane Smith",
        created_at: "2024-01-16 14:22:00",
      },
      {
        id: 3,
        email: "bob@example.com",
        name: "Bob Johnson",
        created_at: "2024-01-17 09:15:00",
      },
      {
        id: 1,
        email: "john@example.com",
        name: "John Doe",
        created_at: "2024-01-15 10:30:00",
      },
      {
        id: 2,
        email: "jane@example.com",
        name: "Jane Smith",
        created_at: "2024-01-16 14:22:00",
      },
      {
        id: 3,
        email: "bob@example.com",
        name: "Bob Johnson",
        created_at: "2024-01-17 09:15:00",
      },
      {
        id: 1,
        email: "john@example.com",
        name: "John Doe",
        created_at: "2024-01-15 10:30:00",
      },
      {
        id: 2,
        email: "jane@example.com",
        name: "Jane Smith",
        created_at: "2024-01-16 14:22:00",
      },
      {
        id: 3,
        email: "bob@example.com",
        name: "Bob Johnson",
        created_at: "2024-01-17 09:15:00",
      },
    ],
  },
];

export function PostgresTables() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">PostgreSQL Tables</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockTables.map((table) => (
          <Card key={table.name} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{table.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[840px] max-w-4xl overflow-scroll">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <h1 className="text-2xl">{table.name}</h1>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <UITable>
                            <TableHeader>
                              <TableRow>
                                {Object.keys(table.data[0] || {}).map((key) => (
                                  <TableHead key={key}>{key}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {table.data.map((row, index) => (
                                <TableRow key={index}>
                                  {Object.keys(row).map((key) => (
                                    // @ts-ignore
                                    <TableCell key={key}>{row[key]}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </UITable>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rows:</span>
                  <span className="font-medium">
                    {table.rows.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{table.size}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
