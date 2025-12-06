import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { DPOS_CONTRACT_ADDRESS } from "@/lib/constants";
import DPoS_ABI from "@/contracts/DPoS.json";

export function useDPoS() {
  const [loading, setLoading] = useState(false);

  const getContract = async (withSigner = false) => {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    // Вимикаємо ENS для локальної мережі, щоб уникнути помилок
    (await provider.getNetwork()).ensAddress = null;

    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(DPOS_CONTRACT_ADDRESS, DPoS_ABI.abi, signer);
    }
    return new ethers.Contract(DPOS_CONTRACT_ADDRESS, DPoS_ABI.abi, provider);
  };

  // Стейкінг (відправка ETH)
  const stake = useCallback(async (amountEth) => {
    setLoading(true);
    try {
      const contract = await getContract(true);
      const tx = await contract.stake({ value: ethers.parseEther(amountEth) });
      await tx.wait();
      toast.success(`Успішно застейкано ${amountEth} ETH`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Помилка стейкінгу");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Реєстрація делегата
  const registerDelegate = useCallback(async (name) => {
    setLoading(true);
    try {
      const contract = await getContract(true);
      const tx = await contract.registerDelegate(name);
      await tx.wait();
      toast.success("Ви зареєстровані як кандидат!");
      return true;
    } catch {
      toast.error("Помилка реєстрації");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Голосування за делегата
  const voteForDelegate = useCallback(async (delegateAddress) => {
    setLoading(true);
    try {
      const contract = await getContract(true);
      const tx = await contract.voteForDelegate(delegateAddress);
      await tx.wait();
      toast.success("Голос за делегата віддано!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Помилка голосування");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Отримання даних
  const getInfo = useCallback(async (userAddress) => {
    try {
      const contract = await getContract(false);
      const delegates = await contract.getAllDelegates();

      let myStake = "0";
      if (userAddress) {
        const stakeBigInt = await contract.stakes(userAddress);
        myStake = ethers.formatEther(stakeBigInt);
      }

      return { delegates, myStake };
    } catch (e) {
      console.error(e);
      return { delegates: [], myStake: "0" };
    }
  }, []);

  return { loading, stake, registerDelegate, voteForDelegate, getInfo };
}
