export interface TwitchWebhookHeaders {
  "twitch-eventsub-message-id"?: string;
  "twitch-eventsub-message-timestamp"?: string;
  "twitch-eventsub-message-signature"?: string;
  "twitch-eventsub-message-export type"?: string;
  "twitch-eventsub-message-type"?: string;
}

export interface WebhookCallbackPayload {
  challenge: string;
  conduit_shard: {
    conduit_id: string;
    shard: string;
  };
}

export type Subscription = {
  id: string;
  status: "enabled" | "disabled";
  type: string;
  version: string;
  condition: {
    broadcaster_user_id: string;
    user_id: string;
  };
  transport: {
    method: "webhook" | "websocket";
    callback: string;
  };
  created_at: string;
  cost: number;
};

export type MessageFragment = {
  type: string;
  text: string;
  cheermote: string | null;
  emote: string | null;
  mention: string | null;
};

export type Badge = {
  set_id: string;
  id: string;
  info: string;
};

export type Event = {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  chatter_user_id: string;
  chatter_user_login: string;
  chatter_user_name: string;
  message_id: string;
  message: {
    text: string;
    fragments: MessageFragment[];
  };
  color: string;
  badges: Badge[];
  message_type: string;
  cheer: string | null;
  reply: string | null;
  channel_points_custom_reward_id: string | null;
};

export type TwitchWebhookPayload = {
  subscription: Subscription;
  event: Event;
};
