import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { AuthenticatedUser } from "../types/authenticated-user.type";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const req = context.switchToHttp().getRequest<Request>();
    return req.user as AuthenticatedUser;
  },
);
