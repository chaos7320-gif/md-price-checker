import { put, list } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const BLOB_KEY = 'md-dashboard-data.json';

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
      const { blobs } = await list({ prefix: BLOB_KEY });
      if (!blobs.length) return res.status(200).json(null);
      const r = await fetch(blobs[0].downloadUrl || blobs[0].url);
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
      const payload = JSON.stringify(req.body);
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
