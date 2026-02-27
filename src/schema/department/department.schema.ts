import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateStringId } from '../../utils/utils';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema()
export class Department {
  @Prop({ type: String, default: generateStringId })
  id: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

DepartmentSchema.set('timestamps', true);
DepartmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: unknown) {
    delete (ret as { _id?: unknown })._id;
  },
});

DepartmentSchema.index({ name: 1 });
