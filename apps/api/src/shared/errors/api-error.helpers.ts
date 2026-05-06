import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";

export interface ApiErrorBody {
  code: string;
  message: string;
  message_en?: string;
  details?: Record<string, unknown>;
}

export function createApiError(
  status: HttpStatus,
  body: ApiErrorBody,
): HttpException {
  return new HttpException(body, status);
}

export function badRequestError(body: ApiErrorBody): BadRequestException {
  return new BadRequestException(body);
}

export function unauthorizedError(body: ApiErrorBody): UnauthorizedException {
  return new UnauthorizedException(body);
}

export function forbiddenError(body: ApiErrorBody): ForbiddenException {
  return new ForbiddenException(body);
}

export function notFoundError(body: ApiErrorBody): NotFoundException {
  return new NotFoundException(body);
}

export function conflictError(body: ApiErrorBody): ConflictException {
  return new ConflictException(body);
}

export function unprocessableError(
  body: ApiErrorBody,
): UnprocessableEntityException {
  return new UnprocessableEntityException(body);
}

export function rateLimitedError(body: ApiErrorBody): HttpException {
  return createApiError(HttpStatus.TOO_MANY_REQUESTS, body);
}
