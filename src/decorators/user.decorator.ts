import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestUser {
  id: string;
  role?: string;
  departmentId?: string | null;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user?.id) {
      return {
        id: request.user.id,
        role: request.user.role,
        departmentId: request.user.departmentId ?? null,
      };
    }
    const userId = request.headers['x-user-id'];
    return userId ? { id: userId } : undefined;
  },
);
