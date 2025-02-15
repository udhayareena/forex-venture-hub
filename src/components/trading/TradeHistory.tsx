
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Trade {
  id: string;
  currency_pair: string;
  type: string;
  amount: number;
  price: number;
  total_value: number;
  status: string;
  created_at: string;
  closed_at: string | null;
  closing_price: number | null;
  profit_loss: number | null;
}

interface TradeHistoryProps {
  onClosePosition: (tradeId: string) => void;
}

export const TradeHistory = ({ onClosePosition }: TradeHistoryProps) => {
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

  const renderTradeItem = (trade: Trade) => (
    <div
      key={trade.id}
      className="flex items-center justify-between p-2 rounded-lg bg-card/50 border border-border/50"
    >
      <div>
        <p className="font-medium">{trade.currency_pair}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(trade.created_at).toLocaleString()}
        </p>
        {trade.closed_at && (
          <p className="text-sm text-muted-foreground">
            Closed: {new Date(trade.closed_at).toLocaleString()}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className={`font-medium ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
          {trade.type.toUpperCase()} @ {trade.price}
        </p>
        <p className="text-sm text-muted-foreground">
          Amount: {trade.amount}
        </p>
        {trade.status === 'closed' && trade.profit_loss !== null && (
          <p className={`text-sm font-medium ${trade.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            P/L: ${trade.profit_loss.toFixed(2)}
          </p>
        )}
        {trade.status === 'open' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onClosePosition(trade.id)}
            className="mt-2"
          >
            Close Position
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading History</CardTitle>
        <CardDescription>View your open and closed positions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="open" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="open">Open Positions</TabsTrigger>
            <TabsTrigger value="closed">Closed Positions</TabsTrigger>
          </TabsList>
          <TabsContent value="open">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {trades
                  .filter(trade => trade.status === 'open')
                  .map(renderTradeItem)}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="closed">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {trades
                  .filter(trade => trade.status === 'closed')
                  .map(renderTradeItem)}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
