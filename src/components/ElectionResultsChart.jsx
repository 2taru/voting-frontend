import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ElectionResultsChart({ candidates }) {
  const data = candidates.map((c) => ({
    name: c.user.name,
    votes: Number(c.votes || 0),
  }));

  data.sort((a, b) => b.votes - a.votes);

  const totalVotes = data.reduce((acc, curr) => acc + curr.votes, 0);
  const colors = ["#2563eb", "#16a34a", "#db2777", "#ea580c", "#7c3aed", "#0891b2"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Результати голосування</CardTitle>
        <div className="text-sm text-muted-foreground">
          Всього голосів: <span className="font-bold text-foreground">{totalVotes}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full min-h-[300px]">
          {totalVotes > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={32}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">Даних ще немає</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
