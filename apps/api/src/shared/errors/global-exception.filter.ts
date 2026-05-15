import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

/**
 * Shapes every response per `docs/API_SPEC.md` §0:
 *
 *   { error: { code, message, message_en? }, meta: { request_id } }
 *
 * `HttpException`s may already carry `{ code, message, message_en? }` in their
 * response body — those are passed through. Anything else collapses to
 * INTERNAL_SERVER_ERROR after being logged.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "Internal server error";
    let messageEn: string | undefined;
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === "string") {
        message = body;
      } else if (body && typeof body === "object") {
        const b = body as Record<string, unknown>;
        const payload =
          b.message && typeof b.message === "object" && !Array.isArray(b.message)
            ? (b.message as Record<string, unknown>)
            : b;

        if (typeof payload.code === "string") code = payload.code;
        if (typeof payload.message === "string") {
          message = payload.message;
        } else if (typeof b.message === "string") {
          message = b.message;
        } else if (Array.isArray(b.message) && typeof b.message[0] === "string") {
          message = b.message[0] as string;
        }
        if (typeof payload.message_en === "string") {
          messageEn = payload.message_en;
        } else if (typeof b.message_en === "string") {
          messageEn = b.message_en;
        }
        const detailsSource = payload.details ?? b.details;
        if (
          detailsSource &&
          typeof detailsSource === "object" &&
          !Array.isArray(detailsSource)
        ) {
          details = detailsSource as Record<string, unknown>;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        { err: { name: exception.name, message: exception.message }, path: req?.url },
        "Unhandled exception",
      );
    } else {
      this.logger.error({ err: exception, path: req?.url }, "Unhandled non-Error");
    }

    const requestId = (req as unknown as { id?: string })?.id ?? null;

    res.status(status).json({
      error: {
        code,
        message,
        ...(messageEn ? { message_en: messageEn } : {}),
        ...(details ? { details } : {}),
      },
      meta: { request_id: requestId },
    });
  }
}
