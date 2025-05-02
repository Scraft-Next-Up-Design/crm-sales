import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { addListener, removeListener } from "./broadcast";

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = params;

    const headers = new Headers();
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");
    headers.set("X-Accel-Buffering", "no");

    const stream = new ReadableStream({
      async start(controller) {
        const listener = {
          controller,
          lastPing: Date.now(),
        };

        addListener(workspaceId, listener);

        request.signal.addEventListener("abort", () => {
          removeListener(workspaceId, listener);
        });

        controller.enqueue(
          `data: ${JSON.stringify({ type: "connected" })}\n\n`
        );
      },
    });

    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error("Real-time Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
