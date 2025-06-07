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
import { api } from "~/trpc/react";

export function PostgresTables() {
  const { data, isLoading } = api.admin.getPostgresData.useQuery();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">PostgreSQL Tables</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data == null || isLoading
          ? "Loading"
          : Object.keys(data).map((table: string) => (
              <Card key={table} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{table}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[840px] max-w-7xl overflow-scroll">
                          <DialogHeader>
                            <DialogTitle className="flex items-center">
                              <h1 className="text-2xl">{table}</h1>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div>
                              <UITable>
                                <TableHeader>
                                  <TableRow>
                                    {/*@ts-ignore-next-line*/}
                                    {data[table].columns.map(
                                      (column: string) => (
                                        <TableHead key={column}>
                                          {column}
                                        </TableHead>
                                      ),
                                    )}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {/*@ts-ignore-next-line*/}
                                  {data[table].data.map(
                                    (row, index: number) => (
                                      <TableRow key={index}>
                                        {/*@ts-ignore-next-line*/}

                                        {data[table].columns.map(
                                          (column: string) => (
                                            <TableCell key={column}>
                                              {/*@ts-ignore-next-line*/}
                                              {`${row[column]}`}{" "}
                                            </TableCell>
                                          ),
                                        )}
                                      </TableRow>
                                    ),
                                  )}
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
                        {/*@ts-ignore-next-line*/}
                        {data[table].data.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Size:</span>
                      {/*@ts-ignore-next-line*/}
                      <span className="font-medium">{data[table].size}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
