import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { makeRequest } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    makeRequest("GET", "/elections", {}, (res) => {
      if (Array.isArray(res)) {
        setElections(res);
      } else {
        toast.error("Failed to fetch elections: " + res);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Активні голосування</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map((election) => (
          <Card key={election.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{election.title}</CardTitle>
                <Badge variant={election.status === "active" ? "default" : "secondary"}>{election.status}</Badge>
              </div>
              <CardDescription>{election.description}</CardDescription>
            </CardHeader>
            <CardContent className="grow">
              <p className="text-sm text-muted-foreground">Початок: {new Date(election.start_date).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Кінець: {new Date(election.end_date).toLocaleString()}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={`/elections/${election.id}`}>Детальніше</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {elections.length === 0 && <p className="text-center text-muted-foreground mt-10">Наразі немає доступних голосувань.</p>}
    </div>
  );
}
