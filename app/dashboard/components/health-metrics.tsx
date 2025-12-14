"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Moon,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

interface HealthMetricsProps {
  userId: string
  profile: any
}

export function HealthMetrics({ userId, profile }: HealthMetricsProps) {
  const [healthData, setHealthData] = useState({
    vitals: {
      restingHeartRate: 65,
      bloodPressure: { systolic: 120, diastolic: 80 },
      bodyTemperature: 36.5,
      oxygenSaturation: 98,
    },
    trends: {
      heartRateHistory: [
        { date: "2024-01-20", value: 68 },
        { date: "2024-01-21", value: 65 },
        { date: "2024-01-22", value: 67 },
        { date: "2024-01-23", value: 64 },
        { date: "2024-01-24", value: 65 },
      ],
      sleepHistory: [
        { date: "2024-01-20", hours: 7.2, quality: 7 },
        { date: "2024-01-21", hours: 8.1, quality: 8 },
        { date: "2024-01-22", hours: 6.8, quality: 6 },
        { date: "2024-01-23", hours: 7.5, quality: 8 },
        { date: "2024-01-24", hours: 7.8, quality: 7 },
      ],
      stressHistory: [
        { date: "2024-01-20", level: 6 },
        { date: "2024-01-21", level: 4 },
        { date: "2024-01-22", level: 7 },
        { date: "2024-01-23", level: 3 },
        { date: "2024-01-24", level: 5 },
      ],
    },
    wellness: {
      sleepScore: 78,
      stressLevel: 5,
      hydrationLevel: 85,
      recoveryScore: 82,
    },
    alerts: [
      { type: "warning", message: "Heart rate variability below optimal range", severity: "medium" },
      { type: "info", message: "Sleep quality improving over the past week", severity: "low" },
    ],
  })

  const getVitalStatus = (vital: string, value: number) => {
    switch (vital) {
      case "heartRate":
        if (value < 60) return { status: "low", color: "text-blue-600" }
        if (value > 100) return { status: "high", color: "text-red-600" }
        return { status: "normal", color: "text-green-600" }
      case "bloodPressure":
        if (value < 90) return { status: "low", color: "text-blue-600" }
        if (value > 140) return { status: "high", color: "text-red-600" }
        return { status: "normal", color: "text-green-600" }
      default:
        return { status: "normal", color: "text-green-600" }
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Health Metrics Dashboard</h2>
        <p className="text-gray-600">Comprehensive health monitoring and insights</p>
      </div>

      {/* Health Alerts */}
      {healthData.alerts.length > 0 && (
        <div className="space-y-3">
          {healthData.alerts.map((alert, index) => (
            <Card
              key={index}
              className={`border-l-4 ${
                alert.severity === "high"
                  ? "border-red-500 bg-red-50"
                  : alert.severity === "medium"
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-blue-500 bg-blue-50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {alert.severity === "high" ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : alert.severity === "medium" ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                  <p className="text-sm font-medium">{alert.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100/80 p-1 rounded-2xl">
          <TabsTrigger value="vitals" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Vital Signs
          </TabsTrigger>
          <TabsTrigger
            value="wellness"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Wellness
          </TabsTrigger>
          <TabsTrigger value="trends" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Trends
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Vital Signs */}
        <TabsContent value="vitals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-red-900">Heart Rate</CardTitle>
                <Heart className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">{healthData.vitals.restingHeartRate}</div>
                <p className="text-sm text-red-700">bpm (resting)</p>
                <div
                  className={`text-xs mt-2 ${getVitalStatus("heartRate", healthData.vitals.restingHeartRate).color}`}
                >
                  {getVitalStatus("heartRate", healthData.vitals.restingHeartRate).status.toUpperCase()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-blue-900">Blood Pressure</CardTitle>
                <Activity className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {healthData.vitals.bloodPressure.systolic}/{healthData.vitals.bloodPressure.diastolic}
                </div>
                <p className="text-sm text-blue-700">mmHg</p>
                <div
                  className={`text-xs mt-2 ${getVitalStatus("bloodPressure", healthData.vitals.bloodPressure.systolic).color}`}
                >
                  {getVitalStatus("bloodPressure", healthData.vitals.bloodPressure.systolic).status.toUpperCase()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-orange-900">Body Temperature</CardTitle>
                <Thermometer className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{healthData.vitals.bodyTemperature}°</div>
                <p className="text-sm text-orange-700">Celsius</p>
                <div className="text-xs mt-2 text-green-600">NORMAL</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-cyan-900">Oxygen Saturation</CardTitle>
                <Droplets className="h-5 w-5 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-900">{healthData.vitals.oxygenSaturation}%</div>
                <p className="text-sm text-cyan-700">SpO2</p>
                <div className="text-xs mt-2 text-green-600">EXCELLENT</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Wellness Scores */}
        <TabsContent value="wellness" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-purple-900">Sleep Score</CardTitle>
                <Moon className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{healthData.wellness.sleepScore}</div>
                <p className="text-sm text-purple-700">out of 100</p>
                <Progress value={healthData.wellness.sleepScore} className="mt-3 h-2" />
                <p className="text-xs text-purple-700 mt-2">Good quality sleep</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-green-900">Recovery Score</CardTitle>
                <Activity className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{healthData.wellness.recoveryScore}</div>
                <p className="text-sm text-green-700">out of 100</p>
                <Progress value={healthData.wellness.recoveryScore} className="mt-3 h-2" />
                <p className="text-xs text-green-700 mt-2">Well recovered</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-yellow-900">Stress Level</CardTitle>
                <Brain className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-900">{healthData.wellness.stressLevel}/10</div>
                <p className="text-sm text-yellow-700">Current level</p>
                <Progress value={healthData.wellness.stressLevel * 10} className="mt-3 h-2" />
                <p className="text-xs text-yellow-700 mt-2">Moderate stress</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-blue-900">Hydration</CardTitle>
                <Droplets className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{healthData.wellness.hydrationLevel}%</div>
                <p className="text-sm text-blue-700">Daily goal</p>
                <Progress value={healthData.wellness.hydrationLevel} className="mt-3 h-2" />
                <p className="text-xs text-blue-700 mt-2">Well hydrated</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Trends */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Heart Rate Trend
                </CardTitle>
                <CardDescription>Resting heart rate over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={healthData.trends.heartRateHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={["dataMin - 5", "dataMax + 5"]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Sleep Quality
                </CardTitle>
                <CardDescription>Sleep duration and quality scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={healthData.trends.sleepHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="quality"
                      stackId="2"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Stress Levels
                </CardTitle>
                <CardDescription>Daily stress level tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={healthData.trends.stressHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="level" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
              <CardHeader>
                <CardTitle>Health Summary</CardTitle>
                <CardDescription>Key insights from your health data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Heart Rate Variability</span>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Improving
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sleep Consistency</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    Good
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stress Management</span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                    Needs Attention
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recovery Rate</span>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Excellent
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Analysis */}
        <TabsContent value="analysis" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
            <CardHeader>
              <CardTitle>AI Health Analysis</CardTitle>
              <CardDescription>Personalized insights based on your health data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900 mb-2">Cardiovascular Health</h4>
                <p className="text-sm text-blue-800">
                  Your resting heart rate of {healthData.vitals.restingHeartRate} bpm indicates good cardiovascular
                  fitness. The slight variability in your recent readings suggests your body is adapting well to your
                  exercise routine.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-purple-900 mb-2">Sleep Optimization</h4>
                <p className="text-sm text-purple-800">
                  Your sleep score of {healthData.wellness.sleepScore} is good, but there's room for improvement.
                  Consider maintaining a consistent bedtime routine and limiting screen time before bed.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-medium text-yellow-900 mb-2">Stress Management</h4>
                <p className="text-sm text-yellow-800">
                  Your stress levels have been fluctuating. Consider incorporating stress-reduction techniques like
                  meditation, deep breathing, or regular physical activity into your routine.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-medium text-green-900 mb-2">Recovery & Performance</h4>
                <p className="text-sm text-green-800">
                  Your recovery score of {healthData.wellness.recoveryScore} indicates you're recovering well from
                  workouts. This suggests your current training load is appropriate for your fitness level.
                </p>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-4">Recommended Actions</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Continue current exercise routine - it's working well</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm">Focus on stress reduction techniques this week</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Aim for 7.5-8 hours of sleep for optimal recovery</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
