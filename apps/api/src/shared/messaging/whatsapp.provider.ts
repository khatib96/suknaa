import { HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createApiError } from "../errors/api-error.helpers";
import type { Env } from "../config/env.schema";
import type {
  MessageProvider,
  MessageSendResult,
  OutboundMessage,
} from "./message-provider.interface";

/**
 * Meta WhatsApp Cloud API (Graph) sender.
 *
 * Activation is intentionally deferred: keep `WHATSAPP_CLOUD_ENABLED=false` until Meta onboarding
 * is complete. Recipient reachability (including specific country codes such as +963) depends on
 * the WhatsApp Business account — validate in a staging Meta app before relying on production sends.
 */
@Injectable()
export class WhatsAppProvider implements MessageProvider {
  constructor(private readonly config: ConfigService<Env, true>) {}

  async send(message: OutboundMessage): Promise<MessageSendResult> {
    const enabled = this.config.get("WHATSAPP_CLOUD_ENABLED", { infer: true });
    if (!enabled) {
      throw createApiError(HttpStatus.SERVICE_UNAVAILABLE, {
        code: "WHATSAPP_CLOUD_DISABLED",
        message:
          "WhatsApp Cloud API is disabled. Set WHATSAPP_CLOUD_ENABLED=true only after Meta onboarding.",
        message_en: "WhatsApp Cloud API is disabled.",
      });
    }

    const token = this.config.get("WHATSAPP_CLOUD_ACCESS_TOKEN", { infer: true });
    const phoneNumberId = this.config.get("WHATSAPP_CLOUD_PHONE_NUMBER_ID", { infer: true });
    const version = this.config.get("WHATSAPP_CLOUD_API_VERSION", { infer: true });

    if (
      typeof token !== "string" ||
      typeof phoneNumberId !== "string" ||
      token.length === 0 ||
      phoneNumberId.length === 0
    ) {
      throw createApiError(HttpStatus.INTERNAL_SERVER_ERROR, {
        code: "WHATSAPP_CLOUD_MISCONFIGURED",
        message: "WhatsApp Cloud configuration is incomplete",
        message_en: "WhatsApp Cloud configuration is incomplete",
      });
    }

    if (message.recipient.channel !== "phone") {
      throw createApiError(HttpStatus.BAD_REQUEST, {
        code: "WHATSAPP_INVALID_CHANNEL",
        message: "WhatsApp provider only supports phone recipients",
        message_en: "WhatsApp provider only supports phone recipients",
      });
    }

    const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
    const to = message.recipient.value.replace(/^\+/, "");

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message.body },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      await res.text().catch(() => undefined);
      throw createApiError(HttpStatus.BAD_GATEWAY, {
        code: "WHATSAPP_CLOUD_SEND_FAILED",
        message: "WhatsApp Cloud API request failed",
        message_en: "WhatsApp Cloud API request failed",
        details: { status: res.status },
      });
    }

    const json = (await res.json()) as { messages?: { id?: string }[] };
    const acceptedAt = new Date();
    return {
      provider: "whatsapp_cloud",
      messageId: json.messages?.[0]?.id ?? "unknown",
      acceptedAt,
    };
  }
}
