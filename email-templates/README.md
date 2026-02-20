# OfferLab Email Templates

Production-ready HTML email templates with inline CSS, compatible across all major email clients (Gmail, Outlook, Apple Mail, Yahoo, etc.).

## Template Catalog

| Template | Description | Preview | Production |
|----------|-------------|---------|------------|
| [new-message-notification](./new-message-notification/) | Notification when a creator/brand receives a new message | [preview.html](./new-message-notification/preview.html) | [index.html](./new-message-notification/index.html) |

## How It Works

Each template folder contains:

| File | Purpose |
|------|---------|
| `index.html` | **Production template** — contains `{{variable}}` placeholders for your templating engine |
| `preview.html` | **Live preview** — populated with sample data so you can see the rendered design |
| `assets/` | Images (SVGs, PNGs) referenced by the template |

## For Engineering

1. Open the template's `index.html`
2. Check the `<!-- DYNAMIC DATA FIELDS -->` comment block at the top for the full list of variables
3. Replace `{{variable}}` placeholders with your templating engine syntax (Handlebars, Liquid, ERB, etc.)
4. Host image assets on your CDN and update `src` paths accordingly

### Image Hosting

Templates reference images via relative `assets/` paths for local preview. In production, replace these with absolute CDN URLs:

```html
<!-- Local preview -->
<img src="assets/offerlab-logo-lockup.svg" ...>

<!-- Production -->
<img src="https://cdn.offerlab.com/email/offerlab-logo-lockup.png" ...>
```

> **Note:** Convert SVGs to PNGs for production — SVG support varies across email clients. PNGs are universally supported.

## Email Client Compatibility

- **Table-based layout** for Outlook desktop
- **All CSS inlined** on every element
- **MSO conditional comments** with VML rounded buttons for Outlook
- **Responsive** at 620px breakpoint (padding, button, title adjustments)
- **Font stack:** Aktiv Grotesk → Inter (Google Fonts) → Helvetica Neue → Arial → sans-serif
- **Accessibility:** `role="presentation"` on layout tables, hidden preheader text, proper alt text

## Adding New Templates

1. Create a new folder: `email-templates/<template-name>/`
2. Add `index.html` (production, with `{{variables}}`), `preview.html` (sample data), and `assets/`
3. Add the data fields reference comment at the top of `index.html`
4. Update this README catalog table
