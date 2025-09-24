const json = (res, code, data) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};

export default async function handler(req, res) {
  if (req.url === "/health") return json(res, 200, { ok: true, ts: Date.now() });
  if (req.url === "/api/v1/test") return json(res, 200, { msg: "test ok" });

  return json(res, 404, { error: "not found" });
}