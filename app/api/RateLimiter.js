// /app/api/_rateLimiter.js
const ipStore = new Map(); // masih di memory, persisten selama dev server hidup

export function RateLimiter(request, maxRequests = 3, windowMs = 60 * 1000) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  const record = ipStore.get(ip) || { count: 0, startTime: now };

  if (now - record.startTime > windowMs) {
    record.count = 0;
    record.startTime = now;
  }

  record.count += 1;
  ipStore.set(ip, record);

  if (record.count > maxRequests) {
    return new Response(
      JSON.stringify({ success: false, error: "Too Many Requests", code: 429 }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  return null; // artinya masih boleh lanjut
}
