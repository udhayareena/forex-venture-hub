import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
type TransferDirection = "to_trading" | "to_wallet";
export const BalanceDisplay = () => {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [tradingBalance, setTradingBalance] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferDirection, setTransferDirection] = useState<TransferDirection>("to_trading");
  const [isTransferring, setIsTransferring] = useState(false);
  const fetchBalances = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    if (!session) return;
    const {
      data,
      error
    } = await supabase.from('user_balances').select('wallet_balance, trading_balance').eq('user_id', session.user.id).maybeSingle();
    if (data) {
      setWalletBalance(data.wallet_balance || 0);
      setTradingBalance(data.trading_balance || 0);
    } else if (error) {
      console.error('Error fetching balances:', error);
    }
  };
  useEffect(() => {
    fetchBalances();

    // Subscribe to realtime updates
    const channel = supabase.channel('balance_updates').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_balances'
    }, fetchBalances).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleTransfer = async () => {
    try {
      setIsTransferring(true);
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to transfer funds");
        return;
      }

      // Check if sufficient balance
      const sourceBalance = transferDirection === "to_trading" ? walletBalance : tradingBalance;
      if (amount > sourceBalance) {
        toast.error("Insufficient balance");
        return;
      }

      // Create transfer record
      const {
        error: transferError
      } = await supabase.from('balance_transfers').insert({
        user_id: session.user.id,
        amount,
        from_wallet: transferDirection === "to_trading",
        to_trading: transferDirection === "to_trading"
      });
      if (transferError) throw transferError;

      // Update balances
      const {
        error: updateError
      } = await supabase.from('user_balances').update({
        wallet_balance: transferDirection === "to_trading" ? walletBalance - amount : walletBalance + amount,
        trading_balance: transferDirection === "to_trading" ? tradingBalance + amount : tradingBalance - amount
      }).eq('user_id', session.user.id);
      if (updateError) throw updateError;
      toast.success("Transfer completed successfully");
      setTransferAmount("");
      await fetchBalances();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsTransferring(false);
    }
  };
  return;
};