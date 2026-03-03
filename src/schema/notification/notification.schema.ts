import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateStringId } from '../../utils/utils';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop({ type: String, default: generateStringId })
  id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, default: 'task_assigned' })
  type: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, default: '' })
  body: string;

  @Prop({ type: String, default: null })
  taskId: string | null;

  @Prop({ type: String, default: null })
  assignedByUserId: string | null;

  @Prop({ type: Boolean, default: false })
  read: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.set('timestamps', false);
NotificationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as unknown as Record<string, unknown>)._id;
  },
});
