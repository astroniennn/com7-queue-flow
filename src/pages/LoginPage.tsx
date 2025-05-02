import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    login,
    isAuthenticated
  } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    setLoading(true);
    try {
      const success = await login(formData.username, formData.password);
      if (success) {
        toast.success("เข้าสู่ระบบสำเร็จ!");
        navigate("/dashboard");
      } else {
        toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง");
      }
    } catch (error) {
      toast.error("เข้าสู่ระบบล้มเหลว กรุณาลองอีกครั้งในภายหลัง");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-com7-primary">Com7 QUEUE</span> ระบบจัดการคิว
          </h1>
          <p className="mt-2 text-gray-600">
            เข้าสู่ระบบเพื่อจัดการคิว
          </p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
            <CardDescription>
              กรอกข้อมูลเพื่อเข้าถึงแผงควบคุม
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้</Label>
                <Input id="username" name="username" placeholder="กรอกชื่อผู้ใช้ของคุณ" value={formData.username} onChange={handleInputChange} required />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <Button variant="link" className="p-0 h-auto text-xs text-com7-primary">
                    ลืมรหัสผ่าน?
                  </Button>
                </div>
                <Input id="password" name="password" type="password" placeholder="กรอกรหัสผ่านของคุณ" value={formData.password} onChange={handleInputChange} required />
              </div>

              <CardFooter className="px-0 pt-4">
                <Button type="submit" className="w-full bg-com7-primary hover:bg-com7-primary-dark" disabled={loading}>
                  {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
              </CardFooter>
            </form>
            
            <div className="mt-6 text-center">
              <div className="text-sm">
                
                <ul className="mt-2 space-y-1">
                  
                  
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => navigate("/")} className="text-gray-600">
            &larr; กลับไปยังหน้าลูกค้า
          </Button>
        </div>
      </div>
    </div>;
};
export default LoginPage;