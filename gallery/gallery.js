// Product Gallery JavaScript
// Requires: Mux Player script, Tailwind CSS, DaisyUI
// Usage: Initialize with galleryMedia array

(function() {
  'use strict';

  // Gallery initialization - expects galleryMedia to be defined globally or passed in
  function initGallery(galleryMediaData) {
    const galleryMedia = galleryMediaData || window.galleryMedia || [];
    if (!galleryMedia.length) {
      console.warn('Gallery: No media items provided');
      return;
    }

    let currentIndex = 0;
    const track = document.getElementById('galleryTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const thumbnailContainer = document.getElementById('thumbnails');
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    const fullscreenImageContainer = document.getElementById('fullscreenImageContainer');
    const fullscreenCloseBtn = document.getElementById('fullscreenCloseBtn');
    const fullscreenPrevBtn = document.getElementById('fullscreenPrevBtn');
    const fullscreenNextBtn = document.getElementById('fullscreenNextBtn');
    const fullscreenThumbnails = document.getElementById('fullscreenThumbnails');
    const galleryViewport = document.getElementById('galleryViewport');

    if (!track || !galleryViewport) {
      console.error('Gallery: Required DOM elements not found');
      return;
    }

    function pauseAllVideos() {
      track.querySelectorAll('mux-player').forEach(p => { try { p.pause(); } catch (_) {} });
      track.querySelectorAll('video').forEach(v => { try { v.pause(); } catch (_) {} });
    }

    function applySourceAspectRatio(player, wrap) {
      function getDimensions() {
        const v = player.tagName === 'VIDEO' ? player : (player.media?.nativeEl || player.querySelector?.('video') || player);
        return v && v.videoWidth && v.videoHeight ? { w: v.videoWidth, h: v.videoHeight } : null;
      }
      function sizeWrap() {
        const dim = getDimensions();
        if (!dim || !wrap.parentElement) return;
        const parent = wrap.parentElement;
        const pw = parent.clientWidth, ph = parent.clientHeight;
        if (!pw || !ph) return;
        const { w, h } = dim;
        const r = w / h;
        let cw, ch;
        if (pw / ph >= r) { ch = ph; cw = ch * r; } else { cw = pw; ch = cw / r; }
        wrap.style.width = Math.round(cw) + 'px';
        wrap.style.height = Math.round(ch) + 'px';
        wrap.style.aspectRatio = w + ' / ' + h;
      }
      player.addEventListener('loadedmetadata', sizeWrap);
      if (wrap.parentElement) {
        const ro = new ResizeObserver(sizeWrap);
        ro.observe(wrap.parentElement);
      }
      if (getDimensions()) sizeWrap();
    }

    function createMuxPlayer(playbackId) {
      const player = document.createElement('mux-player');
      player.setAttribute('playback-id', playbackId);
      player.setAttribute('nohotkeys', '');
      player.setAttribute('stream-type', 'on-demand');
      player.setAttribute('preload', 'auto');
      return player;
    }

    function iconSVG(name) {
      const icons = {
        play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
        pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>',
        volume: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',
        mute: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
        fullscreen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
        fullscreenExit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>'
      };
      const div = document.createElement('div');
      div.innerHTML = icons[name] || '';
      return div.firstChild;
    }

    function formatTime(s) {
      if (!isFinite(s) || s < 0) return '0:00';
      const m = Math.floor(s / 60), sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function attachChromeControls(player, wrap) {
      const overlay = document.createElement('div');
      overlay.className = 'video-blur-fade';
      wrap.appendChild(overlay);
      const bar = document.createElement('div');
      bar.className = 'chrome-controls';
      const playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.className = 'play-pause-btn';
      playBtn.setAttribute('aria-label', 'Play');
      playBtn.appendChild(iconSVG('play'));
      const timeEl = document.createElement('span');
      timeEl.className = 'time';
      timeEl.textContent = '0:00 / 0:00';
      const scrubWrap = document.createElement('div');
      scrubWrap.className = 'scrubber-wrap';
      const scrubber = document.createElement('input');
      scrubber.type = 'range';
      scrubber.min = 0;
      scrubber.max = 100;
      scrubber.value = 0;
      scrubber.setAttribute('aria-label', 'Seek');
      scrubWrap.appendChild(scrubber);
      const muteBtn = document.createElement('button');
      muteBtn.type = 'button';
      muteBtn.setAttribute('aria-label', 'Mute');
      muteBtn.appendChild(iconSVG('volume'));
      const fsBtn = document.createElement('button');
      fsBtn.type = 'button';
      fsBtn.setAttribute('aria-label', 'Fullscreen');
      fsBtn.appendChild(iconSVG('fullscreen'));
      const row = document.createElement('div');
      row.className = 'chrome-controls-row';
      const spacer = document.createElement('span');
      spacer.className = 'spacer';
      spacer.setAttribute('aria-hidden', 'true');
      row.append(playBtn, timeEl, spacer, muteBtn, fsBtn);
      bar.append(row, scrubWrap);

      function updateTime() {
        const t = player.currentTime || 0, d = player.duration;
        timeEl.textContent = formatTime(t) + ' / ' + formatTime(d);
        if (!scrubber.dragging) {
          const pct = isFinite(d) && d > 0 ? (100 * t / d) : 0;
          scrubber.value = pct;
          scrubber.style.setProperty('--p', pct + '%');
        }
      }
      function updatePlayIcon() {
        playBtn.innerHTML = '';
        playBtn.appendChild(iconSVG(player.paused ? 'play' : 'pause'));
        playBtn.setAttribute('aria-label', player.paused ? 'Play' : 'Pause');
      }
      function updateMuteIcon() {
        muteBtn.innerHTML = '';
        muteBtn.appendChild(iconSVG(player.muted ? 'mute' : 'volume'));
        muteBtn.setAttribute('aria-label', player.muted ? 'Unmute' : 'Mute');
      }
      function updateFsIcon() {
        const full = !!document.fullscreenElement;
        fsBtn.innerHTML = '';
        fsBtn.appendChild(iconSVG(full ? 'fullscreenExit' : 'fullscreen'));
        fsBtn.setAttribute('aria-label', full ? 'Exit fullscreen' : 'Fullscreen');
      }

      playBtn.addEventListener('click', (e) => { e.stopPropagation(); player.paused ? player.play() : player.pause(); });
      muteBtn.addEventListener('click', (e) => { e.stopPropagation(); player.muted = !player.muted; });
      scrubber.addEventListener('input', () => {
        const d = player.duration;
        const pct = parseFloat(scrubber.value);
        scrubber.style.setProperty('--p', pct + '%');
        if (isFinite(d)) player.currentTime = (pct / 100) * d;
      });
      scrubber.addEventListener('mousedown', () => { scrubber.dragging = true; });
      scrubber.addEventListener('mouseup', () => { scrubber.dragging = false; });
      fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const full = !!document.fullscreenElement;
        if (full) document.exitFullscreen();
        else wrap.requestFullscreen?.();
      });
      player.addEventListener('play', updatePlayIcon);
      player.addEventListener('pause', updatePlayIcon);
      player.addEventListener('volumechange', updateMuteIcon);
      player.addEventListener('timeupdate', updateTime);
      player.addEventListener('loadedmetadata', updateTime);
      player.addEventListener('durationchange', updateTime);
      document.addEventListener('fullscreenchange', updateFsIcon);

      wrap.addEventListener('mouseenter', () => {
        overlay.style.opacity = '1';
        bar.style.opacity = '1';
        bar.style.pointerEvents = 'auto';
      });
      wrap.addEventListener('mouseleave', () => {
        overlay.style.opacity = '0';
        bar.style.opacity = '0';
        bar.style.pointerEvents = 'none';
      });

      bar.addEventListener('click', (e) => e.stopPropagation());
      updatePlayIcon();
      updateMuteIcon();
      updateFsIcon();
      updateTime();
      wrap.appendChild(bar);
    }

    function generateSlides() {
      galleryMedia.forEach((media, i) => {
        const slide = document.createElement('div');
        slide.className = `gallery-slide ${i === 0 ? 'active' : ''}`;
        let videoWrap, videoPlayer;
        if (media.type === 'image') {
          const img = document.createElement('img');
          img.src = media.src;
          img.alt = `Image ${i + 1}`;
          slide.appendChild(img);
        } else if (media.type === 'video' && media.playbackId) {
          const wrap = document.createElement('div');
          wrap.className = 'video-slide-wrap';
          const player = createMuxPlayer(media.playbackId);
          player.addEventListener('click', (e) => { e.stopPropagation(); player.paused ? player.play() : player.pause(); });
          wrap.appendChild(player);
          attachChromeControls(player, wrap);
          slide.appendChild(wrap);
          videoWrap = wrap;
          videoPlayer = player;
        } else if (media.type === 'video' && media.src) {
          const wrap = document.createElement('div');
          wrap.className = 'video-slide-wrap';
          const vid = document.createElement('video');
          vid.src = media.src;
          if (media.poster) vid.poster = media.poster;
          vid.playsInline = true;
          vid.muted = false;
          vid.addEventListener('click', (e) => { e.stopPropagation(); vid.paused ? vid.play() : vid.pause(); });
          wrap.appendChild(vid);
          attachChromeControls(vid, wrap);
          slide.appendChild(wrap);
          videoWrap = wrap;
          videoPlayer = vid;
        }
        track.appendChild(slide);
        if (videoWrap && videoPlayer) applySourceAspectRatio(videoPlayer, videoWrap);
      });
    }

    function thumbSrc(media) {
      if (media.type === 'image') return media.src;
      if (media.type === 'video' && media.thumbnail) return media.thumbnail;
      if (media.type === 'video' && media.playbackId) return `https://image.mux.com/${media.playbackId}/thumbnail.jpg?width=200&height=200&fit_mode=smartcrop`;
      if (media.type === 'video' && media.poster) return media.poster;
      return '';
    }

    function generateThumbnails() {
      galleryMedia.forEach((media, i) => {
        const thumb = document.createElement('button');
        thumb.className = `thumbnail-btn ${i === 0 ? 'active' : ''}`;
        const src = thumbSrc(media);
        if (src) {
          const img = document.createElement('img');
          img.src = src;
          img.alt = '';
          thumb.appendChild(img);
        }
        const overlay = document.createElement('div');
        overlay.className = 'thumbnail-border-overlay';
        thumb.appendChild(overlay);
        thumb.addEventListener('click', () => goToSlide(i));
        thumbnailContainer.appendChild(thumb);
      });
    }

    function playActiveSlideVideo() {
      const activeSlide = track.querySelector('.gallery-slide.active');
      if (!activeSlide) return;
      const player = activeSlide.querySelector('mux-player') || activeSlide.querySelector('video');
      if (player) { try { player.muted = false; player.play(); } catch (_) {} }
    }

    function updateActiveStates() {
      track.querySelectorAll('.gallery-slide').forEach((s, i) => s.classList.toggle('active', i === currentIndex));
      thumbnailContainer.querySelectorAll('.thumbnail-btn').forEach((t, i) => t.classList.toggle('active', i === currentIndex));
      const thumbs = thumbnailContainer.querySelectorAll('.thumbnail-btn');
      if (thumbs[currentIndex] && window.matchMedia('(min-width: 769px)').matches) {
        thumbs[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      if (window.matchMedia('(max-width: 768px)').matches && galleryViewport.contains(track)) {
        const first = track.querySelector('.gallery-slide');
        if (first) {
          const gap = 10;
          galleryViewport.scrollTo({ left: currentIndex * (first.offsetWidth + gap), behavior: 'smooth' });
        }
      }
      playActiveSlideVideo();
    }

    function goToSlide(index) {
      if (index < 0 || index >= galleryMedia.length) return;
      pauseAllVideos();
      currentIndex = index;
      updateActiveStates();
    }

    function goToPrev() {
      goToSlide(currentIndex === 0 ? galleryMedia.length - 1 : currentIndex - 1);
    }

    function goToNext() {
      goToSlide(currentIndex === galleryMedia.length - 1 ? 0 : currentIndex + 1);
    }

    if (prevBtn) prevBtn.addEventListener('click', goToPrev);
    if (nextBtn) nextBtn.addEventListener('click', goToNext);

    let touchStartX = 0, touchEndX = 0, touchMoved = false;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchMoved = false;
    }, { passive: true });
    track.addEventListener('touchmove', () => { touchMoved = true; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipe = Math.abs(touchStartX - touchEndX) > 50;
      if (window.matchMedia('(max-width: 768px)').matches && fullscreenOverlay && fullscreenOverlay.classList.contains('active')) {
        if (swipe) {
          (touchStartX - touchEndX > 0) ? goToNext() : goToPrev();
          updateFSThumbs();
        }
      } else if (window.matchMedia('(min-width: 769px)').matches && swipe) {
        (touchStartX - touchEndX > 0) ? goToNext() : goToPrev();
      }
    }, { passive: true });

    function syncCurrentIndexFromScroll() {
      if (!window.matchMedia('(max-width: 768px)').matches) return;
      const first = track.querySelector('.gallery-slide');
      if (!first) return;
      const w = first.offsetWidth;
      const gap = 10;
      const scrollLeft = galleryViewport.scrollLeft;
      const i = Math.round(scrollLeft / (w + gap));
      const idx = Math.max(0, Math.min(i, galleryMedia.length - 1));
      if (idx !== currentIndex) {
        currentIndex = idx;
        track.querySelectorAll('.gallery-slide').forEach((s, i) => s.classList.toggle('active', i === currentIndex));
        playActiveSlideVideo();
      }
    }
    galleryViewport.addEventListener('scroll', syncCurrentIndexFromScroll, { passive: true });
    galleryViewport.addEventListener('scrollend', syncCurrentIndexFromScroll);

    function generateFullscreenThumbnails() {
      if (!fullscreenThumbnails) return;
      fullscreenThumbnails.innerHTML = '';
      galleryMedia.forEach((media, i) => {
        const thumb = document.createElement('button');
        thumb.className = `fullscreen-thumbnail-btn ${i === currentIndex ? 'active' : ''}`;
        const src = thumbSrc(media);
        if (src) {
          const img = document.createElement('img');
          img.src = src;
          thumb.appendChild(img);
        }
        const o = document.createElement('div');
        o.className = 'thumbnail-border-overlay';
        thumb.appendChild(o);
        thumb.addEventListener('click', () => {
          currentIndex = i;
          updateActiveStates();
          updateFSThumbs();
        });
        fullscreenThumbnails.appendChild(thumb);
      });
    }

    function updateFSThumbs() {
      if (!fullscreenThumbnails) return;
      fullscreenThumbnails.querySelectorAll('.fullscreen-thumbnail-btn').forEach((t, i) => {
        t.classList.toggle('active', i === currentIndex);
      });
    }

    function addFullscreenClasses() {
      track.querySelectorAll('.gallery-slide').forEach(slide => {
        slide.classList.add('fullscreen-slide');
        if (!slide.parentElement.classList.contains('fullscreen-slide-wrapper')) {
          const w = document.createElement('div');
          w.className = 'fullscreen-slide-wrapper';
          slide.parentNode.insertBefore(w, slide);
          w.appendChild(slide);
        }
      });
    }

    function removeFullscreenClasses() {
      track.querySelectorAll('.fullscreen-slide-wrapper').forEach(w => {
        const s = w.querySelector('.gallery-slide');
        if (s) {
          s.classList.remove('fullscreen-slide');
          w.parentNode.insertBefore(s, w);
          w.remove();
        }
      });
    }

    function openFullscreen() {
      if (!fullscreenOverlay) return;
      fullscreenOverlay.style.display = 'flex';
      generateFullscreenThumbnails();
      if (fullscreenImageContainer) fullscreenImageContainer.appendChild(track);
      addFullscreenClasses();
      fullscreenOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeFullscreen() {
      if (!fullscreenOverlay) return;
      pauseAllVideos();
      fullscreenOverlay.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        removeFullscreenClasses();
        galleryViewport.appendChild(track);
        fullscreenOverlay.style.display = 'none';
      }, 400);
    }

    function toggleVideoPlay(el) {
      if (el.paused) el.play(); else el.pause();
    }

    track.addEventListener('click', (e) => {
      if (window.matchMedia('(max-width: 768px)').matches && touchMoved) return;
      const activeSlide = track.querySelector('.gallery-slide.active');
      if (!activeSlide || !e.target.closest('.gallery-slide.active')) return;
      const player = activeSlide.querySelector('mux-player') || activeSlide.querySelector('video');
      if (player) {
        e.preventDefault();
        toggleVideoPlay(player);
        return;
      }
      openFullscreen();
    });

    if (fullscreenCloseBtn) fullscreenCloseBtn.addEventListener('click', closeFullscreen);
    if (fullscreenImageContainer) {
      fullscreenImageContainer.addEventListener('click', (e) => {
        const player = e.target.closest('mux-player') || e.target.closest('video');
        if (player) {
          e.stopPropagation();
          toggleVideoPlay(player);
          return;
        }
        closeFullscreen();
      });
    }
    if (fullscreenPrevBtn) fullscreenPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToPrev();
      updateFSThumbs();
    });
    if (fullscreenNextBtn) fullscreenNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToNext();
      updateFSThumbs();
    });

    document.addEventListener('keydown', (e) => {
      if (fullscreenOverlay && fullscreenOverlay.classList.contains('active')) {
        if (e.key === 'Escape') closeFullscreen();
        else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToPrev();
          updateFSThumbs();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToNext();
          updateFSThumbs();
        }
      } else {
        if (e.key === 'ArrowLeft') goToPrev();
        else if (e.key === 'ArrowRight') goToNext();
      }
    });

    generateSlides();
    if (thumbnailContainer) generateThumbnails();
    updateActiveStates();

    // Apply last-child snap-end on mobile
    if (window.matchMedia('(max-width: 768px)').matches) {
      const lastSlide = track.querySelector('.gallery-slide:last-child');
      if (lastSlide) {
        lastSlide.classList.add('snap-end');
        lastSlide.style.paddingRight = '16px';
      }
    }
  }

  // Auto-initialize if galleryMedia is defined globally
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.galleryMedia) initGallery();
    });
  } else {
    if (window.galleryMedia) initGallery();
  }

  // Export for manual initialization
  window.initProductGallery = initGallery;
})();
