import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  CandlestickChart,
  Candlestick,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { TradeHistory } from "@/components/trading/TradeHistory";
import { DepositForm } from "@/components/trading/DepositForm";
import { WithdrawForm } from "@/components/trading/WithdrawForm";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const timeframes = [
  { value: "M1", label: "1m" },
  { value: "M5", label: "5m" },
  { value: "M15", label: "15m" },
  { value: "H1", label: "1h" },
  { value: "H4", label: "4h" },
  { value: "D", label: "1D" },
  { value: "M", label: "1M" },
  { value: "Y", label: "1Y" },
];

type CurrencyPair = {
  symbol: string;
  display_name: string;
};

export const ForexChart = () => {
  const [timeframe, setTimeframe] = useState("M1");
  const [data, setData] = useState(() => generateMockData(timeframe));
  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>([]);
  const [selectedPair, setSelectedPair] = useState("EURUSD");
  const [amount, setAmount] = useState("0.01");
  const [userBalance, setUserBalance] = useState(0);
  const [equity, setEquity] = useState(0);
  const [usedMargin, setUsedMargin] = useState(0);
  const [newPair, setNewPair] = useState({ symbol: "", baseCurrency: "", quoteCurrency: "" });
  const { toast } = useToast();

  useEffect(() => {
    const fetchCurrencyPairs = async () => {
      const { data, error } = await supabase
        .from('currency_pairs')
        .select('symbol, display_name')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching currency pairs:', error);
        return;
      }

      setCurrencyPairs(data || []);
    };

    fetchCurrencyPairs();
  }, []);

  useEffect(() => {
    const fetchBalanceAndMargin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('user_balances')
        .select('balance, equity, used_margin')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data) {
        setUserBalance(data.balance || 0);
        setEquity(data.equity || 0);
        setUsedMargin(data.used_margin || 0);
      }
    };

    fetchBalanceAndMargin();
    const channel = supabase
      .channel('balance_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_balances',
        },
        () => {
          fetchBalanceAndMargin();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddPair = async () => {
    const { error } = await supabase
      .from('currency_pairs')
      .insert({
        symbol: newPair.symbol,
        display_name: `${newPair.baseCurrency}/${newPair.quoteCurrency}`,
        base_currency: newPair.baseCurrency,
        quote_currency: newPair.quoteCurrency,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add currency pair",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Currency pair added successfully",
    });
    setNewPair({ symbol: "", baseCurrency: "", quoteCurrency: "" });
  };

  const handleClosePosition = async (tradeId: string) => {
    const currentPrice = parseFloat(data[data.length - 1].price);
    
    const { error } = await supabase
      .from('trades')
      .update({
        status: 'closed',
        closing_price: currentPrice,
        closed_at: new Date().toISOString(),
      })
      .eq('id', tradeId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to close position",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Position closed successfully",
    });
  };

  const handleTrade = async (type: 'buy' | 'sell') => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "Please log in to trade",
        variant: "destructive",
      });
      return;
    }

    const tradeAmount = parseFloat(amount);
    const currentPrice = parseFloat(data[data.length - 1].price);
    const requiredBalance = tradeAmount * currentPrice;

    if (tradeAmount < 0.01) {
      toast({
        title: "Invalid amount",
        description: "Minimum trade size is 0.01 lots",
        variant: "destructive",
      });
      return;
    }

    if (requiredBalance < 2.50) {
      toast({
        title: "Invalid amount",
        description: "Minimum trade value is $2.50",
        variant: "destructive",
      });
      return;
    }

    if (requiredBalance > userBalance) {
      toast({
        title: "Insufficient balance",
        description: "Not enough balance to place this trade",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('trades')
      .insert({
        user_id: session.user.id,
        currency_pair: selectedPair,
        type,
        amount: tradeAmount,
        price: currentPrice,
        total_value: tradeAmount * currentPrice,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to place trade",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Trade Placed",
      description: `Successfully placed ${type} order for ${tradeAmount} ${selectedPair} @ ${currentPrice}`,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-9">
          <Card className="w-full glass">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Live Chart</CardTitle>
                <div className="flex items-center gap-4">
                  <Select value={selectedPair} onValueChange={setSelectedPair}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select pair" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyPairs.map((pair) => (
                        <SelectItem key={pair.symbol} value={pair.symbol}>
                          {pair.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Currency Pair</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label>Symbol (e.g., EURUSD)</Label>
                          <Input
                            value={newPair.symbol}
                            onChange={(e) => setNewPair({ ...newPair, symbol: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Base Currency (e.g., EUR)</Label>
                          <Input
                            value={newPair.baseCurrency}
                            onChange={(e) => setNewPair({ ...newPair, baseCurrency: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Quote Currency (e.g., USD)</Label>
                          <Input
                            value={newPair.quoteCurrency}
                            onChange={(e) => setNewPair({ ...newPair, quoteCurrency: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleAddPair}>Add Pair</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <ToggleGroup 
                type="single" 
                value={timeframe} 
                onValueChange={(value) => value && setTimeframe(value)}
                className="justify-start"
              >
                {timeframes.map(({ value, label }) => (
                  <ToggleGroupItem key={value} value={value} aria-label={`${label} timeframe`}>
                    {label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <CandlestickChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: "currentColor" }}
                      tickLine={{ stroke: "currentColor" }}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fill: "currentColor" }}
                      tickLine={{ stroke: "currentColor" }}
                      tickFormatter={(value) => value.toFixed(4)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "1px solid #ccc",
                      }}
                    />
                    <Candlestick
                      fill="#33c589"
                      stroke="#007664"
                      wickStroke="#007664"
                      yAccessor={(d) => [d.open, d.high, d.low, d.close]}
                    />
                  </CandlestickChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-32"
                    min="0.01"
                    step="0.01"
                  />
                  <span className="text-sm text-muted-foreground">
                    Lots (min: 0.01)
                  </span>
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    className="w-24 bg-red-500/10 hover:bg-red-500/20 text-red-500"
                    onClick={() => handleTrade('sell')}
                  >
                    Sell
                  </Button>
                  <Button
                    variant="outline"
                    className="w-24 bg-green-500/10 hover:bg-green-500/20 text-green-500"
                    onClick={() => handleTrade('buy')}
                  >
                    Buy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3 space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Account Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Balance:</span>
                <span className="font-medium">${userBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Equity:</span>
                <span className="font-medium">${equity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Used Margin:</span>
                <span className="font-medium">${usedMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Free Margin:</span>
                <span className="font-medium">${(equity - usedMargin).toFixed(2)}</span>
              </div>
            </div>
          </Card>
          <TradeHistory onClosePosition={handleClosePosition} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <DepositForm />
        <WithdrawForm />
      </div>
    </div>
  );
};

const generateMockData = (timeframe: string) => {
  const basePrice = 1.2000;
  const points = timeframe.startsWith('M') ? 20 : 
                timeframe.startsWith('H') ? 24 : 
                timeframe === 'D' ? 30 : 
                timeframe === 'M' ? 30 : 12;
                
  const timeInterval = timeframe === 'M1' ? 60000 : 
                      timeframe === 'M5' ? 300000 :
                      timeframe === 'M15' ? 900000 :
                      timeframe === 'H1' ? 3600000 :
                      timeframe === 'H4' ? 14400000 :
                      timeframe === 'D' ? 86400000 :
                      timeframe === 'M' ? 2592000000 : 31536000000;

  return Array.from({ length: points }, (_, i) => {
    const time = new Date(Date.now() - (points - 1 - i) * timeInterval).toLocaleString();
    const open = basePrice + Math.sin(i * 0.5) * 0.02 + (Math.random() - 0.5) * 0.01;
    const close = open + (Math.random() - 0.5) * 0.005;
    const high = Math.max(open, close) + Math.random() * 0.003;
    const low = Math.min(open, close) - Math.random() * 0.003;

    return {
      time,
      open: open.toFixed(4),
      high: high.toFixed(4),
      low: low.toFixed(4),
      close: close.toFixed(4),
    };
  });
};
