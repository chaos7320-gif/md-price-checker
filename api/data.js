import { put, head } from '@vercel/blob';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Blob storage not configured' });
  }

  if (req.method === 'GET') {
    try {
      // head()로 blob 메타데이터 직접 조회 (CDN 캐싱 우회)
      const blob = await head(BLOB_KEY, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => null);
      if (!blob) return res.status(200).json(null);
      const r = await fetch(blob.downloadUrl, { cache: 'no-store' });
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
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Save error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
}
