import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { makeRequest } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

import { CreateElectionDialog } from "@/components/admin/CreateElectionDialog";

export function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchElections = () => {
    setLoading(true);
    makeRequest("GET", "/elections", {}, (res) => {
      if (Array.isArray(res)) {
        setElections(res);
      } else {
        toast.error("Failed to fetch elections: " + res);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) setUser(JSON.parse(userData));

    fetchElections();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Активні голосування</h1>
        {user?.role === "admin" && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Створити вибори
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.length > 0 ? (
            elections.map((election) => (
              <Card key={election.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl line-clamp-2">{election.title}</CardTitle>
                    <Badge variant={election.status === "active" ? "default" : "secondary"}>{election.status}</Badge>
                  </div>
                  <CardDescription className="line-clamp-3">{election.description}</CardDescription>
                </CardHeader>
                <CardContent className="grow">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      Початок: <span className="font-medium text-foreground">{new Date(election.start_date).toLocaleDateString()}</span>
                    </p>
                    <p>
                      Кінець: <span className="font-medium text-foreground">{new Date(election.end_date).toLocaleDateString()}</span>
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to={`/elections/${election.id}`}>Переглянути</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">Немає доступних голосувань.</div>
          )}
        </div>
      )}
      <CreateElectionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={fetchElections} />
    </div>
  );
}
