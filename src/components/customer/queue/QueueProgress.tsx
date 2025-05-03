
import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

type QueueProgressProps = {
  estimatedWaitTime: number;
  position: number;
};

export const QueueProgress: React.FC<QueueProgressProps> = ({
  estimatedWaitTime,
  position,
}) => {
  const [remainingTime, setRemainingTime] = useState<number>(estimatedWaitTime * position);
  const [elapsedPercent, setElapsedPercent] = useState<number>(0);
  
  // For time calculation
  useEffect(() => {
    const totalWaitTime = estimatedWaitTime * position;
    setRemainingTime(totalWaitTime);
    
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [estimatedWaitTime, position]);
  
  // Calculate progress percentage
  useEffect(() => {
    const totalWaitTime = estimatedWaitTime * position;
    const elapsed = totalWaitTime - remainingTime;
    const percent = (elapsed / totalWaitTime) * 100;
    setElapsedPercent(Math.min(percent, 100));
  }, [remainingTime, estimatedWaitTime, position]);

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Clock className="h-5 w-5 text-com7-primary mr-2" />
        <div>
          <div className="text-sm text-gray-500">เวลารอโดยประมาณ</div>
          <div className="font-medium">{remainingTime} นาที</div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>ความคืบหน้า</span>
          <span>{Math.round(elapsedPercent)}%</span>
        </div>
        <Progress value={elapsedPercent} className="h-2" />
      </div>
    </div>
  );
};
