import { useEffect, useState, useCallback } from "react";
import { useDPoS } from "@/hooks/use-dpos";
import { ethers } from "ethers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Coins, UserPlus, Vote, Trophy, Wallet } from "lucide-react";
import { toast } from "sonner";

export function GovernancePage() {
  const { stake, registerDelegate, voteForDelegate, getInfo, loading: dposLoading } = useDPoS();

  // Стан даних
  const [delegates, setDelegates] = useState([]);
  const [myStake, setMyStake] = useState("0");
  // const [userAddress, setUserAddress] = useState(null);

  // Стан форм
  const [stakeAmount, setStakeAmount] = useState("");
  const [delegateName, setDelegateName] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Завантаження даних
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    const userData = localStorage.getItem("user_data");
    let address = null;
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        address = parsed.wallet_address;
        // setUserAddress(address);
      } catch (e) {
        console.error(e);
      }
    }

    const info = await getInfo(address);
    setDelegates(info.delegates);
    setMyStake(info.myStake);
    setIsRefreshing(false);
  }, [getInfo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Введіть коректну суму");
      return;
    }
    const success = await stake(stakeAmount);
    if (success) {
      setStakeAmount("");
      fetchData();
    }
  };

  const handleRegister = async () => {
    if (!delegateName) {
      toast.error("Введіть ім'я");
      return;
    }
    const success = await registerDelegate(delegateName);
    if (success) {
      setDelegateName("");
      fetchData();
    }
  };

  const handleVote = async (delegateAddress) => {
    const success = await voteForDelegate(delegateAddress);
    if (success) {
      fetchData();
    }
  };

  // Сортуємо делегатів за кількістю голосів (Top DPoS)
  const sortedDelegates = [...delegates].sort((a, b) => {
    if (a.totalVotes > b.totalVotes) return -1;
    if (a.totalVotes < b.totalVotes) return 1;
    return 0;
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" /> DPoS Управління
          </h1>
          <p className="text-muted-foreground mt-1">Стейкайте токени та обирайте валідаторів мережі.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Оновити дані"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* КАРТКА СТЕЙКІНГУ */}
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Мій Стейк
            </CardTitle>
            <CardDescription>Заблокуйте ETH, щоб отримати право голосу (Weight).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">Ваш поточний стейк</div>
              <div className="text-3xl font-bold text-primary">{myStake} ETH</div>
            </div>

            <div className="space-y-2">
              <Label>Сума для стейкінгу (ETH)</Label>
              <div className="flex gap-2">
                <Input type="number" placeholder="0.1" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} />
                <Button onClick={handleStake} disabled={dposLoading}>
                  {dposLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="mr-2 h-4 w-4" />}
                  Стейкати
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* КАРТКА РЕЄСТРАЦІЇ ДЕЛЕГАТА */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Стати Делегатом
            </CardTitle>
            <CardDescription>Висуньте свою кандидатуру на роль валідатора мережі.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ім'я кандидата (або назва ноди)</Label>
              <div className="flex gap-2">
                <Input placeholder="Node Runner 01" value={delegateName} onChange={(e) => setDelegateName(e.target.value)} />
                <Button variant="secondary" onClick={handleRegister} disabled={dposLoading}>
                  Зареєструватися
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">* Делегати з найбільшою кількістю голосів отримують право підтверджувати блоки в мережі.</p>
          </CardContent>
        </Card>
      </div>

      {/* СПИСОК ДЕЛЕГАТІВ */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Рейтинг Делегатів</h2>

        {sortedDelegates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedDelegates.map((delegate, index) => (
              <Card
                key={delegate.wallet}
                className={`relative overflow-hidden transition-all hover:shadow-md ${index < 3 ? "border-yellow-400/50 bg-yellow-50/10" : ""}`}
              >
                {index < 3 && <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl">TOP {index + 1}</div>}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${delegate.wallet}`} />
                      <AvatarFallback>DG</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{delegate.name}</CardTitle>
                      <CardDescription className="font-mono text-xs truncate w-[150px]" title={delegate.wallet}>
                        {delegate.wallet}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground">Всього голосів:</p>
                      <p className="text-xl font-bold">
                        {/* Конвертуємо Wei в ETH для відображення */}
                        {ethers.formatEther(delegate.totalVotes)} ETH
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={index < 3 ? "default" : "outline"} onClick={() => handleVote(delegate.wallet)} disabled={dposLoading}>
                    <Vote className="mr-2 h-4 w-4" /> Голосувати за цього делегата
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">Ще немає зареєстрованих делегатів. Станьте першим!</p>
          </div>
        )}
      </div>
    </div>
  );
}
