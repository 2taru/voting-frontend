import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { makeRequest } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, Pencil } from "lucide-react";

import { EditElectionDialog } from "@/components/admin/EditElectionDialog";

export function ElectionDetailsPage() {
  const { id } = useParams(); // Отримуємо ID з URL
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchElectionData = () => {
    makeRequest("GET", `/elections/${id}`, {}, (res) => {
      if (res.id) setElection(res);
    });
  };

  useEffect(() => {
    setLoading(true);

    const userData = localStorage.getItem("user_data");
    if (userData) setUser(JSON.parse(userData));
    Promise.all([
      new Promise((resolve) =>
        makeRequest("GET", `/elections/${id}`, {}, (res) => {
          if (res.id) setElection(res);
          resolve();
        })
      ),
      new Promise((resolve) =>
        makeRequest("GET", `/elections/${id}/candidates`, {}, (res) => {
          if (Array.isArray(res)) setCandidates(res);
          resolve();
        })
      ),
    ]).then(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Кнопка назад */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:bg-transparent hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад до списку
      </Button>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        {/* Ліва колонка: Список кандидатів */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Кандидати</h2>
          {candidates.length > 0 ? (
            <div className="grid gap-4">
              {candidates.map((candidate) => (
                <Card key={candidate.id} className="flex items-center p-4 gap-4 hover:border-primary/50 transition-colors cursor-pointer">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.user.name}`} />
                    <AvatarFallback>{candidate.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="grow">
                    <h3 className="font-bold text-lg">{candidate.user.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{candidate.bio || "Немає опису"}</p>
                  </div>
                  <Button variant="outline">Голосувати</Button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-10 border border-dashed rounded-lg text-center text-muted-foreground">Список кандидатів поки що порожній.</div>
          )}
        </div>

        {/* Права колонка: Інфо про вибори */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Інформація</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h1 className="text-xl font-bold mr-2">{election.title}</h1>
                  <Badge variant={election.status === "active" ? "default" : "secondary"}>{election.status.toUpperCase()}</Badge>
                </div>

                {/* Кнопка редагування для адміна */}
                {user?.role === "admin" && (
                  <Button variant="outline" size="icon" onClick={() => setIsEditOpen(true)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{election.description}</div>
              <div className="pt-4 border-t text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Початок:</span>
                  <span className="font-medium">{new Date(election.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Кінець:</span>
                  <span className="font-medium">{new Date(election.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <EditElectionDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        election={election}
        onSuccess={fetchElectionData} // Оновлюємо дані після збереження
      />
    </div>
  );
}
