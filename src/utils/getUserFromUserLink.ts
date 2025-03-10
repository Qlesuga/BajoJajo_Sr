import { db } from "~/server/db";

async function getUserFromUserLink(userLink: string): Promise<string | null> {
  const findUserFromLink = await db.userPlayerLink.findFirst({
    select: {
      user: {
        select: {
          accounts: {
            select: {
              providerAccountId: true,
            },
          },
        },
      },
    },
    where: {
      link: userLink,
    },
  });
  if (!findUserFromLink) {
    return null;
  }
  const account = findUserFromLink.user.accounts[0];
  if (!account) {
    return null;
  }
  return account.providerAccountId;
}

export { getUserFromUserLink };
