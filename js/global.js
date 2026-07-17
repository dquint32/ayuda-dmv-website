/* ========================================== */
/* AYUDA DMV - GLOBAL JAVASCRIPT              */
/* Version: 7.0 - Refactored & Integrated     */
/* ========================================== */

(function () {
  'use strict';

  /* ---------------------------------------- */
  /* 1. LANGUAGE MANAGER                       */
  /* ---------------------------------------- */
  const LanguageManager = {
    currentLang: 'es',

    translations: {
      es: {
        'nav.home':     'Inicio',
        'nav.services': 'Servicios',
        'nav.about':    'Sobre Mí',
        'nav.faq':      'FAQ',
        'nav.contact':  'Contacto',
        'meta.title':   'Ayuda DMV Denver | Trámites, Notaría y Traducción en Español',
        'meta.services_title': 'Servicios y Precios | Ayuda DMV — Documentos, Notaría, Pasaportes',
        'meta.about_title': 'Sobre Mí | Ayuda DMV — David Quintana, Especialista en Cumplimiento del DMV',
        'meta.faq_title': 'Preguntas Frecuentes | Ayuda DMV Denver',
        'meta.contact': 'Contacto | Ayuda DMV — (303) 500-4122',
        'footer.privacy': 'Política de Privacidad',
        'footer.terms':   'Términos de Servicio'
      },
      en: {
        'nav.home':     'Home',
        'nav.services': 'Services',
        'nav.about':    'About Me',
        'nav.faq':      'FAQ',
        'nav.contact':  'Contact',
        'meta.title':   'Ayuda DMV Denver | DMV Paperwork, Notary & Translation in Spanish',
        'meta.services_title': 'Services & Pricing | Ayuda DMV — Document Prep, Notary, Passports',
        'meta.about_title': 'About Me | Ayuda DMV — David Quintana, DMV Compliance Specialist',
        'meta.faq_title': 'FAQ | Ayuda DMV Denver',
        'meta.contact': 'Contact | Ayuda DMV — (303) 500-4122',
        'footer.privacy': 'Privacy Policy',
        'footer.terms':   'Terms of Service'
      }
    },

    init() {
      const savedLang = localStorage.getItem('ayudadmv_lang') || 'es';
      this.switchLanguage(savedLang);

      const toggleBtn = document.getElementById('lang-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          this.switchLanguage(this.currentLang === 'es' ? 'en' : 'es');
        });
      }
    },

    switchLanguage(lang) {
      this.currentLang = lang;
      localStorage.setItem('ayudadmv_lang', lang);
      document.documentElement.lang = lang;

      const btn = document.getElementById('lang-toggle');
      if (btn) btn.textContent = lang === 'es' ? 'EN' : 'ES';

      // Translate all data-en / data-es elements
      document.querySelectorAll('[data-en][data-es]').forEach(el => {
        let text = el.getAttribute(`data-${lang}`);
        if (!text) return;

        // Convert \n\n to <br><br>
        text = text.replace(/\n\n/g, '<br><br>');

        // Inject linked placeholders
        text = text
          .replace('{email}', '<a href="mailto:placasfirmas.david@gmail.com" style="color:white;text-decoration:underline;">placasfirmas.david@gmail.com</a>')
          .replace('{phone}', '<a href="tel:3035004122" style="color:white;text-decoration:underline;">(303) 500-4122</a>');

        // Preserve any existing <i> icon
        const icon = el.querySelector('i');
        if (icon) {
          el.innerHTML = `${icon.outerHTML} ${text}`;
        } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else if (el.tagName === 'OPTION') {
          el.textContent = text;
        } else {
          el.innerHTML = text;
        }
      });

      // Translate data-i18n elements via dictionary
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = this.translations[lang]?.[key];
        if (value) el.textContent = value;
      });

      // Update <title> if it carries data-i18n
      const titleEl = document.querySelector('title[data-i18n]');
      if (titleEl) {
        const value = this.translations[lang]?.[titleEl.getAttribute('data-i18n')];
        if (value) document.title = value;
      }

      // Recalculate open accordion heights after text reflow
      document.querySelectorAll('.accordion-button[aria-expanded="true"]').forEach(btn => {
        const content = btn.nextElementSibling;
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      });
    }
  };

  /* ---------------------------------------- */
  /* 2. MOBILE MENU MANAGER                    */
  /* ---------------------------------------- */
  const MobileMenuManager = {
    init() {
      const menuToggle = document.querySelector('.menu-toggle');
      const navMenu    = document.querySelector('.nav-menu');
      if (!menuToggle || !navMenu) return;

      const close = () => {
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      };

      menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
          close();
        } else {
          menuToggle.classList.add('active');
          menuToggle.setAttribute('aria-expanded', 'true');
          navMenu.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });

      // Close when a nav link is clicked
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', close);
      });

      // Close on outside click
      document.addEventListener('click', e => {
        if (
          navMenu.classList.contains('active') &&
          !navMenu.contains(e.target) &&
          !menuToggle.contains(e.target)
        ) {
          close();
        }
      });
    }
  };

  /* ---------------------------------------- */
  /* 3. STICKY HEADER MANAGER                  */
  /* ---------------------------------------- */
  const HeaderScrollManager = {
    init() {
      const header = document.querySelector('.sticky-header');
      if (!header) return;
      window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
      }, { passive: true });
    }
  };

  /* ---------------------------------------- */
  /* 4. FAQ ACCORDION MANAGER                  */
  /* ---------------------------------------- */
  const FAQAccordionManager = {
    init() {
      document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', () => {
          const isExpanded = button.getAttribute('aria-expanded') === 'true';
          const content    = button.nextElementSibling;
          const icon       = button.querySelector('i');

          button.setAttribute('aria-expanded', String(!isExpanded));

          if (!isExpanded) {
            content.style.maxHeight = (content.scrollHeight + 50) + 'px';
            content.style.padding   = '20px';
            if (icon) icon.style.transform = 'rotate(180deg)';
          } else {
            content.style.maxHeight = '0';
            content.style.padding   = '0';
            if (icon) icon.style.transform = 'rotate(0deg)';
          }
        });
      });
    }
  };

  /* ---------------------------------------- */
  /* 5. SMOOTH SCROLL MANAGER                  */
  /* ---------------------------------------- */
  const SmoothScrollManager = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          const href   = this.getAttribute('href');
          if (!href || href === '#') return;
          const target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();
          const offset = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        });
      });
    }
  };

  /* ---------------------------------------- */
  /* 6. FORM VALIDATION MANAGER                */
  /* ---------------------------------------- */
  const FormValidationManager = {
    init() {
      document.querySelectorAll('form[id]').forEach(form => {
        form.addEventListener('submit', e => {
          const honeypot = form.querySelector('input[name="website"]');
          if (honeypot && honeypot.value !== '') {
            e.preventDefault();
          }
        });
      });
    }
  };

  /* ---------------------------------------- */
  /* 7. ANIMATION MANAGER                      */
  /* ---------------------------------------- */
  const AnimationManager = {
    init() {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('fade-in');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      document
        .querySelectorAll('.service-card, .member-card, .price-card, .faq-item')
        .forEach(el => observer.observe(el));
    }
  };

  /* ---------------------------------------- */
  /* 8. BACK TO TOP MANAGER                    */
  /* ---------------------------------------- */
  const BackToTopManager = {
    init() {
      const btn = document.getElementById('back-to-top');
      if (!btn) return;

      window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 300);
      }, { passive: true });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  /* ---------------------------------------- */
  /* 9. INIT                                   */
  /* ---------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    LanguageManager.init();
    MobileMenuManager.init();
    HeaderScrollManager.init();
    FAQAccordionManager.init();
    SmoothScrollManager.init();
    FormValidationManager.init();
    BackToTopManager.init();

    // Slight delay so IntersectionObserver fires after layout is painted
    setTimeout(() => AnimationManager.init(), 100);
  });

})();
