import { useState } from "react";
import { makeRequest } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useVotingContract } from "@/hooks/use-voting-contract";

export function CreateElectionDialog({ open, onOpenChange, onSuccess }) {
  const { createElectionOnChain, loading: chainLoading } = useVotingContract();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await makeRequest("POST", "/elections", formData, async (res) => {
      setLoading(false);
      if (res.election.id) {
        const electionId = res.election.id;

        // Створюємо в Блокчейні (Solidity)
        const success = await createElectionOnChain(electionId);

        if (success) {
          toast.success("Вибори створено і синхронізовано!");
          onSuccess();
          onOpenChange(false);
          setFormData({ title: "", description: "", start_date: "", end_date: "" });
        } else {
          toast.warning("Запис створено в БД, але не в Блокчейні. Спробуйте пізніше.");
          onSuccess();
          onOpenChange(false);
        }
        toast.success("Вибори успішно створено!");
        onSuccess();
        onOpenChange(false);
        setFormData({ title: "", description: "", start_date: "", end_date: "" });
      } else {
        toast.error("Помилка створення", { description: res.message });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Створити нові вибори</DialogTitle>
          <DialogDescription>Заповніть деталі для створення нової сесії голосування.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Назва</Label>
            <Input id="title" value={formData.title} onChange={handleChange} required placeholder="Напр: Вибори 2025" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea id="description" value={formData.description} onChange={handleChange} placeholder="Деталі голосування..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_date">Початок</Label>
              <Input id="start_date" type="datetime-local" value={formData.start_date} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date">Кінець</Label>
              <Input id="end_date" type="datetime-local" value={formData.end_date} onChange={handleChange} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || chainLoading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Створити
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
