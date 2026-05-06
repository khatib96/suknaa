import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createApiError } from "../../../shared/errors/api-error.helpers";
import type { Env } from "../../../shared/config/env.schema";

const ALGO = "aes-256-gcm";
const IV_LEN = 16;
const AUTH_TAG_LEN = 16;
const SCRYPT_SALT = "suknaa.m5.totp.v1";

/**
 * Encrypts TOTP secrets for storage in `two_factor_secrets.totp_secret_encrypted`.
 * Requires `TOTP_ENC_KEY` (64 hex chars = 32 bytes, or a long passphrase).
 */
@Injectable()
export class TotpSecretCryptoService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  encrypt(plainUtf8: string): string {
    const key = this.getKeyOrThrow();
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv(ALGO, key, iv);
    const enc = Buffer.concat([cipher.update(plainUtf8, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    if (tag.length !== AUTH_TAG_LEN) {
      throw new Error("Unexpected GCM tag length");
    }
    return Buffer.concat([iv, tag, enc]).toString("base64url");
  }

  decrypt(payloadB64Url: string): string {
    const key = this.getKeyOrThrow();
    const buf = Buffer.from(payloadB64Url, "base64url");
    if (buf.length < IV_LEN + AUTH_TAG_LEN + 1) {
      throw new Error("Invalid encrypted payload");
    }
    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + AUTH_TAG_LEN);
    const enc = buf.subarray(IV_LEN + AUTH_TAG_LEN);
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  }

  private getKeyOrThrow(): Buffer {
    const raw = this.config.get("TOTP_ENC_KEY", { infer: true });
    if (!raw || raw.length < 32) {
      throw createApiError(HttpStatus.INTERNAL_SERVER_ERROR, {
        code: "TOTP_ENC_KEY_MISSING",
        message: "TOTP encryption key is not configured",
        message_en: "TOTP encryption key is not configured",
      });
    }
    const trimmed = raw.trim();
    if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
      return Buffer.from(trimmed, "hex");
    }
    return scryptSync(trimmed, SCRYPT_SALT, 32);
  }
}
