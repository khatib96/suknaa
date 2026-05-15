import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { badRequestError } from "../../shared/errors/api-error.helpers";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import {
  createVacationRentalSchema,
  listVacationRentalsQuerySchema,
  patchVacationRentalSchema,
  vacationRentalIdParamSchema,
} from "./vacation-rentals.schemas";
import { VacationRentalsService } from "./vacation-rentals.service";

@Controller("me/vacation-rentals")
@UseGuards(JwtAuthGuard)
export class VacationRentalsController {
  constructor(private readonly vacationRentalsService: VacationRentalsService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser, @Query() query: unknown) {
    const parsed = this.parse(listVacationRentalsQuerySchema.safeParse(query));
    return this.vacationRentalsService.listForHost({
      userId: user.sub,
      jwtIsHost: user.isHost,
      limit: parsed.limit,
      cursor: parsed.cursor,
    });
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
    @Req() req: Request,
  ) {
    const parsed = this.parse(createVacationRentalSchema.safeParse(body));
    return this.vacationRentalsService.createForHost({
      userId: user.sub,
      jwtIsHost: user.isHost,
      input: parsed,
      ctx: this.requestContext(req),
    });
  }

  @Get(":id")
  async getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    const parsedId = this.parse(vacationRentalIdParamSchema.safeParse(id));
    return this.vacationRentalsService.getForHost({
      userId: user.sub,
      jwtIsHost: user.isHost,
      vacationRentalId: parsedId,
    });
  }

  @Patch(":id")
  async patch(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: unknown,
    @Req() req: Request,
  ) {
    const parsedId = this.parse(vacationRentalIdParamSchema.safeParse(id));
    const parsed = this.parse(patchVacationRentalSchema.safeParse(body));
    return this.vacationRentalsService.patchForHost({
      userId: user.sub,
      jwtIsHost: user.isHost,
      vacationRentalId: parsedId,
      input: parsed,
      ctx: this.requestContext(req),
    });
  }

  @Delete(":id")
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Req() req: Request,
  ) {
    const parsedId = this.parse(vacationRentalIdParamSchema.safeParse(id));
    return this.vacationRentalsService.deleteForHost({
      userId: user.sub,
      jwtIsHost: user.isHost,
      vacationRentalId: parsedId,
      ctx: this.requestContext(req),
    });
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
