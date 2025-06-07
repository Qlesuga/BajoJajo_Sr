"use client";

import { useState } from "react";
import { Search, Plus, Edit } from "lucide-react";
import { Button } from "~/shadcn/components/ui/button";
import { Input } from "~/shadcn/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shadcn/components/ui/card";
import { Badge } from "~/shadcn/components/ui/badge";
import { Textarea } from "~/shadcn/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/components/ui/dialog";
import { Label } from "~/shadcn/components/ui/label";
import { api } from "~/trpc/react";

export function RedisKeys() {
  const { data, isLoading } = api.admin.getRedisKeys.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKey, setSelectedKey] = useState<typeof data>(null);
  const [newKey, setNewKey] = useState({ key: "", value: "", ttl: "" });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHouurs = hours % 24;
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    return `${days}days ${remainingHouurs}h ${remainingMinutes}min ${remainingSeconds.toString().padStart(2, "0")}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Redis Keys Browser</h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Key</DialogTitle>
              <DialogDescription>
                Create a new Redis key-value pair
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={newKey.key}
                  onChange={(e) =>
                    setNewKey({ ...newKey, key: e.target.value })
                  }
                  placeholder="Enter key name"
                />
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Textarea
                  id="value"
                  value={newKey.value}
                  onChange={(e) =>
                    setNewKey({ ...newKey, value: e.target.value })
                  }
                  placeholder="Enter value"
                />
              </div>
              <div>
                <Label htmlFor="ttl">TTL (seconds, -1 for no expiry)</Label>
                <Input
                  id="ttl"
                  type="number"
                  value={newKey.ttl}
                  onChange={(e) =>
                    setNewKey({ ...newKey, ttl: e.target.value })
                  }
                  placeholder="-1"
                />
              </div>
              <Button className="w-full">Add Key</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search keys..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {isLoading
          ? "loading"
          : !data
            ? "ups"
            : data.map((item) => (
                <Card
                  key={item.key}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{item.key}</CardTitle>
                        <Badge variant="secondary">{item.type}</Badge>
                        {item.ttl > 0 && (
                          <Badge variant="outline">
                            TTL: {formatTime(item.ttl)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md bg-muted p-3">
                      <div className="text-sm">
                        {typeof item.value === "string"
                          ? item.value
                          : Array.isArray(item.value)
                            ? item.value.join(", ")
                            : Object.keys(
                                item.value as Record<string, string>,
                              ).map((key, index) => (
                                <div key={index}>
                                  {/*@ts-ignore*/}
                                  {key}: {item.value[key]}
                                  <br />
                                </div>
                              ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
      </div>
    </div>
  );
}
