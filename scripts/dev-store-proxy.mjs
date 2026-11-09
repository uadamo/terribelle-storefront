// Dev-only helper for cloud sandboxes whose outbound HTTPS must go through
// HTTPS_PROXY. MiniOxygen (workerd) ignores proxy settings, so this relays
// plain-HTTP requests on localhost to the real store over HTTPS via Node's
// proxy-aware fetch. Not needed on a normal laptop or in production.
// Usage: NODE_USE_ENV_PROXY=1 STORE_DOMAIN=xxx.myshopify.com node scripts/dev-store-proxy.mjs
import http from 'node:http';

const store = process.env.STORE_DOMAIN;
const port = Number(process.env.PORT || 8787);
if (!store) throw new Error('Set STORE_DOMAIN');

const hopByHop = new Set(['host', 'connection', 'content-length', 'accept-encoding', 'transfer-encoding']);

http
  .createServer(async (req, res) => {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const headers = Object.fromEntries(
        Object.entries(req.headers).filter(([k]) => !hopByHop.has(k)),
      );
      const upstream = await fetch(`https://${store}${req.url}`, {
        method: req.method,
        headers,
        body: chunks.length ? Buffer.concat(chunks) : undefined,
        redirect: 'manual',
      });
      const out = {};
      upstream.headers.forEach((v, k) => {
        if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(k)) out[k] = v;
      });
      res.writeHead(upstream.status, out);
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (err) {
      res.writeHead(502).end(String(err));
    }
  })
  .listen(port, () => console.log(`Relaying http://localhost:${port} -> https://${store}`));
