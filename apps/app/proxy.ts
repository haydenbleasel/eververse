import { updateSession } from "@repo/backend/auth/proxy";
import type { NextRequest, NextResponse } from "next/server";

export const proxy = async (request: NextRequest): Promise<NextResponse> =>
  updateSession(request);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
