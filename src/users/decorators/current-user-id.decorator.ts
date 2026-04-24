import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthRequest } from '../auth.request';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user?.id;
  },
);
