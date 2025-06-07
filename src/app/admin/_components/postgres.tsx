"use client";

import { useState } from "react";
import { Eye, Plus, Trash2, Users, ShoppingCart, Package } from "lucide-react";
import { Button } from "~/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shadcn/components/ui/card";
import { Badge } from "~/shadcn/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
    icon: Users,
    rows: 1247,
    size: "2.3 MB",
    columns: [
      { name: "id", type: "integer", nullable: false, primary: true },
      { name: "email", type: "varchar(255)", nullable: false, primary: false },
      { name: "name", type: "varchar(100)", nullable: true, primary: false },
      {
        name: "created_at",
        type: "timestamp",
        nullable: false,
        primary: false,
      },
    ],
    sampleData: [
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
  {
    name: "orders",
    icon: ShoppingCart,
    rows: 3891,
    size: "5.7 MB",
    columns: [
      { name: "id", type: "integer", nullable: false, primary: true },
      { name: "user_id", type: "integer", nullable: false, primary: false },
      { name: "total", type: "decimal(10,2)", nullable: false, primary: false },
      { name: "status", type: "varchar(50)", nullable: false, primary: false },
      {
        name: "created_at",
        type: "timestamp",
        nullable: false,
        primary: false,
      },
    ],
    sampleData: [
      {
        id: 1,
        user_id: 1,
        total: 99.99,
        status: "completed",
        created_at: "2024-01-15 11:00:00",
      },
      {
        id: 2,
        user_id: 2,
        total: 149.5,
        status: "pending",
        created_at: "2024-01-16 15:30:00",
      },
      {
        id: 3,
        user_id: 1,
        total: 75.25,
        status: "completed",
        created_at: "2024-01-17 10:45:00",
      },
    ],
  },
  {
    name: "products",
    icon: Package,
    rows: 567,
    size: "1.2 MB",
    columns: [
      { name: "id", type: "integer", nullable: false, primary: true },
      { name: "name", type: "varchar(200)", nullable: false, primary: false },
      { name: "price", type: "decimal(10,2)", nullable: false, primary: false },
      { name: "stock", type: "integer", nullable: false, primary: false },
      {
        name: "category",
        type: "varchar(100)",
        nullable: true,
        primary: false,
      },
    ],
    sampleData: [
      {
        id: 1,
        name: "Laptop Pro",
        price: 1299.99,
        stock: 15,
        category: "Electronics",
      },
      {
        id: 2,
        name: "Wireless Mouse",
        price: 29.99,
        stock: 50,
        category: "Electronics",
      },
      {
        id: 3,
        name: "Office Chair",
        price: 199.99,
        stock: 8,
        category: "Furniture",
      },
    ],
  },
];

export function PostgresTables() {
  const [selectedTable, setSelectedTable] = useState<
    (typeof mockTables)[0] | null
  >(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">PostgreSQL Tables</h2>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Table
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockTables.map((table) => (
          <Card key={table.name} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <table.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{table.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTable(table)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <table.icon className="h-5 w-5" />
                          <span>{table.name}</span>
                        </DialogTitle>
                        <DialogDescription>
                          Table structure and sample data
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <h4 className="mb-3 font-semibold">Columns</h4>
                          <UITable>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Nullable</TableHead>
                                <TableHead>Primary Key</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {table.columns.map((column) => (
                                <TableRow key={column.name}>
                                  <TableCell className="font-medium">
                                    {column.name}
                                  </TableCell>
                                  <TableCell>{column.type}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        column.nullable
                                          ? "secondary"
                                          : "outline"
                                      }
                                    >
                                      {column.nullable ? "Yes" : "No"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {column.primary && <Badge>Primary</Badge>}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </UITable>
                        </div>
                        <div>
                          <h4 className="mb-3 font-semibold">Sample Data</h4>
                          <UITable>
                            <TableHeader>
                              <TableRow>
                                {table.columns.map((column) => (
                                  <TableHead key={column.name}>
                                    {column.name}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {table.sampleData.map((row, index) => (
                                <TableRow key={index}>
                                  {table.columns.map((column) => (
                                    <TableCell key={column.name}>
                                      {String(
                                        row[column.name as keyof typeof row],
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </UITable>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Columns:</span>
                  <span className="font-medium">{table.columns.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
