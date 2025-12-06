import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { makeRequest } from "@/lib/utils";

export function ConnectWalletButton({ className, onConnected }) {
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState(() => {
    const savedUser = localStorage.getItem("user_data");
    return savedUser ? JSON.parse(savedUser).wallet_address : null;
  });

  const saveWalletToBackend = useCallback(
    async (walletAddress) => {
      await makeRequest("POST", "/user/wallet", { wallet_address: walletAddress }, (res) => {
        if (res.user) {
          localStorage.setItem("user_data", JSON.stringify(res.user));
          if (onConnected) onConnected(res.user);
        } else {
          setAddress(null);
          toast.error(res.message || "Помилка збереження адреси.");
        }
      });
    },
    [onConnected]
  );

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          const newAddress = accounts[0];
          setAddress(newAddress);
          saveWalletToBackend(newAddress);
          toast.info("Акаунт MetaMask змінено");
        } else {
          setAddress(null);
          toast.warning("MetaMask відключено");
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [saveWalletToBackend]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask не знайдено! Будь ласка, встановіть розширення.");
      return;
    }

    setLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      setAddress(walletAddress);
      await saveWalletToBackend(walletAddress);
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося підключити гаманець.");
    } finally {
      setLoading(false);
    }
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
