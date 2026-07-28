const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxdSoYjdMTxkHomSkoxZR7quDTYJs44qN-okbOnTcwjqNji0dDMm3OcBRp02cGVMBuFvA/exec";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Método no permitido." });
  }

  try {
    const payload =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    const upstream = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: payload,
      redirect: "follow",
    });

    const text = await upstream.text();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    try {
      return res.status(upstream.ok ? 200 : 502).json(JSON.parse(text));
    } catch {
      return res.status(502).json({
        ok: false,
        message: "Apps Script devolvió una respuesta inválida.",
      });
    }
  } catch {
    return res.status(502).json({
      ok: false,
      message: "No se pudo conectar con Google Apps Script.",
    });
  }
};
