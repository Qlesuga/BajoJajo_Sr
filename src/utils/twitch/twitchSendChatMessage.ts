import { getTwitchAppAccessToken } from "./twitchGetAppAccessToken";

type messageBody = {
  broadcaster_id: string;
  sender_id: string;
  message: string;
  reply_parent_message_id?: string;
};

async function twitchSendChatMessage(
  broadcasterID: string,
  message: string,
  parentMessageId: string | null = null,
): Promise<null> {
  const twitchAppToken = await getTwitchAppAccessToken();
  const TWITCH_BOT_USER_ID = process.env.TWITCH_BOT_USER_ID;
  if (!TWITCH_BOT_USER_ID) {
    return null;
  }
  const body: messageBody = {
    broadcaster_id: broadcasterID,
    sender_id: TWITCH_BOT_USER_ID,
    message: message,
  };
  if (parentMessageId) {
    body.reply_parent_message_id = parentMessageId;
  }

  fetch("https://api.twitch.tv/helix/chat/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${twitchAppToken}`,
      "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      console.log(res);
    })
    .catch((e) => {
      console.error(e);
    });
  return null;
}

export { twitchSendChatMessage };
