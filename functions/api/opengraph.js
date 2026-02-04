/**
 * Cloudflare Pages Function: OpenGraph API Proxy
 * Keeps the API key secure on the server side
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  // CORS headers for the response
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.trim()) {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid url parameter' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = env.OPENGRAPH_API_KEY;
  if (!apiKey) {
    console.error('OPENGRAPH_API_KEY not set in environment');
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const fullUrl = targetUrl.trim().startsWith('http') ? targetUrl.trim() : `https://${targetUrl.trim()}`;
  const apiUrl = `https://opengraph.io/api/1.1/site/${encodeURIComponent(fullUrl)}?app_id=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'OpenGraph fetch failed' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    
    // Extract image from multiple sources
    let imageUrl = null;
    
    if (data?.hybridGraph?.image) {
      const img = data.hybridGraph.image;
      imageUrl = typeof img === 'string' ? img : img?.url;
    }
    
    if (!imageUrl && data?.openGraph?.image) {
      const img = data.openGraph.image;
      imageUrl = typeof img === 'string' ? img : img?.url;
    }
    
    if (!imageUrl && data?.htmlInferred?.image) {
      const img = data.htmlInferred.image;
      imageUrl = typeof img === 'string' ? img : img?.url;
    }
    
    if (!imageUrl && data?.image) {
      const img = data.image;
      imageUrl = typeof img === 'string' ? img : img?.url;
    }
    
    // Get favicon
    let faviconUrl = null;
    if (data?.hybridGraph?.favicon) {
      faviconUrl = data.hybridGraph.favicon;
    } else if (data?.htmlInferred?.favicon) {
      faviconUrl = data.htmlInferred.favicon;
    }

    return new Response(
      JSON.stringify({
        imageUrl: imageUrl && typeof imageUrl === 'string' ? imageUrl : null,
        faviconUrl: faviconUrl && typeof faviconUrl === 'string' ? faviconUrl : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[OpenGraph Proxy] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch OpenGraph data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
