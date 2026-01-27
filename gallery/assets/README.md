# Product images

Add your product images in this folder, then reference them in `index.html` with paths like `assets/your-image.jpg`.

The gallery supports **images** and **videos** (Mux). In the `galleryMedia` array in `index.html`:

**Images:**
```js
{ type: 'image', src: 'assets/product-1.jpg' },
```

**Videos (Mux):** use your Mux playback ID. Thumbnails are generated from Mux; click the video to play/pause (no player UI).
```js
{ type: 'video', playbackId: 'YOUR_MUX_PLAYBACK_ID' },
```
