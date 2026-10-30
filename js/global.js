/* ================================================================
   AYUDA DMV — GLOBAL JAVASCRIPT
   Version 10.0 · Shared by every page
   ================================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'ayudadmv_lang';
  const EMAIL = 'placasfirmas.david@gmail.com';
  const PHONE_DISPLAY = '(303) 500-4122';

  // localStorage can throw in private windows; never let that break the page.
  const store = {
    get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ } }
  };

  /* ---------------------------------------------------------------
     1. LANGUAGE
     Each language has its own URL: Spanish at /, English at /en/.
     The page language comes from <html lang>, so search engines and
     visitors always see the same text. The EN/ES control is a plain
     link to the matching page (see tools/build_en.py).
     --------------------------------------------------------------- */
  const Language = {
    current: 'es',

    init() {
      this.current = (document.documentElement.lang || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
      store.set(STORAGE_KEY, this.current);
      const link = document.getElementById('lang-toggle');
      if (link && link.tagName === 'A') {
        // Keep the reader's place when switching languages.
        link.addEventListener('click', () => {
          store.set(STORAGE_KEY, this.current === 'es' ? 'en' : 'es');
          if (window.location.hash) link.href = link.href.split('#')[0] + window.location.hash;
        });
      }
    }
  };

  /* ---------------------------------------------------------------
     1b. LIGHT / DARK THEME (initial theme is set by the inline script in <head>)
     --------------------------------------------------------------- */
  const Theme = {
    init() {
      const btn = document.getElementById('theme-toggle');
      if (!btn) return;
      this.sync(btn);
      btn.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        store.set('ayudadmv_theme', next);
        this.sync(btn);
      });
      document.addEventListener('languagechange', () => this.sync(btn));
    },
    sync(btn) {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      const es = Language.current === 'es';
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? (es ? 'Cambiar a modo claro' : 'Switch to light mode')
                                          : (es ? 'Cambiar a modo oscuro' : 'Switch to dark mode'));
      btn.title = btn.getAttribute('aria-label');
    }
  };

  /* ---------------------------------------------------------------
     2. MOBILE MENU
     --------------------------------------------------------------- */
  const MobileMenu = {
    init() {
      const toggle = document.querySelector('.menu-toggle');
      const menu = document.querySelector('.nav-menu');
      if (!toggle || !menu) return;

      const setOpen = open => {
        toggle.setAttribute('aria-expanded', String(open));
        menu.classList.toggle('active', open);
        document.body.style.overflow = open ? 'hidden' : '';
        const icon = toggle.querySelector('i');
        if (icon) icon.className = open ? 'fas fa-times' : 'fas fa-bars';
      };

      toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
      window.matchMedia('(min-width: 992px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
    }
  };

  /* ---------------------------------------------------------------
     3. HEADER SHADOW + BACK-TO-TOP
     --------------------------------------------------------------- */
  const Scroll = {
    init() {
      const header = document.querySelector('.site-header');
      const topBtn = document.getElementById('back-to-top');
      const onScroll = () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 20);
        if (topBtn) topBtn.classList.toggle('visible', window.scrollY > 400);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  };

  /* ---------------------------------------------------------------
     4. FAQ "EXPAND ALL" (items are native <details>, so they work without JS)
     --------------------------------------------------------------- */
  const FAQ = {
    init() {
      const btn = document.getElementById('toggle-all-faq');
      const items = document.querySelectorAll('.faq-item');
      if (!btn || !items.length) return;
      const label = btn.querySelector('span');

      const refresh = () => {
        const allOpen = Array.from(items).every(d => d.open);
        btn.setAttribute('aria-expanded', String(allOpen));
        if (label) {
          label.setAttribute('data-es', allOpen ? 'Contraer todo' : 'Expandir todo');
          label.setAttribute('data-en', allOpen ? 'Collapse all' : 'Expand all');
          label.textContent = label.getAttribute('data-' + Language.current);
        }
      };

      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        items.forEach(d => { d.open = open; });
        refresh();
      });
      items.forEach(d => d.addEventListener('toggle', refresh));
      document.addEventListener('languagechange', refresh);
    }
  };

  /* ---------------------------------------------------------------
     5. REVEAL CARDS ON SCROLL
     --------------------------------------------------------------- */
  const Reveal = {
    init() {
      if (!('IntersectionObserver' in window)) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      document.querySelectorAll('.tile, .pkg, .profile').forEach(el => observer.observe(el));
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Language.init();
    Theme.init();
    MobileMenu.init();
    Scroll.init();
    FAQ.init();
  });
})();
