import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { calculateSettlementPlan, formatKakaoSettlementMessage } from "./settlement-runtime.mjs";
import { calculateSettlementPlan, formatKakaoSettlementMessage } from "../dist/src/settlement/index.js";

const rootDir = join(fileURLToPath(new URL("..", import.meta.url)));
const publicDir = join(rootDir, "public");
const port = Number(process.env.PORT ?? 3000);
const savedEvents = new Map();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "POST" && url.pathname === "/api/settlement/calculate") {
      await handleSettlementCalculation(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/events") {
      await handleEventSave(request, response);
      return;
    }

    const eventMatch = url.pathname.match(/^\/api\/events\/([^/]+)$/);
    if (request.method === "GET" && eventMatch) {
      handleEventRead(eventMatch[1], response);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    await serveStatic(url.pathname, response);
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Unknown server error" });
  }
});

server.listen(port, () => {
  console.log(`식후경 P0 모바일 웹 UI: http://localhost:${port}`);
});

async function handleSettlementCalculation(request, response) {
  const body = await readJsonBody(request);
  const plan = calculateSettlementPlan(body);
  const message = formatKakaoSettlementMessage(body.eventTitle ?? "식후경 모임", body.participants, plan.transfers);
  sendJson(response, 200, { ...plan, message });
}

async function handleEventSave(request, response) {
  const body = await readJsonBody(request);
  const eventId = body.eventId ?? createEventId();
  const savedAt = new Date().toISOString();
  savedEvents.set(eventId, { ...body, eventId, savedAt });
  sendJson(response, 200, { eventId, savedAt, url: `/public/index.html?eventId=${encodeURIComponent(eventId)}` });
}

function handleEventRead(eventId, response) {
  const saved = savedEvents.get(decodeURIComponent(eventId));
  if (!saved) {
    sendJson(response, 404, { error: "Saved event not found. 로컬 서버 재시작 시 저장 링크는 초기화됩니다." });
    return;
  }
  sendJson(response, 200, saved);
}

async function serveStatic(pathname, response) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream" });
    response.end(file);
  } catch {
    const fallback = await readFile(join(publicDir, "index.html"));
    response.writeHead(200, { "Content-Type": contentTypes[".html"] });
    response.end(fallback);
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = "";
    request.on("data", (chunk) => {
      rawBody += chunk;
      if (rawBody.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => {
      try {
        resolve(rawBody ? JSON.parse(rawBody) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function createEventId() {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
