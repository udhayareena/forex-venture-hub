import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { TradeHistory } from "@/components/trading/TradeHistory";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedPair, setSelectedPair] = useState("EUR/USD");
  const [amount, setAmount] = useState("0.01");
  const [userBalance, setUserBalance] = useState(0);
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
    const fetchBalance = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data) {
        setUserBalance(data.balance || 0);
      }
    };

    fetchBalance();
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
          fetchBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const saveTimeframePreference = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from('forex_preferences')
        .upsert({ user_id: session.user.id, timeframe })
        .select();
    };

    saveTimeframePreference();
    setData(generateMockData(timeframe));

    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)];
        newData.push({
          time: new Date().toLocaleString(),
          price: (
            parseFloat(prevData[prevData.length - 1].price) +
            (Math.random() - 0.5) * 0.002
          ).toFixed(4),
        });
        return newData;
      });
    }, timeframe === 'M1' ? 5000 : 
       timeframe === 'M5' ? 25000 :
       timeframe === 'M15' ? 75000 : 300000);

    return () => clearInterval(interval);
  }, [timeframe]);

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
      <div className="w-full">
        <Card className="w-full glass">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Live Chart</CardTitle>
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
                <LineChart data={data}>
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
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={300}
                  />
                </LineChart>
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
      <div>
        <TradeHistory />
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

  return Array.from({ length: points }, (_, i) => ({
    time: new Date(Date.now() - (points - 1 - i) * timeInterval).toLocaleString(),
    price: (
      basePrice +
      Math.sin(i * 0.5) * 0.02 +
      (Math.random() - 0.5) * 0.01
    ).toFixed(4),
  }));
};
