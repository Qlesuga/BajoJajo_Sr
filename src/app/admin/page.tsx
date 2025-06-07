"use server";

import DatabaseDashboard from "./_components/dashboard";
import { auth } from "~/server/auth";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || session.account.providerId != process.env.ADMIN_TWITCH_ID) {
    return null;
  }
  return <DatabaseDashboard />;
}
