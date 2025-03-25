import { getTwitchAppAccessToken } from "./twitchGetAppAccessToken";

async function twitchSendChatMessage(
  broadcasterID: string,
  message: string,
  parentMessageId: string | null = null,
): Promise<null> {
  const twitchAppToken = await getTwitchAppAccessToken();

  const body = {
    broadcaster_id: broadcasterID,
    sender_id: process.env.TWITCH_BOT_USER_ID,
    message: message,
    reply_parent_message_id: parentMessageId,
  };

  const response = await fetch("https://api.twitch.tv/helix/chat/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${twitchAppToken}`,
      "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return null;
}

export { twitchSendChatMessage };
