import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaUploadService {
  // Compression logic removed (jimp dependency). Keep methods as no-op stubs so existing calls compile.
  // You can reintroduce real compression later if needed.

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async compressImageTo300(file: any): Promise<void> {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async compressFolder(folderName: string): Promise<void> {
    return;
  }
}
