import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../schema/user/user.schema';
import { Notification, NotificationSchema } from '../schema/notification/notification.schema';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [FirebaseService, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
