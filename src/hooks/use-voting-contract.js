import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { VOTING_CONTRACT_ADDRESS } from "@/lib/constants";
import VotingSystemABI from "@/contracts/VotingSystem.json";

export function useVotingContract() {
  const [loading, setLoading] = useState(false);

  // Допоміжна функція для отримання контракту з правом запису (Signer)
  const getSignedContract = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask не знайдено!");
      return null;
    }

    try {
      // Провайдер - це доступ до блокчейну через MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Явно вимикаємо ENS, бо локальна мережа його не підтримує
      const network = await provider.getNetwork();
      network.ensAddress = null;
      // Отримуємо "підписувача" - поточний акаунт користувача
      const signer = await provider.getSigner();

      // Створюємо об'єкт контракту
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VotingSystemABI.abi, signer);

      return contract;
    } catch (error) {
      console.error("Contract init error:", error);
      toast.error("Помилка підключення до контракту");
      return null;
    }
  };

  // 1. Створення виборів (Адмін)
  const createElectionOnChain = async (electionId) => {
    setLoading(true);
    try {
      const contract = await getSignedContract();
      if (!contract) return false;

      console.log(`Creating election #${electionId} on blockchain...`);

      // Виклик функції смарт-контракту
      const tx = await contract.createElection(electionId);

      toast.info("Транзакцію відправлено...", { description: "Очікуємо підтвердження блоку" });

      // Чекаємо, поки транзакція пройде (майнінг блоку)
      await tx.wait();

      toast.success("Вибори успішно створено в блокчейні!");
      return true;
    } catch (error) {
      console.error(error);
      // Обробка типових помилок Solidity
      if (error.reason) toast.error(`Помилка контракту: ${error.reason}`);
      else toast.error("Не вдалося створити вибори в блокчейні");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 2. Активація виборів (Адмін) - можна викликати при зміні статусу на 'active'
  const toggleElectionStatusOnChain = async (electionId, isActive) => {
    setLoading(true);
    try {
      const contract = await getSignedContract();
      if (!contract) return false;

      const tx = await contract.toggleElectionStatus(electionId, isActive);
      await tx.wait();

      toast.success(`Статус виборів змінено на: ${isActive ? "Active" : "Inactive"}`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Помилка зміни статусу");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 3. Голосування (Користувач)
  const voteOnChain = async (electionId, candidateId) => {
    setLoading(true);
    try {
      const contract = await getSignedContract();
      if (!contract) return null;

      console.log(`Voting for candidate #${candidateId} in election #${electionId}...`);

      const tx = await contract.vote(electionId, candidateId);

      toast.info("Голос відправлено...", { description: "Чекаємо підтвердження..." });

      // Чекаємо підтвердження
      const receipt = await tx.wait();

      toast.success("Ваш голос записано в блокчейн!");

      // Повертаємо хеш транзакції, щоб зберегти його на бекенді
      return receipt.hash;
    } catch (error) {
      console.error("Voting error:", error);
      if (error.reason) toast.error(`Помилка: ${error.reason}`);
      else toast.error("Не вдалося проголосувати");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 4. Отримання кількості голосів (Public View)
  const getVotes = useCallback(async (electionId, candidateId) => {
    try {
      // Тут можна використовувати getSignedContract, але краще просто Provider (швидше, не треба signer)
      if (!window.ethereum) return 0;
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Створюємо інстанс тільки для читання
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VotingSystemABI.abi, provider);

      const count = await contract.getCandidateVotes(electionId, candidateId);
      // Повертаємо число (BigInt конвертуємо в Number/String)
      return Number(count);
    } catch (error) {
      console.error("Error fetching votes:", error);
      return 0;
    }
  }, []);

  return {
    loading,
    createElectionOnChain,
    toggleElectionStatusOnChain,
    voteOnChain,
    getVotes, // <--- Експортуємо нову функцію
  };
}
