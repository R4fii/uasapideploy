// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { logging } from "./logging";

// 👇 PERHATIKAN: Tambahkan parameter 'event' di sini
export async function middleware(request, event) { 
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "Unauthorized", code: 401 }),
      { status: 401 }
    );
  }

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "Invalid auth format", code: 401 }),
      { status: 401 }
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // ✅ NYALAKAN LAGI LOGGINGNYA
    // 👇 PERHATIKAN: Kita oper 'event' ke dalam fungsi logging
    logging(request, payload, event); 

    const pathname = request.nextUrl.pathname;
    const method = request.method;

    // ... (Logika role checking Anda tetap sama di bawah ini) ...
    if (pathname.startsWith("/api/users")) {
       if (payload.role !== "ADMIN") {
           return new NextResponse(
               JSON.stringify({ success: false, error: "Forbidden" , code: 403}),
               { status: 403 }
           );
       }
    }

    if (pathname.startsWith("/api/books") && method === "DELETE") {
       if (payload.role !== "ADMIN") {
           return new NextResponse(
               JSON.stringify({ success: false, error: "Forbidden", code:403 }),
               { status: 403 }
           );
       }
    }

    return NextResponse.next();

  } catch (error) {
    console.error("Middleware Error:", error); // Debugging
    return new NextResponse(
      JSON.stringify({ success: false, error: "Invalid or expired token", code: 401 }),
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/books/:path*", "/api/authors/:path*", "/api/users/:path*"],
};