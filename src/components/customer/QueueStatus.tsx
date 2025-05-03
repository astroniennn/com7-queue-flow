
import React from "react";
import { QueueStatusCard } from "./queue/QueueStatusCard";
import { QueueData } from "@/hooks/useQueueRealtime";

type QueueStatusProps = {
  queueData: QueueData;
  updateQueueData: (updatedData: QueueData) => void;
};

export const QueueStatus: React.FC<QueueStatusProps> = ({ queueData, updateQueueData }) => {
  return <QueueStatusCard queueData={queueData} updateQueueData={updateQueueData} />;
};
