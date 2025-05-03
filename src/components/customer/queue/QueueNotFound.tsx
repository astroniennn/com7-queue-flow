
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const QueueNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-md mx-auto flex flex-col items-center justify-center pt-20">
      <div className="text-xl font-semibold text-red-500 mb-4">ไม่พบข้อมูลคิว</div>
      <p className="text-gray-600 mb-6">เราไม่พบคิวที่คุณต้องการ คิวอาจถูกยกเลิกหรือหมดอายุแล้ว</p>
      <Button onClick={() => navigate("/")}>กลับไปยังหน้าหลัก</Button>
    </div>
  );
};
