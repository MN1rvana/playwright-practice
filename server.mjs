// Tiny zero-dependency server for the Mini Shop practice app.
// Serves ./public and a fake API:
//   GET  /api/products  -> list of products
//   POST /api/orders    -> creates an order, answers 201 { orderId }
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT) || 5173;
const PUBLIC_DIR = join(fileURLToPath(new URL('.', import.meta.url)), 'public');

const PRODUCTS = [
  { id: 'tshirt', name: 'Cotton T-shirt', price: 5900 },
  { id: 'patch', name: 'Embroidered patch', price: 1500 },
  { id: 'tote', name: 'Tote bag', price: 3900 },
  { id: 'mug', name: 'Enamel mug', price: 4500 },
  { id: 'hoodie', name: 'Hoodie', price: 14900 },
  { id: 'stickers', name: 'Sticker pack', price: 1200 },
];

let nextOrderNumber = 1001;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/products' && req.method === 'GET') {
    await sleep(300); // a little latency, like a real API
    return sendJson(res, 200, PRODUCTS);
  }

  if (url.pathname === '/api/orders' && req.method === 'POST') {
    await sleep(500);
    let order;
    try {
      order = JSON.parse(await readBody(req));
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON' });
    }
    if (!order?.items?.length || !order?.customer?.name || !order?.customer?.email) {
      return sendJson(res, 422, { error: 'Missing items or customer data' });
    }
    const orderId = `ORD-${nextOrderNumber++}`;
    return sendJson(res, 201, { orderId });
  }

  if (url.pathname.startsWith('/api/')) {
    return sendJson(res, 404, { error: 'Not found' });
  }

  // Static files
  const relative = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const filePath = normalize(join(PUBLIC_DIR, relative));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  try {
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': TYPES[extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Mini Shop running at http://localhost:${PORT}`);
});
