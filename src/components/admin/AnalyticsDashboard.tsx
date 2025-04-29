
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Users, Clock, Calendar, BarChart4, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for charts
const dailyData = [
  { name: '9 AM', customers: 12, waitTime: 8, serviceTime: 12 },
  { name: '10 AM', customers: 19, waitTime: 10, serviceTime: 14 },
  { name: '11 AM', customers: 30, waitTime: 15, serviceTime: 11 },
  { name: '12 PM', customers: 27, waitTime: 18, serviceTime: 13 },
  { name: '1 PM', customers: 18, waitTime: 16, serviceTime: 15 },
  { name: '2 PM', customers: 23, waitTime: 12, serviceTime: 14 },
  { name: '3 PM', customers: 34, waitTime: 10, serviceTime: 10 },
  { name: '4 PM', customers: 25, waitTime: 11, serviceTime: 12 },
  { name: '5 PM', customers: 15, waitTime: 9, serviceTime: 11 },
];

const weeklyData = [
  { name: 'Mon', customers: 80, waitTime: 12, serviceTime: 13 },
  { name: 'Tue', customers: 95, waitTime: 10, serviceTime: 12 },
  { name: 'Wed', customers: 110, waitTime: 14, serviceTime: 15 },
  { name: 'Thu', customers: 100, waitTime: 13, serviceTime: 14 },
  { name: 'Fri', customers: 120, waitTime: 15, serviceTime: 16 },
  { name: 'Sat', customers: 140, waitTime: 20, serviceTime: 18 },
  { name: 'Sun', customers: 90, waitTime: 18, serviceTime: 15 },
];

const monthlyData = [
  { name: 'Jan', customers: 2100, waitTime: 14, serviceTime: 15 },
  { name: 'Feb', customers: 2400, waitTime: 13, serviceTime: 14 },
  { name: 'Mar', customers: 2200, waitTime: 15, serviceTime: 16 },
  { name: 'Apr', customers: 2700, waitTime: 12, serviceTime: 13 },
  { name: 'May', customers: 2900, waitTime: 14, serviceTime: 15 },
  { name: 'Jun', customers: 3100, waitTime: 15, serviceTime: 16 },
];

const serviceTypeData = [
  { name: 'Product Inquiry', value: 25, fill: '#3B82F6' },
  { name: 'Technical Support', value: 35, fill: '#8B5CF6' },
  { name: 'Returns & Exchanges', value: 15, fill: '#10B981' },
  { name: 'Warranty Claims', value: 10, fill: '#F59E0B' },
  { name: 'Billing Issues', value: 15, fill: '#EF4444' },
];

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <p className="text-gray-500">Monitor queue performance and customer service metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-com7-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,451</div>
            <p className="text-xs text-gray-500">+18% from last month</p>
            <div className="text-xs flex items-center text-green-600 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>12% increase</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-com7-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.3 min</div>
            <p className="text-xs text-gray-500">Last 30 days</p>
            <div className="text-xs flex items-center text-red-600 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>2.1 min increase</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Service Time</CardTitle>
            <Activity className="h-4 w-4 text-com7-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.2 min</div>
            <p className="text-xs text-gray-500">Last 30 days</p>
            <div className="text-xs flex items-center text-green-600 mt-1">
              <ArrowDown className="h-3 w-3 mr-1" />
              <span>1.5 min decrease</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-shows</CardTitle>
            <BarChart4 className="h-4 w-4 text-com7-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-gray-500">Last 30 days</p>
            <div className="text-xs flex items-center text-green-600 mt-1">
              <ArrowDown className="h-3 w-3 mr-1" />
              <span>0.8% decrease</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </div>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Flow</CardTitle>
              <CardDescription>Number of customers per hour today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
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
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorCustomers)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Average Wait Time</CardTitle>
                <CardDescription>Minutes customers wait before service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="waitTime" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Type Distribution</CardTitle>
                <CardDescription>Breakdown by service category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Percentage" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Customer Flow</CardTitle>
              <CardDescription>Number of customers per day this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
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
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorWeeklyCustomers)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional weekly charts would go here */}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Customer Flow</CardTitle>
              <CardDescription>Number of customers per month this year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
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
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorMonthlyCustomers)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional monthly charts would go here */}
        </TabsContent>
      </Tabs>
    </div>
  );
};
