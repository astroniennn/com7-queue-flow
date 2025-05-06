import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Users, Clock, Calendar, BarChart4, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { th } from "date-fns/locale";

// Type definitions
type QueueData = {
  id: string;
  ticket_number: number;
  name: string;
  phone_number: string;
  registered_at: string;
  estimated_wait_time: number;
  completed_at: string | null;
  status: "waiting" | "serving" | "completed" | "cancelled" | "skipped";
  service_type: string;
};

type ChartData = {
  name: string;
  customers: number;
  waitTime: number;
  serviceTime: number;
};

type ServiceTypeData = {
  name: string;
  value: number;
  fill: string;
};

type Stats = {
  totalCustomers: number;
  avgWaitTime: number;
  avgServiceTime: number;
  noShowRate: number;
  waitTimeChange: number;
  serviceTimeChange: number;
  customerChange: number;
};

// Colors for service type chart
const serviceTypeColors = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', 
  '#EC4899', '#8B5CF6', '#06B6D4', '#14B8A6', '#84CC16'
];

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const queryClient = useQueryClient();
  
  // Fetch queue data
  const { data: queueData, isLoading: isQueueDataLoading } = useQuery({
    queryKey: ['queueAnalytics'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('queue')
          .select(`
            id,
            ticket_number,
            name,
            phone_number,
            registered_at,
            completed_at,
            estimated_wait_time,
            status,
            service_types(name)
          `)
          .order('registered_at', { ascending: false });

        if (error) {
          throw error;
        }

        return data.map(item => ({
          id: item.id,
          ticket_number: item.ticket_number,
          name: item.name,
          phone_number: item.phone_number,
          registered_at: item.registered_at,
          completed_at: item.completed_at,
          estimated_wait_time: item.estimated_wait_time,
          status: item.status,
          service_type: item.service_types?.name || 'Unknown'
        })) as QueueData[];
      } catch (error) {
        console.error("Error fetching queue data for analytics:", error);
        toast.error("ไม่สามารถโหลดข้อมูลสำหรับการวิเคราะห์ได้");
        return [];
      }
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Process data for charts based on the selected time range
  const processedData = React.useMemo(() => {
    if (!queueData || queueData.length === 0) {
      return {
        chartData: [],
        serviceTypeData: [],
        stats: {
          totalCustomers: 0,
          avgWaitTime: 0,
          avgServiceTime: 0,
          noShowRate: 0,
          waitTimeChange: 0,
          serviceTimeChange: 0,
          customerChange: 0
        }
      };
    }

    // Filter data based on time range
    const now = new Date();
    let filteredData: QueueData[] = [];
    let previousPeriodData: QueueData[] = [];
    let dateFormatString = "";
    let intervalStart: Date;
    let intervalEnd: Date;
    let previousIntervalStart: Date;
    let previousIntervalEnd: Date;
    let timePoints: Date[] = [];

    if (timeRange === 'daily') {
      // Today's data
      intervalStart = new Date(now.setHours(0, 0, 0, 0));
      intervalEnd = new Date();
      previousIntervalStart = subDays(intervalStart, 1);
      previousIntervalEnd = intervalStart;
      dateFormatString = "HH:mm";
      
      // Create hourly intervals for today
      timePoints = Array.from({ length: 24 }, (_, i) => {
        const date = new Date(intervalStart);
        date.setHours(i, 0, 0, 0);
        return date;
      });
      
    } else if (timeRange === 'weekly') {
      // This week's data
      intervalStart = startOfWeek(now, { weekStartsOn: 1 });
      intervalEnd = new Date();
      previousIntervalStart = subDays(intervalStart, 7);
      previousIntervalEnd = intervalStart;
      dateFormatString = "EEE";
      
      // Create daily intervals for this week
      timePoints = eachDayOfInterval({ start: intervalStart, end: intervalEnd });
      
    } else { // monthly
      // This month's data
      intervalStart = startOfMonth(now);
      intervalEnd = new Date();
      previousIntervalStart = subMonths(intervalStart, 1);
      previousIntervalEnd = intervalStart;
      dateFormatString = "MMM d";
      
      // Create daily intervals for this month
      timePoints = eachDayOfInterval({ start: intervalStart, end: intervalEnd });
    }

    // Filter data for current period and previous period
    filteredData = queueData.filter(item => {
      const date = new Date(item.registered_at);
      return date >= intervalStart && date <= intervalEnd;
    });
    
    previousPeriodData = queueData.filter(item => {
      const date = new Date(item.registered_at);
      return date >= previousIntervalStart && date < previousIntervalEnd;
    });

    // Prepare chart data based on the time points
    const chartData: ChartData[] = timePoints.map(timePoint => {
      // For each time point, filter data that falls within that interval
      let intervalData: QueueData[] = [];
      
      if (timeRange === 'daily') {
        // For daily view, group by hour
        intervalData = filteredData.filter(item => {
          const date = new Date(item.registered_at);
          return date.getHours() === timePoint.getHours();
        });
      } else if (timeRange === 'weekly') {
        // For weekly view, group by day
        intervalData = filteredData.filter(item => {
          const date = new Date(item.registered_at);
          return date.getDate() === timePoint.getDate() && 
                 date.getMonth() === timePoint.getMonth();
        });
      } else { // monthly
        // For monthly view, group by day
        intervalData = filteredData.filter(item => {
          const date = new Date(item.registered_at);
          return date.getDate() === timePoint.getDate() && 
                 date.getMonth() === timePoint.getMonth();
        });
      }
      
      // Calculate metrics for this interval
      const customers = intervalData.length;
      
      // Average wait time based on estimated_wait_time
      const avgWaitTime = customers > 0 
        ? Math.round(intervalData.reduce((sum, item) => sum + item.estimated_wait_time, 0) / customers) 
        : 0;
      
      // Average service time based on completed tickets
      const completedTickets = intervalData.filter(item => item.status === 'completed' && item.completed_at);
      const serviceTimeSum = completedTickets.reduce((sum, item) => {
        if (item.completed_at) {
          const completedTime = new Date(item.completed_at).getTime();
          const registeredTime = new Date(item.registered_at).getTime();
          // Convert milliseconds to minutes
          return sum + ((completedTime - registeredTime) / (1000 * 60));
        }
        return sum;
      }, 0);
      
      const avgServiceTime = completedTickets.length > 0 
        ? Math.round(serviceTimeSum / completedTickets.length) 
        : 0;
      
      return {
        name: format(timePoint, dateFormatString, { locale: th }),
        customers,
        waitTime: avgWaitTime,
        serviceTime: avgServiceTime
      };
    });
    
    // Prepare service type distribution data
    const serviceTypes = filteredData.reduce((acc, item) => {
      acc[item.service_type] = (acc[item.service_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = filteredData.length;
    
    const serviceTypeData: ServiceTypeData[] = Object.entries(serviceTypes)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / (total || 1)) * 100),
        fill: serviceTypeColors[index % serviceTypeColors.length]
      }))
      .sort((a, b) => b.value - a.value);
    
    // Calculate overall stats
    const totalCustomers = filteredData.length;
    const avgWaitTime = totalCustomers > 0 
      ? Math.round(filteredData.reduce((sum, item) => sum + item.estimated_wait_time, 0) / totalCustomers) 
      : 0;
    
    const completedItems = filteredData.filter(item => item.status === 'completed' && item.completed_at);
    
    const serviceTimeSum = completedItems.reduce((sum, item) => {
      if (item.completed_at) {
        const completedTime = new Date(item.completed_at).getTime();
        const registeredTime = new Date(item.registered_at).getTime();
        return sum + ((completedTime - registeredTime) / (1000 * 60));
      }
      return sum;
    }, 0);
    
    const avgServiceTime = completedItems.length > 0 
      ? Math.round(serviceTimeSum / completedItems.length) 
      : 0;
    
    const noShows = filteredData.filter(item => item.status === 'cancelled' || item.status === 'skipped').length;
    const noShowRate = totalCustomers > 0 ? Math.round((noShows / totalCustomers) * 100) : 0;
    
    // Calculate change percentages
    const prevTotal = previousPeriodData.length;
    const customerChange = prevTotal > 0 
      ? Math.round(((totalCustomers - prevTotal) / prevTotal) * 100) 
      : 0;
    
    const prevWaitItems = previousPeriodData.length;
    const prevAvgWaitTime = prevWaitItems > 0 
      ? Math.round(previousPeriodData.reduce((sum, item) => sum + item.estimated_wait_time, 0) / prevWaitItems) 
      : 0;
    const waitTimeChange = prevAvgWaitTime > 0 
      ? Math.round(((avgWaitTime - prevAvgWaitTime) / prevAvgWaitTime) * 100) 
      : 0;
    
    const prevCompletedItems = previousPeriodData.filter(item => item.status === 'completed' && item.completed_at);
    const prevServiceTimeSum = prevCompletedItems.reduce((sum, item) => {
      if (item.completed_at) {
        const completedTime = new Date(item.completed_at).getTime();
        const registeredTime = new Date(item.registered_at).getTime();
        return sum + ((completedTime - registeredTime) / (1000 * 60));
      }
      return sum;
    }, 0);
    
    const prevAvgServiceTime = prevCompletedItems.length > 0 
      ? Math.round(prevServiceTimeSum / prevCompletedItems.length) 
      : 0;
    const serviceTimeChange = prevAvgServiceTime > 0 
      ? Math.round(((avgServiceTime - prevAvgServiceTime) / prevAvgServiceTime) * 100) 
      : 0;
    
    return {
      chartData,
      serviceTypeData,
      stats: {
        totalCustomers,
        avgWaitTime,
        avgServiceTime,
        noShowRate,
        waitTimeChange,
        serviceTimeChange,
        customerChange
      }
    };
  }, [queueData, timeRange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">วิเคราะห์ข้อมูลคิว</h2>
        <p className="text-gray-500">ติดตามประสิทธิภาพของคิวและตัวชี้วัดการบริการลูกค้า</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนลูกค้าทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-com7-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.stats.totalCustomers}</div>
            <p className="text-xs text-gray-500">
              {timeRange === 'daily' ? 'วันนี้' : timeRange === 'weekly' ? 'สัปดาห์นี้' : 'เดือนนี้'}
            </p>
            <div className={`text-xs flex items-center mt-1 ${processedData.stats.customerChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {processedData.stats.customerChange >= 0 ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              <span>{Math.abs(processedData.stats.customerChange)}% เปลี่ยนแปลง</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เวลารอคิวเฉลี่ย</CardTitle>
            <Clock className="h-4 w-4 text-com7-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.stats.avgWaitTime} นาที</div>
            <p className="text-xs text-gray-500">
              {timeRange === 'daily' ? 'วันนี้' : timeRange === 'weekly' ? 'สัปดาห์นี้' : 'เดือนนี้'}
            </p>
            <div className={`text-xs flex items-center mt-1 ${processedData.stats.waitTimeChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {processedData.stats.waitTimeChange <= 0 ? (
                <ArrowDown className="h-3 w-3 mr-1" />
              ) : (
                <ArrowUp className="h-3 w-3 mr-1" />
              )}
              <span>{Math.abs(processedData.stats.waitTimeChange)}% เปลี่ยนแปลง</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เวลาให้บริการเฉลี่ย</CardTitle>
            <Activity className="h-4 w-4 text-com7-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.stats.avgServiceTime} นาที</div>
            <p className="text-xs text-gray-500">
              {timeRange === 'daily' ? 'วันนี้' : timeRange === 'weekly' ? 'สัปดาห์นี้' : 'เดือนนี้'}
            </p>
            <div className={`text-xs flex items-center mt-1 ${processedData.stats.serviceTimeChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {processedData.stats.serviceTimeChange <= 0 ? (
                <ArrowDown className="h-3 w-3 mr-1" />
              ) : (
                <ArrowUp className="h-3 w-3 mr-1" />
              )}
              <span>{Math.abs(processedData.stats.serviceTimeChange)}% เปลี่ยนแปลง</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อัตราการไม่มาใช้บริการ</CardTitle>
            <BarChart4 className="h-4 w-4 text-com7-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.stats.noShowRate}%</div>
            <p className="text-xs text-gray-500">
              {timeRange === 'daily' ? 'วันนี้' : timeRange === 'weekly' ? 'สัปดาห์นี้' : 'เดือนนี้'}
            </p>
            <div className="text-xs text-gray-500 mt-1">
              จากสถานะ 'ยกเลิก' และ 'ข้ามคิว'
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4" value={timeRange} onValueChange={(v) => setTimeRange(v as 'daily' | 'weekly' | 'monthly')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="daily">รายวัน</TabsTrigger>
            <TabsTrigger value="weekly">รายสัปดาห์</TabsTrigger>
            <TabsTrigger value="monthly">รายเดือน</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['queueAnalytics'] });
                toast.success("รีเฟรชข้อมูลวิเคราะห์แล้ว");
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              รีเฟรชข้อมูล
            </Button>
          </div>
        </div>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>จำนวนลูกค้า</CardTitle>
              <CardDescription>จำนวนลูกค้าตามช่วงเวลาของวันนี้</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isQueueDataLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                  </div>
                ) : processedData.chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">ไม่มีข้อมูลสำหรับวันนี้</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedData.chartData}>
                      <defs>
                        <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="customers" 
                        name="จำนวนลูกค้า"
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#colorCustomers)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>เวลารอคิวเฉลี่ย</CardTitle>
                <CardDescription>ระยะเวลาที่ลูกค้ารอก่อนได้รับบริการ (นาที)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {isQueueDataLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : processedData.chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">ไม่มีข้อมูลสำหรับวันนี้</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processedData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="waitTime" 
                          name="เวลารอคิวเฉลี่ย (นาที)"
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ประเภทการให้บริการ</CardTitle>
                <CardDescription>การแบ่งตามประเภทบริการ (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {isQueueDataLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : processedData.serviceTypeData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">ไม่มีข้อมูลสำหรับวันนี้</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData.serviceTypeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="เปอร์เซ็นต์" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>จำนวนลูกค้ารายวัน</CardTitle>
              <CardDescription>จำนวนลูกค้าในแต่ละวันของสัปดาห์นี้</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isQueueDataLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                  </div>
                ) : processedData.chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">ไม่มีข้อมูลสำหรับสัปดาห์นี้</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedData.chartData}>
                      <defs>
                        <linearGradient id="colorWeeklyCustomers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="customers" 
                        name="จำนวนลูกค้า"
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#colorWeeklyCustomers)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>เวลาให้บริการต่อวัน</CardTitle>
                <CardDescription>เวลาให้บริการเฉลี่ยต่อวัน (นาที)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {isQueueDataLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : processedData.chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">ไม่มีข้อมูลสำหรับสัปดาห์นี้</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processedData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="serviceTime" 
                          name="เวลาให้บริการเฉลี่ย (นาที)"
                          stroke="#10B981" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>เวลารอคิวต่อวัน</CardTitle>
                <CardDescription>เวลารอคิวเฉลี่ยต่อวัน (นาที)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {isQueueDataLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : processedData.chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">ไม่มีข้อมูลสำหรับสัปดาห์นี้</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processedData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="waitTime" 
                          name="เวลารอคิวเฉลี่ย (นาที)"
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>จำนวนลูกค้ารายวัน</CardTitle>
              <CardDescription>จำนวนลูกค้าในแต่ละวันของเดือนนี้</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isQueueDataLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                  </div>
                ) : processedData.chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">ไม่มีข้อมูลสำหรับเดือนนี้</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedData.chartData}>
                      <defs>
                        <linearGradient id="colorMonthlyCustomers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="customers" 
                        name="จำนวนลูกค้า"
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#colorMonthlyCustomers)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ประสิทธิภาพการให้บริการ</CardTitle>
                <CardDescription>เวลารอคิวและให้บริการเฉลี่ยต่อวัน (นาที)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {isQueueDataLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : processedData.chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">ไม่มีข้อมูลสำหรับเดือนนี้</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processedData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="waitTime" 
                          name="เวลารอคิวเฉลี่ย" 
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="serviceTime" 
                          name="เวลาให้บริการเฉลี่ย" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>ประเภทการให้บริการ</CardTitle>
                <CardDescription>การแบ่งตามประเภทบริการ (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {isQueueDataLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : processedData.serviceTypeData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">ไม่มีข้อมูลสำหรับเดือนนี้</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData.serviceTypeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="เปอร์เซ็นต์" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
