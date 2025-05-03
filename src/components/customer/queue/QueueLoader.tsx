
import React from "react";

export const QueueLoader: React.FC = () => {
  return (
    <div className="max-w-md mx-auto flex flex-col items-center justify-center pt-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-com7-primary"></div>
      <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลคิว...</p>
    </div>
  );
};
