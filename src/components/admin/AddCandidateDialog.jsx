import { useState, useEffect } from "react";
import { makeRequest } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AddCandidateDialog({ open, onOpenChange, onSuccess, electionId }) {
  const [loading, setLoading] = useState(false);

  // Стан форми
  const [selectedUser, setSelectedUser] = useState(null);
  const [bio, setBio] = useState("");

  // Стан пошуку
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Логіка пошуку (debounced можна додати за бажанням, тут спрощено)
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    // Невеликий таймаут, щоб не спамити запитами при кожному натисканні
    const timer = setTimeout(() => {
      setIsSearching(true);
      makeRequest("GET", `/users/search?q=${searchQuery}`, {}, (res) => {
        if (Array.isArray(res)) {
          setSearchResults(res);
        }
        setIsSearching(false);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(""); // Очистити пошук
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error("Будь ласка, оберіть користувача");
      return;
    }

    setLoading(true);

    await makeRequest(
      "POST",
      `/elections/${electionId}/candidates`,
      {
        user_id: selectedUser.id,
        bio: bio,
      },
      (res) => {
        setLoading(false);
        if (res.candidate) {
          toast.success("Кандидата додано!");
          onSuccess();
          onOpenChange(false);
          // Скидання форми
          setSelectedUser(null);
          setBio("");
        } else {
          toast.error("Помилка додавання", { description: res.message });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Додати кандидата</DialogTitle>
          <DialogDescription>Знайдіть користувача та додайте його до списку кандидатів.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* БЛОК ПОШУКУ / ВИБОРУ */}
          <div className="grid gap-2">
            <Label>Користувач</Label>

            {selectedUser ? (
              // Вигляд вибраного користувача
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{selectedUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                  Змінити
                </Button>
              </div>
            ) : (
              // Поле пошуку
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Пошук за ім'ям, email або ID..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {/* Результати пошуку */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[200px] overflow-y-auto">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer transition-colors" onClick={() => handleSelectUser(user)}>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isSearching && (
                  <div className="absolute right-2 top-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Біографія / Програма</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Коротко про кандидата..." />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || !selectedUser}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Додати
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
