import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateStringId } from '../../utils/utils';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ type: String, default: generateStringId })
  id: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ type: String, enum: ['manager', 'employee'], default: 'employee' })
  role: string;

  @Prop({ type: String, default: null })
  departmentId: string | null;

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;

  @Prop({ type: String, default: '123456' })
  otp: string;

  @Prop({ type: Date, default: null })
  otpExpiresAt: Date | null;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('timestamps', true);
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as unknown as Record<string, unknown>)._id;
    delete (ret as unknown as Record<string, unknown>).password;
  },
});

UserSchema.index({ email: 1 }, { unique: true });
