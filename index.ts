import { listenAndServe } from 'https://deno.land/std/http/server.ts';
import { 
  acceptWebSocket,
  acceptable,
  WebSocket,
  isWebSocketCloseEvent,
 } from 'https://deno.land/std/ws/mod.ts';
import { fromFileUrl } from 'https://deno.land/std/path/mod.ts';

const clients = new Map<number, WebSocket>();
let clientId = 0;


// Esta funcion despacha los mensajes a los diferentes clientes que existan
function dispatch(msg: string): void {
  for (const client of clients.values()) {
    client.send(msg);
  }
}

// Manejador del WebSocket
async function wsHandler(ws: WebSocket): Promise<void> {
  const id = ++clientId;
  clients.set(id, ws);
  dispatch(`Connected: [${id}]`);
  for await (const msg of ws) {
    console.log(`msg:${id}`, msg);
    if (typeof msg === "string") {
      dispatch(`[${id}]: ${msg}`);
    } else if (isWebSocketCloseEvent(msg)) {
      clients.delete(id);
      dispatch(`Closed: [${id}]`);
      break;
    }
  }
}

// Escuchando y sirviendo 
listenAndServe({ port: 8080 }, async (req) => {
  if (req.method === "GET" && req.url === "/") {
    //Serve with hack
    const u = new URL("./index.html", import.meta.url);
    if (u.protocol.startsWith("http")) {
      // server launched by deno run http(s)://.../server.ts,
      fetch(u.href).then(async (resp) => {
        const body = new Uint8Array(await resp.arrayBuffer());
        return req.respond({
          status: resp.status,
          headers: new Headers({
            "content-type": "text/html",
          }),
          body,
        });
      });
    } else {
      // server launched by deno run ./server.ts
      const file = await Deno.open(fromFileUrl(u));
      req.respond({
        status: 200,
        headers: new Headers({
          "content-type": "text/html",
        }),
        body: file,
      });
    }
  }
  if (req.method === "GET" && req.url === "/favicon.ico") {
    req.respond({
      status: 302,
      headers: new Headers({
        location: "https://deno.land/favicon.ico",
      }),
    });
  }
  if (req.method === "GET" && req.url === "/ws") {
    console.log("req in ws", req)
    if (acceptable(req)) {
      acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers,
      }).then(wsHandler);
    }
  }
});