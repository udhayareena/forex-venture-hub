
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const BalanceDisplay = () => {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', session.user.id)
        .single();

      if (data) {
        setBalance(data.balance);
      }
    };

    fetchBalance();
  }, []);

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2">Trading Balance</h2>
      <p className="text-3xl font-bold text-secondary">${balance.toFixed(2)}</p>
    </Card>
  );
};

