import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DepartmentModule } from './department/department.module';
import { TaskModule } from './task/task.module';
import { NotificationModule } from './notification/notification.module';
import { MediaUploadModule } from './file-management/media-upload/media-upload.module';
@Module({
  imports: [
    // Load environment variables from .env (locally) and from the platform (Railway)
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Always use MONGO_URI; fail fast if it's not set instead of silently using localhost
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    AuthModule,
    DepartmentModule,
    TaskModule,
    NotificationModule,
    MediaUploadModule
  ],
})
export class AppModule {}
