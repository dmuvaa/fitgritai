"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, Target } from "lucide-react"

interface WeightChartProps {
  data: Array<{
    id: string
    weight: number
    date: string
    notes?: string
  }>
  goal: number
}

export function WeightChart({ data, goal }: WeightChartProps) {
  const chartData = data.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: entry.weight,
    goal: goal,
  }))

  const currentWeight = data[data.length - 1]?.weight || 0
  const startWeight = data[0]?.weight || 0
  const weightLoss = startWeight - currentWeight
  const progressToGoal = startWeight > 0 ? ((startWeight - currentWeight) / (startWeight - goal)) * 100 : 0

  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Weight Progress
        </CardTitle>
        <CardDescription>
          {weightLoss > 0 ? (
            <span className="text-green-600">
              Down {weightLoss.toFixed(1)}kg • {progressToGoal.toFixed(1)}% to goal
            </span>
          ) : (
            <span>Track your weight to see progress</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 12 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#f97316", strokeWidth: 2 }}
              />
              <Line type="monotone" dataKey="goal" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start logging your weight to see your progress chart</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
