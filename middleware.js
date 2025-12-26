import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { logging } from "./logging";

export async function middleware(request) {
  const authHeader = request.headers.get("authorization");

  // 1. Authorization tidak ada
  if (!authHeader) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401 }
    );
  }

  // 2. Format Bearer
  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "Invalid authorization format" }),
      { status: 401 }
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // 🔹 logging TANPA side effect lain
    logging(request, payload);

    const pathname = request.nextUrl.pathname;
    const method = request.method;

    if (pathname.startsWith("/api/users")) {
        // Tambahkan logika untuk memeriksa role user di sini
        if (payload.role !== "ADMIN") {
            return new NextResponse(
                JSON.stringify({ success: false, error: "Forbidden" }),
                { status: 403 }
            );
        }
    }

    if (pathname.startsWith("/api/books") && method === "DELETE") {
        if (payload.role !== "ADMIN") {
            return new NextResponse(
                JSON.stringify({ success: false, error: "Forbidden" }),
                { status: 403 }
            );
        }
    }

    return NextResponse.next();

  } catch (error) {
    console.error(error)
    return new NextResponse(
      JSON.stringify({ success: false, error: "Invalid or expired token" }),
      { status: 401 }
    );
  }
}

export const config = {
matcher: ["/api/books/:path*", "/api/authors/:path*", "/api/users/:path*"],
}
