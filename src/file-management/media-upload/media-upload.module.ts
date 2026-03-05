import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../auth/auth.module';
import { User, UserSchema } from '../../schema/user/user.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MediaUploadController } from './media-upload.controller';
import { MediaUploadService } from './media-upload.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [MediaUploadController],
  providers: [MediaUploadService, JwtAuthGuard],
})
export class MediaUploadModule {}
