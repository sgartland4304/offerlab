/* ==========================================================================
   PocketSomm - Component Loader
   Loads reusable nav and footer components into any page

   Usage:
   1. Add <div data-component="nav"></div> where you want the nav
   2. Add <div data-component="footer"></div> where you want the footer
   3. Include this script: <script src="js/components.js"></script>

   The components will be fetched and injected automatically on DOMContentLoaded.
   After injection, the main.js navigation initializer is re-run if available.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const componentSlots = document.querySelectorAll('[data-component]');

  for (const slot of componentSlots) {
    const name = slot.dataset.component;
    const path = `components/${name}.html`;

    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load ${path}`);
      const html = await response.text();

      // Replace the slot with the component HTML
      slot.outerHTML = html;
    } catch (error) {
      console.warn(`Component "${name}" could not be loaded:`, error);
    }
  }

  // Re-initialize navigation after components are loaded
  if (typeof initNavigation === 'function') {
    initNavigation();
  }
  if (typeof initSmoothScroll === 'function') {
    initSmoothScroll();
  }
});
