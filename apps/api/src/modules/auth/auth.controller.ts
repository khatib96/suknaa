import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { badRequestError } from "../../shared/errors/api-error.helpers";
import { CurrentUser } from "./decorators/current-user.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  sessionsQuerySchema,
  signupSchema,
  verifyEmailSchema,
} from "./auth.schemas";
import type { AuthenticatedUser } from "./types/authenticated-user.type";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("auth/signup")
  async signup(@Body() body: unknown, @Req() req: Request) {
    const parsed = this.parse(signupSchema.safeParse(body));
    return this.authService.signup(parsed, this.requestContext(req));
  }

  @Post("auth/verify-email")
  async verifyEmail(@Body() body: unknown, @Req() req: Request) {
    const parsed = this.parse(verifyEmailSchema.safeParse(body));
    return this.authService.verifyEmail(parsed.email, parsed.token, this.requestContext(req));
  }

  @Post("auth/login")
  async login(@Body() body: unknown, @Req() req: Request) {
    const parsed = this.parse(loginSchema.safeParse(body));
    return this.authService.login(parsed, this.requestContext(req));
  }

  @Post("auth/refresh")
  async refresh(@Body() body: unknown, @Req() req: Request) {
    const parsed = this.parse(refreshSchema.safeParse(body));
    return this.authService.refresh(parsed.refreshToken, this.requestContext(req));
  }

  @Post("auth/logout")
  async logout(@Body() body: unknown, @Req() req: Request) {
    const parsed = this.parse(logoutSchema.safeParse(body));
    return this.authService.logout(parsed.refreshToken, this.requestContext(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post("auth/logout-all")
  async logoutAll(@CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.authService.logoutAll(user, this.requestContext(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get("auth/sessions")
  async sessions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: unknown,
  ) {
    const parsed = this.parse(sessionsQuerySchema.safeParse(query));
    return this.authService.listSessions(user, parsed.limit);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("auth/sessions/:id")
  async revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Req() req: Request,
  ) {
    return this.authService.revokeSession(user, id, this.requestContext(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getCurrentUser(user);
  }

  private requestContext(req: Request): {
    ipAddress: string | null;
    userAgent: string | null;
    requestId: string | null;
  } {
    return {
      ipAddress: req.ip ?? null,
      userAgent: req.headers["user-agent"] ?? null,
      requestId:
        typeof req.id === "string" || typeof req.id === "number"
          ? String(req.id)
          : typeof req.headers["x-request-id"] === "string"
            ? req.headers["x-request-id"]
            : null,
    };
  }

  private parse<T>(result: { success: true; data: T } | { success: false }): T {
    if (!result.success) {
      throw badRequestError({
        code: "VALIDATION_ERROR",
        message: "Invalid request payload",
        message_en: "Invalid request payload",
      });
    }
    return result.data;
  }
}
