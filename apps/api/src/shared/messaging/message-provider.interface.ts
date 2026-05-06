export type MessageChannel = "email" | "phone";

export interface MessageRecipientEmail {
  channel: "email";
  value: string;
}

export interface MessageRecipientPhone {
  channel: "phone";
  value: string;
}

export type MessageRecipient = MessageRecipientEmail | MessageRecipientPhone;

export interface OutboundMessage {
  recipient: MessageRecipient;
  subject?: string;
  body: string;
  metadata?: Record<string, string>;
}

export interface MessageSendResult {
  provider: string;
  messageId: string;
  acceptedAt: Date;
}

export interface MessageProvider {
  send(message: OutboundMessage): Promise<MessageSendResult>;
}
