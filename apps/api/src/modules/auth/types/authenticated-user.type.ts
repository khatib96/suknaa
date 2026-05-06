import type { UserExperience } from "@prisma/client";

export interface AuthenticatedUser {
  sub: string;
  isGuest: boolean;
  isHost: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  lastLoginAs: UserExperience;
  iat?: number;
  exp?: number;
}
