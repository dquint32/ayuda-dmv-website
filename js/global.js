/* ========================================== */
/* AYUDA DMV - GLOBAL JAVASCRIPT */
/* Version: 6.3 - Footer Translation + Link Fix */
/* ========================================== */

(function() {
  'use strict';

  /* --- 1. LANGUAGE MANAGER --- */
  const LanguageManager = {
    currentLang: 'es',

    translations: {
      es: {
        'nav.home': 'Inicio',
        'nav.services': 'Servicios',
        'nav.about': 'Nosotros',
        'nav.faq': 'FAQ',
        'nav.contact': 'Contacto',
        'meta.title': 'Ayuda DMV - Servicios Profesionales',
        'meta.contact': 'Ayuda DMV – Contacto',
        'footer.privacy': 'Política de Privacidad',
        'footer.terms': 'Términos de Servicio'
      },
      en: {
        'nav.home': 'Home',
        'nav.services': 'Services',
        'nav.about': 'About Us',
        'nav.faq': 'FAQ',
        'nav.contact': 'Contact',
        'meta.title': 'Ayuda DMV - Professional Services',
        'meta.contact': 'Ayuda DMV – Contact',
        'footer.privacy': 'Privacy Policy',
        'footer.terms': 'Terms of Service'
      }
    },

    init() {
      const savedLang = localStorage.getItem('ayudadmv_lang') || 'es';
      this.switchLanguage(savedLang);

      const toggleBtn = document.getElementById('lang-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const newLang = this.currentLang === 'es' ? 'en' : 'es';
          this.switchLanguage(newLang);
        });
      }
    },

    switchLanguage(lang) {
      this.currentLang = lang;
      localStorage.setItem('ayudadmv_lang', lang);
      document.documentElement.lang = lang;

      const btn = document.getElementById('lang-toggle');
      if (btn) btn.textContent = lang === 'es' ? 'EN' : 'ES';

      /* --- FIXED: data-en / data-es with line breaks + clickable links --- */
      document.querySelectorAll('[data-en][data-es]').forEach(el => {
        let newText = el.getAttribute(`data-${lang}`);
        if (!newText) return;

        // Convert \n\n to <br><br>
        newText = newText.replace(/\n\n/g, '<br><br>');

        // Replace placeholders with real links
        newText = newText
          .replace('{email}', '<a href="mailto:placasfirmas.david@gmail.com" style="color:white; text-decoration:underline;">placasfirmas.david@gmail.com</a>')
          .replace('{phone}', '<a href="tel:3035004122" style="color:white; text-decoration:underline;">(303) 500-4122</a>');

        // Preserve icons if present
        const icon = el.querySelector('i');
        if (icon) {
          const iconHTML = icon.outerHTML;
          el.innerHTML = `${iconHTML} ${newText}`;
        } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = newText;
        } else if (el.tagName === 'OPTION') {
          el.textContent = newText;
        } else {
          el.innerHTML = newText;
        }
      });

      /* --- Dictionary-based translations --- */
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (this.translations[lang] && this.translations[lang][key]) {
          el.textContent = this.translations[lang][key];
        }
      });

      /* --- Update <title> if needed --- */
      const titleEl = document.querySelector('title[data-i18n]');
      if (titleEl) {
        const titleKey = titleEl.getAttribute('data-i18n');
        if (this.translations[lang] && this.translations[lang][titleKey]) {
          document.title = this.translations[lang][titleKey];
        }
      }

      /* --- Recalculate accordion heights after translation --- */
      document.querySelectorAll('.accordion-button[aria-expanded="true"]').forEach(button => {
        const content = button.nextElementSibling;
        if (content) {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  };

  /* --- 2. MOBILE MENU MANAGER --- */
  const MobileMenuManager = {
    init() {
      const menuToggle = document.querySelector('.menu-toggle');
      const navMenu = document.querySelector('.nav-menu');
      if (!menuToggle || !navMenu) return;

      menuToggle.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !expanded);
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = expanded ? '' : 'hidden';
      });

      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          menuToggle.classList.remove('active');
          navMenu.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });

      document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') &&
            !navMenu.contains(e.target) &&
            !menuToggle.contains(e.target)) {
          menuToggle.classList.remove('active');
          navMenu.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }
  };

  /* --- 3. STICKY HEADER MANAGER --- */
  const HeaderScrollManager = {
    init() {
      const header = document.querySelector('.sticky-header');
      if (!header) return;

      window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
      });
    }
  };

  /* --- 4. FAQ ACCORDION MANAGER --- */
  const FAQAccordionManager = {
    init() {
      const accordionButtons = document.querySelectorAll('.accordion-button');
      if (!accordionButtons.length) return;

      accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
          const isExpanded = button.getAttribute('aria-expanded') === 'true';
          const content = button.nextElementSibling;
          const icon = button.querySelector('i');

          button.setAttribute('aria-expanded', !isExpanded);

          if (!isExpanded) {
            content.style.maxHeight = (content.scrollHeight + 50) + 'px';
            content.style.padding = '20px';
            if (icon) icon.style.transform = 'rotate(180deg)';
          } else {
            content.style.maxHeight = '0';
            content.style.padding = '0';
            if (icon) icon.style.transform = 'rotate(0deg)';
          }
        });
      });
    }
  };

  /* --- 5. SMOOTH SCROLL --- */
  const SmoothScrollManager = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (!href || href === '#') return;

          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  };

  /* --- 6. FORM VALIDATION --- */
  const FormValidationManager = {
    init() {
      const forms = document.querySelectorAll('form[id]');
      forms.forEach(form => {
        form.addEventListener('submit', (e) => {
          const honeypot = form.querySelector('input[name="website"]');
          if (honeypot && honeypot.value !== '') {
            e.preventDefault();
            console.log('Spam detected');
            return false;
          }
        });
      });
    }
  };

  /* --- 7. FADE-IN ANIMATIONS --- */
  const AnimationManager = {
    init() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      document.querySelectorAll('.service-card, .member-card, .price-card, .faq-item')
        .forEach(el => observer.observe(el));
    }
  };

  /* --- 8. INITIALIZATION --- */
  document.addEventListener('DOMContentLoaded', () => {
    LanguageManager.init();
    MobileMenuManager.init();
    HeaderScrollManager.init();
    FAQAccordionManager.init();
    SmoothScrollManager.init();
    FormValidationManager.init();

    setTimeout(() => {
      AnimationManager.init();
    }, 100);
  });

})();
