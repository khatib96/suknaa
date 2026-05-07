import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

export type AuthRole = "guest" | "host" | "admin" | "super_admin";

export const Roles = (...roles: AuthRole[]) => SetMetadata(ROLES_KEY, roles);
