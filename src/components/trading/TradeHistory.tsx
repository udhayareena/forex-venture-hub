
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Trade {
  id: string;
  currency_pair: string;
  type: string;
  amount: number;
  price: number;
  total_value: number;
  status: string;
  created_at: string;
  profit_loss: number | null;
}

export const TradeHistory = () => {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const fetchTrades = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trades:', error);
        return;
      }

      setTrades(data || []);
    };

    fetchTrades();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('trades-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
        },
        () => {
          fetchTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-2 rounded-lg bg-card/50"
              >
                <div>
                  <p className="font-medium">{trade.currency_pair}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(trade.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.type.toUpperCase()} @ {trade.price}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Amount: {trade.amount}
                  </p>
                  {trade.status === 'closed' && trade.profit_loss !== null && (
                    <p className={`text-sm ${Number(trade.profit_loss) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      P/L: {Number(trade.profit_loss).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
