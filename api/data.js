import { put, list, del } from '@vercel/blob';

const BLOB_KEY = 'md-dashboard-data.json';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); }
      catch (e) { reject(new Error('JSON 파싱 실패: ' + e.message)); }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Blob storage not configured' });
  }

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_KEY, token: process.env.BLOB_READ_WRITE_TOKEN });
      if (!blobs.length) return res.status(200).json(null);
      // private blob의 downloadUrl은 CDN을 우회하는 서명된 URL
      const r = await fetch(blobs[0].downloadUrl, { cache: 'no-store' });
      if (!r.ok) return res.status(200).json(null);
      const data = await r.json();
      return res.status(200).json(data);
    } catch (e) {
      console.error('Load error:', e);
      return res.status(200).json(null);
    }
  }

  if (req.method === 'POST') {
    try {
      const data = await readBody(req);
      const payload = JSON.stringify(data);
      await put(BLOB_KEY, payload, {
        access: 'private',          // CDN 캐싱 없음 - 항상 최신 데이터 반환
        addRandomSuffix: false,
        contentType: 'application/json',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Save error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { blobs } = await list({ prefix: BLOB_KEY, token: process.env.BLOB_READ_WRITE_TOKEN });
      if (blobs.length) await del(blobs.map(b => b.url), { token: process.env.BLOB_READ_WRITE_TOKEN });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
}
