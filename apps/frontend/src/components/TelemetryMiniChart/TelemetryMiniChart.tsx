import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MoreHorizontal } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function TelemetryMiniChart({
  title,
  data,
  color = "#2dd4bf",
}: {
  title: string;
  data: { x: number; y: number }[] | undefined;
  color?: string;
}) {
  const { t, i18n } = useTranslation();

  const formatTime = (time: number) => {
    const date = new Date(time);
    return date.toLocaleTimeString(i18n.language === "ua" ? "uk-UA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const gradientId = `color-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card className="border-slate-800 bg-slate-950/50 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900 px-4 py-2">
        <CardTitle className="text-[12px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {title}
        </CardTitle>
        <CardAction>
          <MoreHorizontal className="h-4 w-4 text-slate-600" />
        </CardAction>
      </CardHeader>

      <CardContent className="h-35 w-full p-0 pt-4 flex justify-center items-center">
        {data && data.length !== 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 15, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
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
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
                dy={5}
              />

              <YAxis
                domain={[
                  (min: number) => {
                    const padding = Math.abs(min * 0.2);
                    return Math.floor(min - padding);
                  },
                  (max: number) => {
                    const padding = Math.abs(max * 0.2);
                    return Math.ceil(max + padding);
                  },
                ]}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "#f8fafc",
                  textTransform: "uppercase",
                }}
                itemStyle={{ color: color }}
                labelFormatter={(label) => formatTime(label)}
                formatter={(value) => [value, title]}
                cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
              />

              <Area
                type="linear"
                dataKey="y"
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-sm">
            {t("telemetryCharts.noData")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
