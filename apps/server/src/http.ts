import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { LedgerStore } from "./store";
export function createBudgetServer(store: LedgerStore, token: string) {
  return createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const reply = (status: number, body: unknown) => {
      res.writeHead(status);
      res.end(JSON.stringify(body));
    };
    const supplied = Buffer.from(req.headers.authorization ?? "");
    const expected = Buffer.from(`Bearer ${token}`);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      reply(401, { error: "Unauthorized" });
      return;
    }
    try {
      if (req.method === "GET" && req.url === "/records") {
        reply(200, store.list());
        return;
      }
      if (req.method === "POST" && req.url === "/mutations") {
        let body = "";
        for await (const chunk of req) {
          body += chunk;
          if (body.length > 16384) {
            reply(413, { error: "Request too large" });
            return;
          }
        }
        const result = store.apply(JSON.parse(body));
        reply(result.conflict ? 409 : 200, result);
        return;
      }
      reply(404, { error: "Not found" });
    } catch (error) {
      reply(400, { error: error instanceof Error ? error.message : "Invalid request" });
    }
  });
}
