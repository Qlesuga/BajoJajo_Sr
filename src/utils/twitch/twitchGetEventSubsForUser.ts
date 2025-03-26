import { getTwitchAppAccessToken } from "./twitchGetAppAccessToken";

type SubscriptionResponse = {
  data: Subscription[];
  total: number;
  total_cost: number;
  max_total_cost: number;
  pagination: {
    cursor?: string;
  };
};

type Subscription = {
  id: string;
  status: SubscriptionStatus;
  type: string;
  version: string;
  condition: string; // JSON-encoded object
  created_at: string; // RFC3339 format
  transport: Transport;
  cost: number;
};

type SubscriptionStatus =
  | "enabled"
  | "webhook_callback_verification_pending"
  | "webhook_callback_verification_failed"
  | "notification_failures_exceeded"
  | "authorization_revoked"
  | "moderator_removed"
  | "user_removed"
  | "version_removed"
  | "beta_maintenance"
  | "websocket_disconnected"
  | "websocket_failed_ping_pong"
  | "websocket_received_inbound_traffic"
  | "websocket_connection_unused"
  | "websocket_internal_error"
  | "websocket_network_timeout"
  | "websocket_network_error";

type Transport = {
  method: "webhook" | "websocket";
  callback?: string; // Only if method is "webhook"
  session_id?: string; // Only if method is "websocket"
  connected_at?: string; // Only if method is "websocket"
  disconnected_at?: string; // Only if method is "websocket"
};

async function twitchGetEventSubsForUser(
  broadcasterID: string,
): Promise<SubscriptionResponse | undefined> {
  const twitchAppAccessToken = await getTwitchAppAccessToken();
  const res = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?user_id=${broadcasterID}`,
    {
      headers: {
        Authorization: `Bearer ${twitchAppAccessToken}`,
        "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
      },
    },
  );
  if (res.status != 200) {
    return;
  }
  const body: SubscriptionResponse = (await res.json()) as SubscriptionResponse;
  return body;
}

export { twitchGetEventSubsForUser };
