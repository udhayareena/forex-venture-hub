
import { ref, set, push, get } from "firebase/database";
import { firebaseDb } from "@/integrations/firebase/client";

export type AccountType = "standard" | "premium" | "vip";

export interface TradingAccount {
  accountId: string;
  userId: string;
  accountType: AccountType;
  leverage: string;
  initialDeposit: number;
  status: "pending" | "active" | "suspended";
  createdAt: string;
}

export const createTradingAccount = async (
  accountType: AccountType, 
  initialDeposit: number,
  userId: string
): Promise<string> => {
  try {
    // Determine account details based on type
    const accountDetails = getAccountDetails(accountType);
    
    // Create a new account reference in Firebase
    const accountsRef = ref(firebaseDb, 'tradingAccounts');
    const newAccountRef = push(accountsRef);
    const accountId = newAccountRef.key;
    
    if (!accountId) {
      throw new Error("Failed to generate account ID");
    }
    
    const tradingAccount: TradingAccount = {
      accountId,
      userId,
      accountType,
      leverage: accountDetails.leverage,
      initialDeposit,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    // Save account to Firebase
    await set(newAccountRef, tradingAccount);
    
    return accountId;
  } catch (error: any) {
    console.error("Error creating trading account:", error);
    throw new Error(error.message || "Failed to create trading account");
  }
};

export const getUserTradingAccounts = async (userId: string): Promise<TradingAccount[]> => {
  try {
    const accountsRef = ref(firebaseDb, 'tradingAccounts');
    const snapshot = await get(accountsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const accounts: TradingAccount[] = [];
    snapshot.forEach((childSnapshot) => {
      const account = childSnapshot.val() as TradingAccount;
      if (account.userId === userId) {
        accounts.push(account);
      }
    });
    
    return accounts;
  } catch (error) {
    console.error("Error fetching trading accounts:", error);
    return [];
  }
};

const getAccountDetails = (accountType: AccountType) => {
  switch (accountType) {
    case "standard":
      return {
        leverage: "1:100",
        minDeposit: 100
      };
    case "premium":
      return {
        leverage: "1:200",
        minDeposit: 1000
      };
    case "vip":
      return {
        leverage: "1:400",
        minDeposit: 10000
      };
    default:
      return {
        leverage: "1:100",
        minDeposit: 100
      };
  }
};

export const getMinimumDeposit = (accountType: AccountType): number => {
  return getAccountDetails(accountType).minDeposit;
};
