import { Document } from 'mongoose';

export interface Task extends Document {
  id: string;
  userId: string;
  assigneeId: string | null;
  assignedBy: string | null;
  assignedTo: string | null;
  departmentId: string | null;
  title: string;
  description: string;
  status: string;
  dueDate: Date;
  priority: string;
  category: string;
  reminder: Date | null;
  attachmentUrl: string;
  isDeleted: boolean;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
