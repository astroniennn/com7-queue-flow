
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Play, 
  Check, 
  X, 
  Clock, 
  SkipForward, 
  Bell, 
  Search,
  RefreshCw
} from "lucide-react";

type Customer = {
  id: string;
  ticketNumber: number;
  name: string;
  phoneNumber: string;
  serviceType: string;
  registeredAt: string;
  estimatedWaitTime: number;
  status: "waiting" | "serving" | "completed" | "cancelled" | "skipped";
};

const generateMockCustomers = (): Customer[] => {
  const statuses: Array<"waiting" | "serving" | "completed" | "cancelled" | "skipped"> = [
    "waiting", "waiting", "waiting", "waiting", "waiting", 
    "serving", "serving", 
    "completed", "completed", "completed", 
    "cancelled", "skipped"
  ];
  
  const serviceTypes = [
    "Product Inquiry", 
    "Technical Support", 
    "Returns & Exchanges", 
    "Warranty Claims", 
    "Billing Issues"
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const now = new Date();
    const registeredAt = new Date(now.setHours(now.getHours() - Math.floor(Math.random() * 4)));
    
    return {
      id: `cust-${i + 1}`,
      ticketNumber: 10001 + i,
      name: `Customer ${i + 1}`,
      phoneNumber: `123-456-${7000 + i}`,
      serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
      registeredAt: registeredAt.toISOString(),
      estimatedWaitTime: 10 + Math.floor(Math.random() * 20),
      status: statuses[i]
    };
  });
};

export const QueueDashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<string>("waiting");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  useEffect(() => {
    // In a real application, this would be an API call
    const loadData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setCustomers(generateMockCustomers());
        setIsLoading(false);
      }, 1000);
    };
    
    loadData();
    
    // Set up auto-refresh (every 30 seconds in a real app)
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleCallNext = (customer: Customer) => {
    setCustomers(prev => 
      prev.map(c => c.id === customer.id ? { ...c, status: "serving" } : c)
    );
    toast.success(`Now serving ${customer.name}`);
    
    // In a real app, this would notify the customer that it's their turn
  };
  
  const handleStartService = (customer: Customer) => {
    setCustomers(prev => 
      prev.map(c => c.id === customer.id ? { ...c, status: "serving" } : c)
    );
    toast.success(`Service started for ${customer.name}`);
  };
  
  const handleCompleteService = (customer: Customer) => {
    setCustomers(prev => 
      prev.map(c => c.id === customer.id ? { ...c, status: "completed" } : c)
    );
    toast.success(`Service completed for ${customer.name}`);
  };
  
  const handleSkipCustomer = (customer: Customer) => {
    setCustomers(prev => 
      prev.map(c => c.id === customer.id ? { ...c, status: "skipped" } : c)
    );
    toast.info(`${customer.name} has been skipped`);
  };
  
  const handleCancelService = (customer: Customer) => {
    setCustomers(prev => 
      prev.map(c => c.id === customer.id ? { ...c, status: "cancelled" } : c)
    );
    toast.info(`Service cancelled for ${customer.name}`);
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCustomers(generateMockCustomers());
      setIsLoading(false);
      toast.success("Queue data refreshed");
    }, 1000);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Waiting</Badge>;
      case "serving":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Serving</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>;
      case "skipped":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Skipped</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phoneNumber.includes(query) ||
      customer.ticketNumber.toString().includes(query)
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
          <p>No customers found</p>
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
                      <span className="font-semibold text-lg">#{customer.ticketNumber}</span>
                      {getStatusBadge(customer.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(customer.registeredAt).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1 mb-2">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.phoneNumber}</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="px-2 py-1 bg-com7-light-gray rounded text-xs text-gray-600">
                      {customer.serviceType}
                    </div>
                    <div className="flex items-center ml-3 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      Est: {customer.estimatedWaitTime} min
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
                        Call
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleSkipCustomer(customer)}
                        className="border-gray-300 text-gray-700"
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Skip
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
                        Complete
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
                      No actions available
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
        <h2 className="text-2xl font-bold text-gray-800">Queue Dashboard</h2>
        <Button 
          size="sm" 
          variant="outline"
          className="flex items-center"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-center">Waiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-amber-500">
              {getTabCount("waiting")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-center">Now Serving</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-com7-primary">
              {getTabCount("serving")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-center">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-green-600">
              {getTabCount("completed")}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by name, phone or ticket #"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="waiting" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 md:w-[400px]">
              <TabsTrigger value="waiting" className="flex items-center">
                Waiting
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-amber-100 text-amber-800 rounded-full">
                  {getTabCount("waiting")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="serving">
                Serving
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {getTabCount("serving")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
              </TabsTrigger>
              <TabsTrigger value="all">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 mb-2"></div>
              <div className="text-gray-400">Loading queue data...</div>
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
