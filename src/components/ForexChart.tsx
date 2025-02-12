
import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";

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

// Mock data generator for demo purposes
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

export const ForexChart = () => {
  const [timeframe, setTimeframe] = useState("M1");
  const [data, setData] = useState(() => generateMockData(timeframe));

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

    // Update chart based on timeframe
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

  // Load user's preferred timeframe
  useEffect(() => {
    const loadTimeframePreference = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('forex_preferences')
        .select('timeframe')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data?.timeframe) {
        setTimeframe(data.timeframe);
      }
    };

    loadTimeframePreference();
  }, []);

  return (
    <Card className="w-full glass">
      <CardHeader className="space-y-4">
        <CardTitle>EUR/USD Live Chart</CardTitle>
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
        <div className="h-[400px] w-full">
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
      </CardContent>
    </Card>
  );
};

