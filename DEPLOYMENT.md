# Deployment & API Key Security

The OpenGraph API key is **never** sent to the browser. All OpenGraph requests go through a server-side proxy.

## Local development

1. Copy `.env.example` to `.env` (or the `.env` file is already created with your key).
2. Set `OPENGRAPH_API_KEY` in `.env`.
3. Run `npm run dev` (uses the Express server with the proxy).

> **Note:** The plain `npx serve` script won't provide the OpenGraph proxy. Use `npm run dev` for full functionality, or `npm run serve` for static-only testing.

## Production deployment

### Vercel (recommended)

1. Deploy the project to Vercel.
2. In Project Settings → Environment Variables, add:
   - `OPENGRAPH_API_KEY` = your OpenGraph.io API key
3. The `api/opengraph.js` serverless function will handle requests automatically.

### Other hosts (Node.js)

1. Run `node server.js` with `OPENGRAPH_API_KEY` set in the environment.
2. Example: `OPENGRAPH_API_KEY=your_key node server.js`

### Static-only hosting

If you deploy only the static files (e.g. GitHub Pages) without the API proxy, OpenGraph images and favicons will not load. Use Vercel or a Node host for full functionality.
