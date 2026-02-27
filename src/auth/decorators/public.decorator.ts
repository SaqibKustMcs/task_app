import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Routes marked @Public() skip JwtAuthGuard (no token required). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
