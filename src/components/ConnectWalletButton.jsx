import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { makeRequest } from "@/lib/utils";

export function ConnectWalletButton({ className, onConnected }) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(null);

  // Перевірка наявності MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask не знайдено! Будь ласка, встановіть розширення.");
      return;
    }

    setLoading(true);
    try {
      // Запит до MetaMask на отримання акаунтів
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      setAddress(walletAddress);

      // Зберігаємо адресу на бекенді
      await saveWalletToBackend(walletAddress);
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося підключити гаманець.");
    } finally {
      setLoading(false);
    }
  };

  const saveWalletToBackend = async (walletAddress) => {
    await makeRequest("POST", "/user/wallet", { wallet_address: walletAddress }, (res) => {
      if (res.user) {
        toast.success("Гаманець успішно прив'язано!");
        // Оновлюємо дані юзера в localStorage
        localStorage.setItem("user_data", JSON.stringify(res.user));
        if (onConnected) onConnected(res.user);
      } else {
        toast.error(res.message || "Помилка збереження адреси.");
      }
    });
  };

  if (address) {
    return (
      <Button variant="outline" className={cn("text-green-600 border-green-600 cursor-default", className)}>
        <Check className="mr-2 h-4 w-4" /> {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }

  return (
    <Button onClick={connectWallet} disabled={loading} variant="secondary" className={className}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
      Підключити MetaMask
    </Button>
  );
}
