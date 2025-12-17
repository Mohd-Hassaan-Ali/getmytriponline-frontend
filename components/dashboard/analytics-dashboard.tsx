"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsDashboardProps {
  data: {
    totalBookings: number;
    totalRevenue: number;
    activeUsers: number;
    averageBookingValue: number;
  };
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const kpiCards = [
    {
      title: "Total Bookings",
      value: data.totalBookings.toLocaleString(),
      change: "+12.5%",
      icon: "✈️",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Total Revenue",
      value: `₹${(data.totalRevenue / 1000000).toFixed(1)}M`,
      change: "+18.2%",
      icon: "💰",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Active Users",
      value: data.activeUsers.toLocaleString(),
      change: "+8.1%",
      icon: "👥",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Avg Booking Value",
      value: `₹${data.averageBookingValue.toLocaleString()}`,
      change: "+5.4%",
      icon: "📈",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <span className="text-2xl">{kpi.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-green-600 font-medium">
                {kpi.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Business Overview</CardTitle>
              <CardDescription>Key metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">This Month</h4>
                    <p className="text-2xl font-bold text-blue-600">{data.totalBookings}</p>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Revenue</h4>
                    <p className="text-2xl font-bold text-green-600">₹{(data.totalRevenue/1000).toFixed(0)}K</p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}