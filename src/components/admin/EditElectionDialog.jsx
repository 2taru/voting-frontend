import { useState, useEffect } from "react";
import { makeRequest } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Допоміжна функція для форматування дати під input datetime-local
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Віднімаємо зміщення часового поясу, щоб отримати локальний час у форматі ISO
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export function EditElectionDialog({ open, onOpenChange, onSuccess, election }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "planned",
  });

  // Заповнюємо форму даними при відкритті
  useEffect(() => {
    if (election && open) {
      setFormData({
        title: election.title || "",
        description: election.description || "",
        start_date: formatDateForInput(election.start_date),
        end_date: formatDateForInput(election.end_date),
        status: election.status || "planned",
      });
    }
  }, [election, open]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    makeRequest("PUT", `/elections/${election.id}`, formData, (res) => {
      setLoading(false);
      if (res.election) {
        toast.success("Дані оновлено!");
        onSuccess(); // Оновлюємо дані на сторінці
        onOpenChange(false);
      } else {
        toast.error("Помилка оновлення", { description: res.message });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редагувати вибори</DialogTitle>
          <DialogDescription>Змініть статус або деталі голосування.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* СТАТУС */}
          <div className="grid gap-2">
            <Label htmlFor="status">Статус</Label>
            <Select onValueChange={handleStatusChange} value={formData.status}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned (Заплановано)</SelectItem>
                <SelectItem value="active">Active (Активні)</SelectItem>
                <SelectItem value="completed">Completed (Завершено)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Назва</Label>
            <Input id="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea id="description" value={formData.description} onChange={handleChange} />
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Зберегти зміни
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
