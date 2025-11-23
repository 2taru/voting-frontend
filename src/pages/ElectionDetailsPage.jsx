import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { makeRequest } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useVotingContract } from "@/hooks/use-voting-contract";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { EditElectionDialog } from "@/components/admin/EditElectionDialog";
import { AddCandidateDialog } from "@/components/admin/AddCandidateDialog";

export function ElectionDetailsPage() {
  const { getVotes, voteOnChain, loading: voteLoading } = useVotingContract();
  const { id } = useParams(); // Отримуємо ID з URL
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);

  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchElectionData = useCallback(() => {
    return new Promise((resolve) => {
      makeRequest("GET", `/elections/${id}`, {}, (res) => {
        if (res.id) setElection(res);
        else {
          toast.error("Вибори не знайдено");
          navigate("/elections");
        }
        resolve();
      });
    });
  }, [id, navigate]); // 2. Додаємо залежності

  // Функція завантаження кандидатів
  const fetchCandidates = useCallback(() => {
    return new Promise((resolve) => {
      makeRequest("GET", `/elections/${id}/candidates`, {}, async (res) => {
        if (Array.isArray(res)) {
          const candidatesWithVotes = await Promise.all(
            res.map(async (candidate) => {
              const votes = await getVotes(id, candidate.id);
              return { ...candidate, votes: votes }; // Додаємо поле votes
            })
          );

          setCandidates(candidatesWithVotes);
        }
        resolve();
      });
    });
  }, [getVotes, id]);

  const handleDeleteCandidate = async () => {
    if (!candidateToDelete) return;

    setDeleteLoading(true);
    await makeRequest("DELETE", `/candidates/${candidateToDelete}`, {}, (res) => {
      setDeleteLoading(false);
      if (res.message === "Candidate removed successfully") {
        // Перевіряємо повідомлення з бекенду
        toast.success("Кандидата видалено");
        fetchCandidates(); // Оновлюємо список
      } else {
        toast.error("Не вдалося видалити кандидата", { description: res.message });
      }
      setCandidateToDelete(null); // Закриваємо діалог
    });
  };

  const handleVote = async (candidateId) => {
    // 1. Спочатку перевіряємо на бекенді, чи можна голосувати (status check)
    // Це економить газ користувача, якщо він вже голосував
    makeRequest("GET", `/elections/${id}/vote-status`, {}, async (statusRes) => {
      if (!statusRes.can_vote) {
        toast.error(statusRes.message);
        return;
      }

      // 2. Голосуємо в блокчейні
      const txHash = await voteOnChain(id, candidateId);

      if (txHash) {
        // 3. Якщо успіх - фіксуємо факт на бекенді
        await makeRequest("POST", `/elections/${id}/vote`, { transaction_hash: txHash }, (logRes) => {
          if (logRes.status === "error") {
            toast.warning("Голос в блокчейні є, але бекенд не оновився.");
          }
        });
      }
    });
  };

  useEffect(() => {
    setLoading(true);
    const userData = localStorage.getItem("user_data");
    if (userData) setUser(JSON.parse(userData));
    // Завантажуємо все паралельно
    Promise.all([fetchElectionData(), fetchCandidates()]).finally(() => setLoading(false));
  }, [fetchCandidates, fetchElectionData, id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!election) return null;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Кнопка назад */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:bg-transparent hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад до списку
      </Button>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        {/* Ліва колонка: Список кандидатів */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Кандидати</h2>

            {/* КНОПКА ДОДАВАННЯ КАНДИДАТА (Тільки для Адміна) */}
            {user?.role === "admin" && (
              <Button size="sm" variant="outline" onClick={() => setIsAddCandidateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Додати кандидата
              </Button>
            )}
          </div>
          {candidates.length > 0 ? (
            <div className="grid gap-4">
              {candidates.map((candidate) => (
                <Card key={candidate.id} className="flex items-center p-4 gap-4 hover:border-primary/50 transition-colors cursor-pointer">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.user.name}`} />
                    <AvatarFallback>{candidate.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="grow">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{candidate.user.name}</h3>
                      {/* ВІДОБРАЖЕННЯ ГОЛОСІВ */}
                      <Badge variant="secondary" className="text-xs">
                        {candidate.votes || 0} голосів
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{candidate.bio || "Немає опису"}</p>
                  </div>
                  <div className="flex gap-2">
                    {user?.role === "admin" ? (
                      // Кнопка видалення (Тільки для Адміна)
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation(); // Щоб не спрацьовував клік по картці, якщо він є
                          setCandidateToDelete(candidate.id);
                        }}
                      >
                        Видалити <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      // Кнопка голосування (Не для Адміна)
                      <Button
                        variant="outline"
                        disabled={voteLoading} // Блокуємо під час транзакції
                        onClick={() => handleVote(candidate.id)}
                      >
                        {voteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Голосувати"}
                      </Button>
                    )}
                  </div>
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
      <AddCandidateDialog
        open={isAddCandidateOpen}
        onOpenChange={setIsAddCandidateOpen}
        electionId={id}
        onSuccess={fetchCandidates} // Передаємо функцію оновлення списку
      />
      <AlertDialog open={!!candidateToDelete} onOpenChange={(open) => !open && setCandidateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>Ця дія незворотна. Кандидата буде видалено зі списку цього голосування.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteCandidate();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLoading}
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
