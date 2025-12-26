/* ========================================== */
/* AYUDA DMV - GLOBAL JAVASCRIPT */
/* Version: 6.1 - Fixed FAQ Accordion */
/* ========================================== */

(function() {
  'use strict';

  /* --- 1. LANGUAGE MANAGER --- */
  const LanguageManager = {
    // Stores current language (default 'es')
    currentLang: 'es', 
    
    // Translation dictionary for elements using [data-i18n]
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
       // 1. Check local storage for saved language preference
       const savedLang = localStorage.getItem('ayudadmv_lang') || 'es';
       this.switchLanguage(savedLang);

       // 2. Bind click event to language toggle button
       const toggleBtn = document.getElementById('lang-toggle');
       if(toggleBtn) {
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
      
      // Update Button Text
      const btn = document.getElementById('lang-toggle');
      if(btn) btn.textContent = lang === 'es' ? 'EN' : 'ES';

      // Update elements with data-en/data-es attributes
      document.querySelectorAll('[data-en][data-es]').forEach(el => {
         const newText = el.getAttribute(`data-${lang}`);
         if (!newText) return;
         
         // Preserve FontAwesome icons
         const icon = el.querySelector('i');
         if (icon) {
            const iconHTML = icon.outerHTML;
            el.innerHTML = `${iconHTML} ${newText}`;
         } else {
            // Check if it's an input/textarea (use placeholder)
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
              el.placeholder = newText;
            } 
            // Check if it's a select option
            else if (el.tagName === 'OPTION') {
              el.textContent = newText;
            }
            // Regular text content
            else {
              el.textContent = newText;
            }
         }
      });

      // Update elements with data-i18n attributes using dictionary
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(this.translations[lang] && this.translations[lang][key]) {
          el.textContent = this.translations[lang][key];
        }
      });

      // Update page title if it has data-i18n
      const titleEl = document.querySelector('title[data-i18n]');
      if (titleEl) {
        const titleKey = titleEl.getAttribute('data-i18n');
        if (this.translations[lang] && this.translations[lang][titleKey]) {
          document.title = this.translations[lang][titleKey];
        }
      }
      
      // Recalculate open accordion heights after language change
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

      // Toggle Menu on Click
      menuToggle.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !expanded);
        
        // Toggle 'active' class for CSS transition
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scrolling when menu is open
        if (!expanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
      });

      // Close menu when clicking a link (Mobile UX)
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          menuToggle.classList.remove('active');
          navMenu.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });

      // Close menu when clicking outside
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

      // Add 'scrolled' class when page is scrolled down > 50px
      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
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

          // Toggle current accordion
          button.setAttribute('aria-expanded', !isExpanded);
          
          if (!isExpanded) {
            // Opening: Set max-height to full scrollHeight + extra padding
            content.style.maxHeight = (content.scrollHeight + 50) + 'px';
            content.style.padding = '20px';
            if (icon) icon.style.transform = 'rotate(180deg)';
          } else {
            // Closing
            content.style.maxHeight = '0';
            content.style.padding = '0';
            if (icon) icon.style.transform = 'rotate(0deg)';
          }
        });
      });
    }
  };

  /* --- 5. SMOOTH SCROLL FOR ANCHOR LINKS --- */
  const SmoothScrollManager = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          
          // Ignore empty hash or just '#'
          if (!href || href === '#') return;
          
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const headerOffset = 80; // Height of sticky header
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

  /* --- 6. FORM VALIDATION (if needed in future) --- */
  const FormValidationManager = {
    init() {
      const forms = document.querySelectorAll('form[id]');
      
      forms.forEach(form => {
        form.addEventListener('submit', (e) => {
          // Basic honeypot check
          const honeypot = form.querySelector('input[name="website"]');
          if (honeypot && honeypot.value !== '') {
            e.preventDefault();
            console.log('Spam detected');
            return false;
          }

          // Add more validation as needed
        });
      });
    }
  };

  /* --- 7. FADE IN ANIMATION ON SCROLL --- */
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

      // Observe elements that should fade in
      document.querySelectorAll('.service-card, .member-card, .price-card, .faq-item').forEach(el => {
        observer.observe(el);
      });
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
    
    // Delay animation manager slightly for better performance
    setTimeout(() => {
      AnimationManager.init();
    }, 100);
  });

})();
