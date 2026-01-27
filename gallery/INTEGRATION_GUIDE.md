# Product Gallery - Rails/Tailwind/DaisyUI Integration Guide

## Overview

This gallery component has been converted to use **Tailwind CSS** and **DaisyUI** while maintaining all original functionality. It's designed to be plug-and-play for your Rails application.

## Files Structure

```
gallery/
├── index.html              # Standalone version (for GitHub Pages/testing)
├── _gallery.html.erb       # Rails partial
├── gallery.js              # JavaScript (Rails asset pipeline)
├── gallery.css             # Custom CSS (complex behaviors)
└── INTEGRATION_GUIDE.md   # This file
```

## Prerequisites

1. **Tailwind CSS** installed and configured
2. **DaisyUI** installed (`npm install daisyui`)
3. **Mux Player** script available

## Step 1: Tailwind Configuration

Add to your `tailwind.config.js`:

```js
module.exports = {
  content: [
    // ... your existing content paths
    './app/views/**/*.html.erb',
    './app/javascript/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'content-background-base': '#F7F5F0',
        'content-background-elevated': '#FFF',
        'content-primary': '#342E26',
        'content-interactive-primary': '#342E26',
        'content-border-neutral': 'rgba(52, 46, 38, 0.08)',
      },
      borderRadius: {
        '4xl': '24px',
        'lg': '10px',
        'full': '99999px',
      },
    }
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: false, // Disable DaisyUI themes, use custom colors
  },
}
```

## Step 2: Add Files to Rails

### Copy Files

1. **Rails Partial:**
   ```bash
   cp gallery/_gallery.html.erb app/views/shared/_gallery.html.erb
   ```

2. **JavaScript:**
   ```bash
   cp gallery/gallery.js app/javascript/gallery.js
   # OR for asset pipeline:
   cp gallery/gallery.js app/assets/javascripts/gallery.js
   ```

3. **CSS:**
   ```bash
   cp gallery/gallery.css app/assets/stylesheets/gallery.css
   # OR import in your main CSS:
   @import 'gallery.css';
   ```

### Include in Layout

In your `app/views/layouts/application.html.erb`:

```erb
<%= stylesheet_link_tag "gallery", "data-turbo-track": "reload" %>
<%= javascript_include_tag "gallery", "data-turbo-track": "reload", defer: true %>
<%= javascript_include_tag "https://cdn.jsdelivr.net/npm/@mux/mux-player@latest", defer: true %>
```

## Step 3: Usage in Rails Views

### Basic Usage

```erb
<% gallery_media = [
  { type: 'image', src: asset_path('product-1.jpg') },
  { type: 'image', src: asset_path('product-2.jpg') },
  { type: 'video', playbackId: 'mux_playback_id', thumbnail: 'optional_url' }
] %>

<%= render partial: 'shared/gallery', locals: { gallery_media: gallery_media } %>
```

### With Image Helpers

```erb
<% gallery_media = @product.images.map do |img|
  { type: 'image', src: image_path(img.url) }
end %>

<%= render partial: 'shared/gallery', locals: { gallery_media: gallery_media } %>
```

## Step 4: DaisyUI Components Used

The gallery leverages these DaisyUI components:

- **`btn`** - Base button class for navigation buttons
- **`btn-circle`** - Circular buttons (prev/next, close)
- **`btn-sm`** - Small button size

All buttons use custom colors via Tailwind config, so they match your design system.

## Custom CSS

The `gallery.css` file contains styles that can't be expressed with Tailwind utilities:

- Complex gradient masks for video blur fade
- Custom range input (scrubber) styling
- Pseudo-element hover effects (::before)
- Complex transitions with cubic-bezier timing

These are kept separate for maintainability.

## Color Variables

All original CSS variables are now Tailwind color utilities:

| Original CSS Variable | Tailwind Class |
|----------------------|----------------|
| `--content-background-base` | `bg-content-background-base` |
| `--content-background-elevated` | `bg-content-background-elevated` |
| `--content-primary` | `text-content-primary` / `border-content-primary` |
| `--content-interactive-primary` | `stroke-content-interactive-primary` |
| `--content-border-neutral` | `border-content-border-neutral` |

## Functionality Preserved

✅ All JavaScript functionality remains identical  
✅ Desktop and mobile behaviors unchanged  
✅ Video controls (Chrome-style) work the same  
✅ Fullscreen mode with swipe gestures  
✅ Thumbnail navigation  
✅ Keyboard navigation (Arrow keys, Escape)  
✅ Touch/swipe gestures  

## Testing

1. Test standalone version: Open `gallery/index.html` in browser
2. Test Rails integration: Render partial in a view
3. Verify mobile behavior: Test on device or browser dev tools
4. Check video playback: Ensure Mux player loads correctly

## Troubleshooting

### Gallery not initializing
- Check browser console for errors
- Ensure `galleryMedia` is defined before script runs
- Verify all DOM elements exist (galleryTrack, galleryViewport, etc.)

### Styles not applying
- Ensure Tailwind is processing the gallery files
- Check that custom colors are in Tailwind config
- Verify `gallery.css` is included in stylesheet build

### DaisyUI classes not working
- Ensure DaisyUI plugin is installed and configured
- Check that DaisyUI is included in Tailwind build
- Verify `btn`, `btn-circle`, `btn-sm` classes are available

## Next Steps

1. Add gallery media data from your Rails models
2. Customize colors in Tailwind config if needed
3. Adjust responsive breakpoints if your design requires it
4. Test thoroughly on mobile devices
