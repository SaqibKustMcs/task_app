import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateStringId } from '../../utils/utils';

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @Prop({ type: String, default: generateStringId })
  id: string;

  @Prop({ type: String, default: '' })
  userId: string;

  @Prop({ type: String, default: null })
  assigneeId: string | null;

  /** Manager who created/assigned the task */
  @Prop({ type: String, default: null })
  assignedBy: string | null;

  /** Employee assigned to the task */
  @Prop({ type: String, default: null })
  assignedTo: string | null;

  @Prop({ type: String, default: null })
  departmentId: string | null;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, enum: ['pending', 'assigned', 'in_progress', 'completed'], default: 'pending' })
  status: string;

  @Prop({ type: Date, required: true })
  dueDate: Date;

  @Prop({ type: String, required: true, enum: ['low', 'medium', 'high', 'urgent'] })
  priority: string;

  @Prop({ type: String, default: '' })
  category: string;

  @Prop({ type: Date, default: null })
  reminder: Date | null;

  @Prop({ type: String, default: '' })
  attachmentUrl: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
  
}




export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.set('timestamps', true);
TaskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as unknown as Record<string, unknown>)._id;
  },
});

TaskSchema.index({ userId: 1 });
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ assignedBy: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ departmentId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ isDeleted: 1 });
TaskSchema.index({ createdAt: -1 });
