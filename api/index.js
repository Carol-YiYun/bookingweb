export default async function handler(req, res) {
  try {
    const mongoose = (await import("mongoose")).default; // ESM 動態載入
    return res.status(200).json({ ok: true, mongoose: mongoose?.version || "loaded" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
}

