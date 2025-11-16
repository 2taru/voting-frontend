import { useEffect, useState } from "react";
import { makeRequest } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Vote, Activity } from "lucide-react";

export function AdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    makeRequest("GET", "/admin/stats", {}, (res) => {
      if (res.total_users !== undefined) setStats(res);
    });
  }, []);

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-8 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всього виборців</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_users}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всього голосів</CardTitle>
          <Vote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_votes}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Активні сесії</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active_elections}</div>
        </CardContent>
      </Card>
    </div>
  );
}
