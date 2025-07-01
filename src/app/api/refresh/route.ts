import { NextResponse } from "next/server";
import type { NextApiResponse } from "next";
import { db } from "~/server/db";

export async function POST(_req: Request, _res: NextApiResponse) {
  console.info("REFRESH START");
  try {
    await db.srStatus.findMany();
  } catch (e) {
    console.error("REFRESH QUERY ERROR", e);
    return new NextResponse(JSON.stringify(false));
  }

  console.info("REFRESH DONE");
  return new NextResponse(JSON.stringify(true), {
    status: 200,
  });
}
