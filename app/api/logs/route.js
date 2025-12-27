import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // ⬅️ WAJIB

export async function POST(request) {
  try {
    // 🔒 Security check
    const secret = request.headers.get("x-log-secret");
    if (secret !== process.env.LOG_SECRET) {
      return new Response({success: false, error: "forbidden",code: 403 }, {status:403});
    }

    const body = await request.json();

    const log = await prisma.log.create({
      data: {
        method: body.method,
        pathname: body.pathname,
        UserId: body.id,
        role: body.role,
      },
    });

    return new Response({success: true, message: "info tercatat",data: log}, {status:200});
  } catch (error) {
    console.error("LOG ERROR:", error);
    return new Response({success: false, error: "internal server error",code: 500 }, {status:500});
  }
}
