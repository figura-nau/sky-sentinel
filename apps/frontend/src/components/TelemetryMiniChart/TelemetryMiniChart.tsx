import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { MoreHorizontal } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";

export function TelemetryMiniChart({
  title,
  data,
}: {
  title: string;
  data: { x: number; y: number }[];
}) {
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Card className="border-slate-800 bg-slate-950/50 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900 px-4 py-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {title}
        </CardTitle>
        <CardAction>
          <MoreHorizontal className="h-4 w-4 text-slate-600" />
        </CardAction>
      </CardHeader>

      <CardContent className="h-35 w-full p-0 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 15, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="0"
              vertical={true}
              horizontal={true}
              stroke="#1e293b"
              opacity={0.5}
            />

            <XAxis
              dataKey="x"
              type="number"
              scale="time"
              domain={["auto", "auto"]}
              axisLine={false}
              tickFormatter={formatTime}
              minTickGap={30}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
              dy={5}
            />

            <YAxis
              domain={["auto", "auto"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
            />

            <Area
              type="monotone"
              dataKey="y"
              stroke="#2dd4bf"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAlt)"
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
