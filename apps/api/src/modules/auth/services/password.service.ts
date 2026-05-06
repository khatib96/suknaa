import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

@Injectable()
export class PasswordService {
  private static readonly ARGON_OPTIONS: argon2.Options & { raw?: false } = {
    type: argon2.argon2id,
    memoryCost: 64 * 1024,
    timeCost: 3,
    parallelism: 4,
  };

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, PasswordService.ARGON_OPTIONS);
  }

  async verifyPassword(passwordHash: string, password: string): Promise<boolean> {
    return argon2.verify(passwordHash, password, PasswordService.ARGON_OPTIONS);
  }

  async hashOpaqueToken(token: string): Promise<string> {
    return argon2.hash(token, PasswordService.ARGON_OPTIONS);
  }

  async verifyOpaqueToken(tokenHash: string, token: string): Promise<boolean> {
    return argon2.verify(tokenHash, token, PasswordService.ARGON_OPTIONS);
  }
}
