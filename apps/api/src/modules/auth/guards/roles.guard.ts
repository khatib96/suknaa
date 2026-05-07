import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { forbiddenError } from "../../../shared/errors/api-error.helpers";
import { ROLES_KEY, type AuthRole } from "../decorators/roles.decorator";
import type { AuthenticatedUser } from "../types/authenticated-user.type";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AuthRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = req.user;
    if (!user || !this.hasAnyRole(user, required)) {
      throw forbiddenError({
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action",
        message_en: "You do not have permission to perform this action",
      });
    }
    return true;
  }

  private hasAnyRole(user: AuthenticatedUser, roles: AuthRole[]): boolean {
    return roles.some((role) => {
      if (role === "guest") return user.isGuest;
      if (role === "host") return user.isHost;
      if (role === "admin") return user.isAdmin || user.isSuperAdmin;
      return user.isSuperAdmin;
    });
  }
}
