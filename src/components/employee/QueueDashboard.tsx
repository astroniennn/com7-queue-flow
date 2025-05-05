import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Play, 
  Check, 
  X, 
  Clock, 
  SkipForward, 
  Bell, 
  Search,
  RefreshCw,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Customer = {
  id: string;
  ticket_number: number;
  name: string;
  phone_number: string;
  service_type: string;
  registered_at: string;
  estimated_wait_time: number;
  status: "waiting" | "serving" | "completed" | "cancelled" | "skipped";
};

export const QueueDashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<string>("waiting");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isClearingQueues, setIsClearingQueues] = useState<boolean>(false);
  const [isEndDayDialogOpen, setIsEndDayDialogOpen] = useState<boolean>(false);
  
  // Stats
  const [todayStats, setTodayStats] = useState({
    total: 0,
    waiting: 0,
    serving: 0,
    completed: 0,
    cancelled: 0,
    skipped: 0,
    avgWaitTime: 0
  });
  
  const fetchQueueData = async () => {
    setIsLoading(true);
    try {
      // Fetch queue data with service type name joined
      const { data: queueData, error: queueError } = await supabase
        .from('queue')
        .select(`
          id,
          ticket_number,
          name,
          phone_number,
          registered_at,
          estimated_wait_time,
          status,
          completed_at,
          service_types(name)
        `)
        .order('ticket_number', { ascending: true });

      if (queueError) {
        throw queueError;
      }

      // Transform the data to match our Customer type
      const transformedData = queueData.map(item => ({
        id: item.id,
        ticket_number: item.ticket_number,
        name: item.name,
        phone_number: item.phone_number,
        service_type: item.service_types.name,
        registered_at: item.registered_at,
        estimated_wait_time: item.estimated_wait_time,
        status: item.status as "waiting" | "serving" | "completed" | "cancelled" | "skipped"
      }));

      setCustomers(transformedData);
      calculateStats(transformedData);
    } catch (error) {
      console.error("Error fetching queue data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลคิวได้");
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateStats = (data: Customer[]) => {
    const stats = {
      total: data.length,
      waiting: data.filter(c => c.status === "waiting").length,
      serving: data.filter(c => c.status === "serving").length,
      completed: data.filter(c => c.status === "completed").length,
      cancelled: data.filter(c => c.status === "cancelled").length,
      skipped: data.filter(c => c.status === "skipped").length,
      avgWaitTime: 0
    };
    
    // Calculate average wait time from estimated wait times
    const waitingCustomers = data.filter(c => c.status === "waiting" || c.status === "serving");
    if (waitingCustomers.length > 0) {
      stats.avgWaitTime = Math.round(
        waitingCustomers.reduce((acc, curr) => acc + curr.estimated_wait_time, 0) / waitingCustomers.length
      );
    }
    
    setTodayStats(stats);
  };
  
  useEffect(() => {
    fetchQueueData();
    
    // Set up real-time subscription for queue updates
    const queueSubscription = supabase
      .channel('public:queue')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'queue' 
      }, () => {
        fetchQueueData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(queueSubscription);
    };
  }, []);
  
  const handleCallNext = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ status: 'serving' })
        .eq('id', customer.id);
      
      if (error) throw error;
      
      toast.success(`กำลังให้บริการ ${customer.name}`);
      fetchQueueData();
    } catch (error) {
      console.error("Error updating customer status:", error);
      toast.error("ไม่สามารถอัปเดตสถานะลูกค้าได้");
    }
  };
  
  const handleStartService = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ status: 'serving' })
        .eq('id', customer.id);
      
      if (error) throw error;
      
      toast.success(`เริ่มให้บริการ ${customer.name}`);
      fetchQueueData();
    } catch (error) {
      console.error("Error updating customer status:", error);
      toast.error("ไม่สามารถอัปเดตสถานะลูกค้าได้");
    }
  };
  
  const handleCompleteService = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', customer.id);
      
      if (error) throw error;
      
      toast.success(`ให้บริการ ${customer.name} เสร็จสิ้น`);
      fetchQueueData();
    } catch (error) {
      console.error("Error completing service:", error);
      toast.error("ไม่สามารถเสร็จสิ้นการให้บริการได้");
    }
  };
  
  const handleSkipCustomer = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ status: 'skipped' })
        .eq('id', customer.id);
      
      if (error) throw error;
      
      toast.info(`ข้ามคิวของ ${customer.name} แล้ว`);
      fetchQueueData();
    } catch (error) {
      console.error("Error skipping customer:", error);
      toast.error("ไม่สามารถข้ามคิวลูกค้าได้");
    }
  };
  
  const handleCancelService = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ status: 'cancelled' })
        .eq('id', customer.id);
      
      if (error) throw error;
      
      toast.info(`ยกเลิกการให้บริการ ${customer.name} แล้ว`);
      fetchQueueData();
    } catch (error) {
      console.error("Error cancelling service:", error);
      toast.error("ไม่สามารถยกเลิกการให้บริการได้");
    }
  };
  
  const handleRefresh = () => {
    fetchQueueData();
    toast.success("รีเฟรชข้อมูลคิวแล้ว");
  };

  const handleEndOfDay = async () => {
    setIsClearingQueues(true);
    try {
      // Find all waiting and serving customers
      const activeCustomers = customers.filter(
        c => c.status === "waiting" || c.status === "serving"
      );
      
      if (activeCustomers.length === 0) {
        toast.info("ไม่มีคิวที่รอหรือกำลังให้บริการ");
        setIsEndDayDialogOpen(false);
        return;
      }
      
      // Update all active customers to cancelled status
      const { error } = await supabase
        .from('queue')
        .update({ 
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .in('id', activeCustomers.map(c => c.id));
      
      if (error) throw error;
      
      toast.success(`รีเซตคิวทั้งหมด ${activeCustomers.length} คิวสำเร็จแล้ว`);
      fetchQueueData();
      setIsEndDayDialogOpen(false);
    } catch (error) {
      console.error("Error clearing queues:", error);
      toast.error("ไม่สามารถรีเซตคิวได้");
    } finally {
      setIsClearingQueues(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">รอคิว</Badge>;
      case "serving":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">กำลังให้บริการ</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">เสร็จสิ้น</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">ยกเลิก</Badge>;
      case "skipped":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">ข้ามคิว</Badge>;
      default:
        return <Badge variant="outline">ไม่ทราบ</Badge>;
    }
  };
  
  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone_number.includes(query) ||
      customer.ticket_number.toString().includes(query)
    );
  });
  
  const getTabCount = (status: string) => {
    return customers.filter(c => c.status === status).length;
  };
  
  const renderCustomerList = (status?: string) => {
    let filtered = filteredCustomers;
    
    if (status) {
      filtered = filteredCustomers.filter(c => c.status === status);
    }
    
    if (filtered.length === 0) {
      return (
        <div className="py-10 text-center text-gray-500">
          <p>ไม่พบข้อมูลลูกค้า</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {filtered.map((customer) => (
          <Card key={customer.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-4 md:w-2/3">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-lg">#{customer.ticket_number}</span>
                      {getStatusBadge(customer.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(customer.registered_at).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1 mb-2">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.phone_number}</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="px-2 py-1 bg-com7-light-gray rounded text-xs text-gray-600">
                      {customer.service_type}
                    </div>
                    <div className="flex items-center ml-3 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      ประมาณ: {customer.estimated_wait_time} นาที
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 flex items-center justify-around md:w-1/3">
                  {customer.status === "waiting" && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => handleCallNext(customer)}
                        className="bg-com7-primary hover:bg-com7-primary-dark"
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        เรียกคิว
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleSkipCustomer(customer)}
                        className="border-gray-300 text-gray-700"
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        ข้ามคิว
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelService(customer)}
                        className="border-red-300 text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {customer.status === "serving" && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => handleCompleteService(customer)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        เสร็จสิ้น
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelService(customer)}
                        className="border-red-300 text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {(customer.status === "completed" || customer.status === "cancelled" || customer.status === "skipped") && (
                    <span className="text-sm text-gray-500">
                      ไม่มีการดำเนินการที่ใช้ได้
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">แดชบอร์ดคิว</h2>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            className="flex items-center"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "กำลังรีเฟรช..." : "รีเฟรช"}
          </Button>
          
          <Dialog open={isEndDayDialogOpen} onOpenChange={setIsEndDayDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                รีเซตคิวเพื่อเริ่มต้นใหม่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ยืนยันการรีเซตคิวเพื่อเริ่มต้นใหม่</DialogTitle>
                <DialogDescription>
                  การดำเนินการนี้จะยกเลิกคิวที่รอและกำลังให้บริการทั้งหมด ไม่สามารถยกเลิกได้หลังจากดำเนินการแล้ว
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 flex items-center justify-center text-amber-600">
                <AlertTriangle className="h-12 w-12" />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEndDayDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleEndOfDay}
                  disabled={isClearingQueues}
                >
                  {isClearingQueues ? "กำลังรีเซตคิว..." : "ยืนยันรีเซตคิว"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-center">รอคิว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-amber-500">
              {getTabCount("waiting")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-center">กำลังให้บริการ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-com7-primary">
              {getTabCount("serving")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-center">เสร็จสิ้นวันนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-green-600">
              {getTabCount("completed")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-center">เวลารอเฉลี่ย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-purple-600">
              {todayStats.avgWaitTime} <span className="text-lg">นาที</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="ค้นหาด้วยชื่อ เบอร์โทร หรือเลขคิว"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="waiting" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 md:w-[400px]">
              <TabsTrigger value="waiting" className="flex items-center">
                รอคิว
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-amber-100 text-amber-800 rounded-full">
                  {getTabCount("waiting")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="serving">
                กำลังให้บริการ
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {getTabCount("serving")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed">
                เสร็จสิ้น
              </TabsTrigger>
              <TabsTrigger value="all">
                ทั้งหมด
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 mb-2"></div>
              <div className="text-gray-400">กำลังโหลดข้อมูลคิว...</div>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="waiting">
              {renderCustomerList("waiting")}
            </TabsContent>
            <TabsContent value="serving">
              {renderCustomerList("serving")}
            </TabsContent>
            <TabsContent value="completed">
              {renderCustomerList("completed")}
            </TabsContent>
            <TabsContent value="all">
              {renderCustomerList()}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};
