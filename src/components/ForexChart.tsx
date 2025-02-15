import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Rectangle,
  Brush,
  ReferenceLine,
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
import { Plus, ZoomIn, ZoomOut } from "lucide-react";

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

const CustomCandlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isGreen = close > open;
  const color = isGreen ? "#4ade80" : "#ef4444";
  const bodyHeight = Math.abs(open - close);
  const bodyY = Math.min(open, close);

  return (
    <g>
      <line
        x1={x + width / 2}
        y1={y + height - (height * (high - low))}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      <rect
        x={x}
        y={y + height - (height * (bodyY - low)) - (height * bodyHeight)}
        width={width}
        height={Math.max(1, height * bodyHeight)}
        fill={color}
      />
    </g>
  );
};

export const ForexChart = () => {
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  const [timeframe, setTimeframe] = useState("M1");
  const [data, setData] = useState(() => generateMockData(timeframe));
  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>([]);
  const [selectedPair, setSelectedPair] = useState("EURUSD");
  const [amount, setAmount] = useState("0.01");
  const [userBalance, setUserBalance] = useState(0);
  const [equity, setEquity] = useState(0);
  const [usedMargin, setUsedMargin] = useState(0);
  const [newPair, setNewPair] = useState({ symbol: "", baseCurrency: "", quoteCurrency: "" });
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [openPositions, setOpenPositions] = useState<any[]>([]);
  const [totalPnL, setTotalPnL] = useState<number>(0);
  const [visiblePriceRange, setVisiblePriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
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

  useEffect(() => {
    const fetchOpenPositions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: positions } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'open');

      if (positions) {
        setOpenPositions(positions);
        setUsedMargin(positions.reduce((sum, pos) => sum + (pos.total_value * 0.01), 0));
      }
    };

    fetchOpenPositions();

    const channel = supabase
      .channel('trading_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trades' },
        fetchOpenPositions
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const fetchRealtimeData = async () => {
      const lastPrice = parseFloat(data[data.length - 1].close);
      setCurrentPrice(lastPrice);
      
      const updatedPositions = openPositions.map(position => {
        const pnl = position.type === 'buy' 
          ? (lastPrice - position.price) * position.amount * 100000
          : (position.price - lastPrice) * position.amount * 100000;
        return { ...position, currentPnL: pnl };
      });
      
      setOpenPositions(updatedPositions);
      setTotalPnL(updatedPositions.reduce((sum, pos) => sum + pos.currentPnL, 0));
      
      setEquity(userBalance + totalPnL);
    };

    const interval = setInterval(fetchRealtimeData, 1000);
    return () => clearInterval(interval);
  }, [openPositions, data]);

  useEffect(() => {
    if (!data.length) return;
    
    const lastPrice = parseFloat(data[data.length - 1].close);
    const prices = data.flatMap(d => [
      parseFloat(d.high),
      parseFloat(d.low),
      parseFloat(d.open),
      parseFloat(d.close)
    ]);

    const buffer = (Math.max(...prices) - Math.min(...prices)) * 0.1; // 10% padding
    
    setVisiblePriceRange({
      min: Math.min(...prices) - buffer,
      max: Math.max(...prices) + buffer
    });
  }, [data]);

  useEffect(() => {
    if (!data.length) return;
    
    const lastPrice = parseFloat(data[data.length - 1].close);
    
    // Check if price is outside the current visible range
    if (lastPrice > visiblePriceRange.max || lastPrice < visiblePriceRange.min) {
      const buffer = (lastPrice - visiblePriceRange.min) * 0.1; // 10% padding
      setVisiblePriceRange({
        min: lastPrice - buffer,
        max: lastPrice + buffer
      });
    }

    // Auto-zoom if price moves outside current view
    if (zoomDomain) {
      const [startIndex, endIndex] = zoomDomain;
      const visibleData = data.slice(startIndex, endIndex + 1);
      const visiblePrices = visibleData.flatMap(d => [
        parseFloat(d.high),
        parseFloat(d.low)
      ]);
      
      if (lastPrice > Math.max(...visiblePrices) || lastPrice < Math.min(...visiblePrices)) {
        const newEndIndex = data.length - 1;
        const newStartIndex = Math.max(0, newEndIndex - (endIndex - startIndex));
        setZoomDomain([newStartIndex, newEndIndex]);
      }
    }
  }, [data, currentPrice]);

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
    const currentPrice = parseFloat(data[data.length - 1].close);
    
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
    const currentPrice = parseFloat(data[data.length - 1].close);
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

  const handleZoomIn = () => {
    const dataLength = data.length;
    if (!zoomDomain) {
      setZoomDomain([Math.floor(dataLength * 0.25), Math.floor(dataLength * 0.75)]);
    } else {
      const range = zoomDomain[1] - zoomDomain[0];
      const newRange = Math.max(10, Math.floor(range * 0.5));
      const center = Math.floor((zoomDomain[0] + zoomDomain[1]) / 2);
      setZoomDomain([
        Math.max(0, center - Math.floor(newRange / 2)),
        Math.min(dataLength - 1, center + Math.floor(newRange / 2))
      ]);
    }
  };

  const handleZoomOut = () => {
    const dataLength = data.length;
    if (!zoomDomain) return;
    
    const range = zoomDomain[1] - zoomDomain[0];
    const newRange = Math.min(dataLength, range * 2);
    const center = Math.floor((zoomDomain[0] + zoomDomain[1]) / 2);
    setZoomDomain([
      Math.max(0, center - Math.floor(newRange / 2)),
      Math.min(dataLength - 1, center + Math.floor(newRange / 2))
    ]);
  };

  const getBTCUSDMockData = (timeframe: string) => {
    const basePrice = selectedPair === 'BTCUSD' ? 45000 : 1.2000;
    return generateMockData(timeframe).map(d => ({
      ...d,
      open: (parseFloat(d.open) * (basePrice / 1.2000)).toFixed(2),
      high: (parseFloat(d.high) * (basePrice / 1.2000)).toFixed(2),
      low: (parseFloat(d.low) * (basePrice / 1.2000)).toFixed(2),
      close: (parseFloat(d.close) * (basePrice / 1.2000)).toFixed(2),
    }));
  };

  useEffect(() => {
    const newData = selectedPair === 'BTCUSD' 
      ? getBTCUSDMockData(timeframe)
      : generateMockData(timeframe);
    setData(newData);
  }, [selectedPair, timeframe]);

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-9">
          <Card className="w-full glass">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle>Live Chart</CardTitle>
                  <span className="text-2xl font-bold text-primary">
                    {currentPrice.toFixed(4)}
                  </span>
                </div>
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
                  <ToggleGroup type="single" value={chartType} onValueChange={(value: 'candlestick' | 'line') => value && setChartType(value)}>
                    <ToggleGroupItem value="candlestick">Candlestick</ToggleGroupItem>
                    <ToggleGroupItem value="line">Line</ToggleGroupItem>
                  </ToggleGroup>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleZoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleZoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>
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
                  <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: "currentColor" }}
                      tickLine={{ stroke: "currentColor" }}
                    />
                    <YAxis
                      domain={[visiblePriceRange.min, visiblePriceRange.max]}
                      tick={{ fill: "currentColor" }}
                      tickLine={{ stroke: "currentColor" }}
                      tickFormatter={(value) => 
                        selectedPair === 'BTCUSD' 
                          ? value.toFixed(2)
                          : value.toFixed(4)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "1px solid #ccc",
                      }}
                      formatter={(value: any) => 
                        selectedPair === 'BTCUSD'
                          ? parseFloat(value).toFixed(2)
                          : parseFloat(value).toFixed(4)
                      }
                    />
                    {chartType === 'candlestick' ? (
                      <Bar
                        dataKey="height"
                        fill="none"
                        shape={<CustomCandlestick />}
                        data={data.map(d => ({
                          ...d,
                          height: 1,
                          low: parseFloat(d.low),
                          high: parseFloat(d.high),
                          open: parseFloat(d.open),
                          close: parseFloat(d.close),
                        }))}
                      />
                    ) : (
                      <Line
                        type="monotone"
                        dataKey="close"
                        stroke="#2563eb"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}
                    <Brush
                      dataKey="time"
                      height={30}
                      stroke="#8884d8"
                      startIndex={zoomDomain ? zoomDomain[0] : undefined}
                      endIndex={zoomDomain ? zoomDomain[1] : undefined}
                      onChange={(domain) => setZoomDomain([domain.startIndex, domain.endIndex])}
                    />
                    <ReferenceLine
                      y={currentPrice}
                      stroke="#2563eb"
                      strokeDasharray="3 3"
                      label={{ value: 'Current Price', position: 'right' }}
                    />
                    {openPositions.map((position, index) => (
                      <ReferenceLine
                        key={position.id}
                        y={position.price}
                        stroke={position.type === 'buy' ? "#4ade80" : "#ef4444"}
                        strokeDasharray="3 3"
                        label={{ 
                          value: `${position.type.toUpperCase()} @ ${position.price}`, 
                          position: 'left' 
                        }}
                      />
                    ))}
                  </ComposedChart>
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
                    disabled={parseFloat(amount) * currentPrice < 2.50}
                  >
                    Sell
                  </Button>
                  <Button
                    variant="outline"
                    className="w-24 bg-green-500/10 hover:bg-green-500/20 text-green-500"
                    onClick={() => handleTrade('buy')}
                    disabled={parseFloat(amount) * currentPrice < 2.50}
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
                <span>Floating P/L:</span>
                <span className={`font-medium ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${totalPnL.toFixed(2)}
                </span>
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
