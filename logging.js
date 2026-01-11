// logging.js

export function logging(request, payload, event) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // 1. Log ke console (agar tetap bisa dipantau di terminal)
  console.info(`[API LOG] ${method} ${pathname}`);

  // 2. Siapkan data
  const data = {
    method,
    pathname,
    UserId: payload.id != null ? String(payload.id) : null,
    role: payload?.role ?? null,
  };

  // 3. Cek Base URL (PENTING: fetch di server butuh URL lengkap http://...)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.error("❌ LOGGING ERROR: NEXT_PUBLIC_BASE_URL belum diset di .env");
    return;
  }

  // 4. Kirim ke API Logs menggunakan event.waitUntil
  // Ini menjamin fetch tidak dimatikan paksa oleh Next.js
  if (event) {
    event.waitUntil(
      fetch(`${baseUrl}/api/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-log-secret": process.env.LOG_SECRET || "", // Pastikan ada secret untuk keamanan
        },
        body: JSON.stringify(data),
      })
      .then((res) => {
        if (!res.ok) console.error(`Failed to save log: ${res.status}`);
      })
      .catch((err) => console.error("Logging fetch error:", err))
    );
  } else {
    // Fallback jika event tidak ada (jarang terjadi di middleware)
    console.warn("⚠️ Event object missing in logging, log might not be saved.");
  }
}