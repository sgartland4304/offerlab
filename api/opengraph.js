/**
 * OpenGraph API Proxy - Serverless function
 * Keeps the API key server-side. Deploy to Vercel; set OPENGRAPH_API_KEY in env.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = req.query.url;
  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'Missing or invalid url parameter' });
  }

  const apiKey = process.env.OPENGRAPH_API_KEY;
  if (!apiKey) {
    console.error('OPENGRAPH_API_KEY is not configured');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const fullUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
  const apiUrl = `https://opengraph.io/api/1.1/site/${encodeURIComponent(fullUrl)}?app_id=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'OpenGraph fetch failed' });
    }
    const data = await response.json();
    const hg = data?.hybridGraph || data?.openGraph || {};
    const image = hg.image;
    const imageUrl = typeof image === 'string' ? image : image?.url;
    const faviconUrl = hg.favicon || (typeof hg.favicon === 'string' ? hg.favicon : null);

    return res.status(200).json({
      imageUrl: imageUrl && typeof imageUrl === 'string' ? imageUrl : null,
      faviconUrl: faviconUrl && typeof faviconUrl === 'string' ? faviconUrl : null
    });
  } catch (err) {
    console.error('OpenGraph proxy error:', err);
    return res.status(500).json({ error: 'Failed to fetch OpenGraph data' });
  }
}
