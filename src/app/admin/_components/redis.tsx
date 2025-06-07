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

const mockRedisKeys = [
  {
    key: "user:1001",
    type: "hash",
    ttl: 3600,
    value: '{"name":"John Doe","email":"john@example.com"}',
  },
  { key: "session:abc123", type: "string", ttl: 1800, value: "active" },
  {
    key: "cache:products",
    type: "list",
    ttl: -1,
    value: '["product1","product2","product3"]',
  },
  { key: "counter:visits", type: "string", ttl: -1, value: "1247" },
  {
    key: "config:app",
    type: "hash",
    ttl: -1,
    value: '{"theme":"dark","lang":"en"}',
  },
];

export function RedisKeys() {
  const [keys, setKeys] = useState(mockRedisKeys);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKey, setSelectedKey] = useState<
    (typeof mockRedisKeys)[0] | null
  >(null);
  const [newKey, setNewKey] = useState({ key: "", value: "", ttl: "" });

  const filteredKeys = keys.filter((item) =>
    item.key.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddKey = () => {
    if (newKey.key && newKey.value) {
      setKeys([
        ...keys,
        {
          key: newKey.key,
          type: "string",
          ttl: newKey.ttl ? Number.parseInt(newKey.ttl) : -1,
          value: newKey.value,
        },
      ]);
      setNewKey({ key: "", value: "", ttl: "" });
    }
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
              <Button onClick={handleAddKey} className="w-full">
                Add Key
              </Button>
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
        {filteredKeys.map((item) => (
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
                    <Badge variant="outline">TTL: {item.ttl}s</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedKey(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-3">
                <code className="text-sm">{item.value}</code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
