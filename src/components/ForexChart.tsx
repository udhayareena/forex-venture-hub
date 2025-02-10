
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

// Mock data generator for demo purposes
const generateMockData = () => {
  const basePrice = 1.2000;
  return Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
    price: (
      basePrice +
      Math.sin(i * 0.5) * 0.02 +
      (Math.random() - 0.5) * 0.01
    ).toFixed(4),
  }));
};

export const ForexChart = () => {
  const [data, setData] = useState(generateMockData());

  useEffect(() => {
    // Update chart every 5 seconds
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)];
        newData.push({
          time: new Date().toLocaleTimeString(),
          price: (
            parseFloat(prevData[prevData.length - 1].price) +
            (Math.random() - 0.5) * 0.002
          ).toFixed(4),
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full glass">
      <CardHeader>
        <CardTitle>EUR/USD Live Chart</CardTitle>
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
