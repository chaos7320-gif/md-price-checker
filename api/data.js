import { put, list, del } from '@vercel/blob';

const BLOB_PREFIX = 'md-dashboard-data';

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
      const { blobs } = await list({ prefix: BLOB_PREFIX });
      if (!blobs.length) return res.status(200).json(null);
      // 가장 최근에 업로드된 blob 사용
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      const r = await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' });
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
      // 기존 blob 전부 삭제 후 새로 저장 (랜덤 suffix로 CDN 캐싱 우회)
      const { blobs: old } = await list({ prefix: BLOB_PREFIX });
      if (old.length) await del(old.map(b => b.url));
      await put(BLOB_PREFIX + '.json', payload, {
        access: 'public',
        addRandomSuffix: true,   // 매번 새 URL → CDN 캐싱 문제 없음
        contentType: 'application/json',
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Save error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { blobs } = await list({ prefix: BLOB_PREFIX });
      if (blobs.length) await del(blobs.map(b => b.url));
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
}
