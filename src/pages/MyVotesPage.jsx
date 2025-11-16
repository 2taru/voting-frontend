import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { makeRequest } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";

export function MyVotesPage() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    makeRequest("GET", "/my-votes", {}, (res) => {
      if (Array.isArray(res)) {
        setVotes(res);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Історія голосувань</h1>

      <div className="space-y-4">
        {votes.length > 0 ? (
          votes.map((vote) => (
            <Card key={vote.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      <Link to={`/elections/${vote.election.id}`} className="hover:underline">
                        {vote.election.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>Проголосовано: {new Date(vote.created_at).toLocaleString()}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Зараховано
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Показуємо хеш транзакції як доказ */}
                <div className="p-3 bg-muted/50 rounded-md text-xs font-mono break-all">
                  <span className="font-bold text-muted-foreground block mb-1">HASH ТРАНЗАКЦІЇ (ON-CHAIN):</span>
                  {vote.transaction_hash || "Очікує підтвердження..."}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" asChild className="ml-auto">
                  <Link to={`/elections/${vote.election.id}`}>
                    Переглянути деталі виборів <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">Ви ще не брали участь у жодному голосуванні.</p>
            <Button asChild>
              <Link to="/elections">Перейти до списку виборів</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
