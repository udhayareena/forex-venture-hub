
import { ref, set, push } from "firebase/database";
import { firebaseDb } from "@/integrations/firebase/client";
import { supabase } from "@/integrations/supabase/client";

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
  initialDeposit: number
): Promise<string> => {
  try {
    // Get current user
    const { data: { session }} = await supabase.auth.getSession();
    if (!session) {
      throw new Error("You must be logged in to create an account");
    }

    const userId = session.user.id;
    
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
    
    // Also save in Supabase for backup and quick access
    const { error } = await supabase
      .from('trading_accounts')
      .insert({
        account_id: accountId,
        user_id: userId,
        account_type: accountType,
        leverage: accountDetails.leverage,
        initial_deposit: initialDeposit,
        status: "pending"
      });
    
    if (error) {
      console.error("Error saving to Supabase:", error);
    }
    
    return accountId;
  } catch (error: any) {
    console.error("Error creating trading account:", error);
    throw new Error(error.message || "Failed to create trading account");
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
