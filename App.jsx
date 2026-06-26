import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import translations from './translations';
import logoImg from './logo.png';
import waLogoImg from './whatsappLogo.png';
import heroSlide1 from './image copy.png';
import heroSlide2 from './image copy 2.png';
import heroSlide3 from './image copy 3.png';

const HERO_SLIDES = [heroSlide1, heroSlide2, heroSlide3];

/* ─── HOOKS ────────────────────────────────────────────────────── */

/** GLOBAL Particle canvas — covers the entire page, reacts to mouse */
function useGlobalParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let w, h, animId;
    let mouseX = -9999, mouseY = -9999;
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 35 : 85;
    const MOUSE_RADIUS = isMobile ? 80 : 180;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    function onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const isBlue = Math.random() > 0.5;
      const startX = Math.random() * (window.innerWidth || 1400);
      const startY = Math.random() * (window.innerHeight || 900);
      const maxAlpha = isMobile ? 0.20 : 0.6;
      const minAlpha = isMobile ? 0.05 : 0.2;
      return {
        x: startX,
        y: startY,
        baseX: startX,
        baseY: startY,
        vxDisplace: 0,
        vyDisplace: 0,
        r: (isMobile ? 0.8 : 1.0) + Math.random() * (isMobile ? 1.0 : 2.2),
        vx: (Math.random() - 0.5) * (isMobile ? 0.12 : 0.35),
        vy: (Math.random() - 0.5) * (isMobile ? 0.12 : 0.35),
        alpha: minAlpha + Math.random() * (maxAlpha - minAlpha),
        pulseSpeed: 0.005 + Math.random() * 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        colorBase: isBlue ? '76, 120, 212' : '148, 163, 184',
      };
    });

    let time = 0;

    function tick() {
      time += 0.016;
      particles.forEach(p => {
        // Natural drift of base position
        p.baseX += p.vx;
        p.baseY += p.vy;

        // Wrap around boundaries shifting both base and current position
        if (p.baseX < -20) {
          p.baseX += w + 40;
          p.x += w + 40;
        } else if (p.baseX > w + 20) {
          p.baseX -= w + 40;
          p.x -= w + 40;
        }
        if (p.baseY < -20) {
          p.baseY += h + 40;
          p.y += h + 40;
        } else if (p.baseY > h + 20) {
          p.baseY -= h + 40;
          p.y -= h + 40;
        }

        // Mouse interaction (repulsion)
        const dxMouse = p.x - mouseX;
        const dyMouse = p.y - mouseY;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        let rx = 0;
        let ry = 0;
        if (distMouse < MOUSE_RADIUS && distMouse > 0) {
          const force = (1 - distMouse / MOUSE_RADIUS) * 3.5;
          rx = (dxMouse / distMouse) * force;
          ry = (dyMouse / distMouse) * force;
        }

        // Restoring force (spring back to base position)
        const ax = (p.baseX - p.x) * 0.08;
        const ay = (p.baseY - p.y) * 0.08;

        // Damped velocity update
        p.vxDisplace = (p.vxDisplace + ax + rx) * 0.88;
        p.vyDisplace = (p.vyDisplace + ay + ry) * 0.88;

        p.x += p.vxDisplace;
        p.y += p.vyDisplace;

        p._alpha = p.alpha * (0.7 + 0.3 * Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset));
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Dots with glow
      particles.forEach(p => {
        const currentAlpha = p._alpha || p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorBase}, ${currentAlpha})`;
        ctx.fill();

        if (!isMobile) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.colorBase}, ${currentAlpha * 0.22})`;
          ctx.fill();
        }
      });
    }

    let last = 0;
    function loop(ts) {
      if (ts - last > 16) {
        tick();
        draw();
        last = ts;
      }
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [canvasRef]);
}


/** Enhanced Scroll reveal with IntersectionObserver — supports staggered children */
function useScrollReveal() {
  useEffect(() => {
    const revealClasses = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale', '.reveal-rotate'];
    const els = document.querySelectorAll(revealClasses.join(', '));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.10, rootMargin: '0px 0px -50px 0px' }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/** Parallax effect for elements with data-parallax */
function useParallax() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          document.querySelectorAll('[data-parallax]').forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.15;
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const viewCenter = window.innerHeight / 2;
            const offset = (center - viewCenter) * speed;
            el.style.transform = `translate3d(0, ${offset}px, 0)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

/** Animated counter for metric values */
function useCountUp(ref, target, duration = 2000) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(el);
          const numTarget = parseFloat(target.replace(/[^\d.]/g, ''));
          const suffix = target.replace(/[\d.]/g, '');
          const isFloat = target.includes('.');
          let startTime = null;

          function animate(ts) {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
            const current = numTarget * eased;
            el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, target, duration]);
}

/** Custom cursor */
function useCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.body.classList.add('has-cursor');

    let rx = -100, ry = -100;
    let tx = -100, ty = -100;

    function onMove(e) {
      tx = e.clientX;
      ty = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      }
    }

    function lerp(a, b, t) { return a + (b - a) * t; }

    let animId;
    function raf() {
      rx = lerp(rx, tx, 0.15);
      ry = lerp(ry, ty, 0.15);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      animId = requestAnimationFrame(raf);
    }
    animId = requestAnimationFrame(raf);

    function onOver(e) {
      if (e.target.closest('a, button, [role="button"]')) {
        ringRef.current?.classList.add('hovered');
      }
    }
    function onOut(e) {
      const related = e.relatedTarget;
      if (e.target.closest('a, button, [role="button"]') && !(related && related.closest && related.closest('a, button, [role="button"]'))) {
        ringRef.current?.classList.remove('hovered');
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout', onOut, { passive: true });

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(animId);
      document.body.classList.remove('has-cursor');
    };
  }, []);

  return { dotRef, ringRef };
}

/** Topbar scroll effect */
function useTopbarScroll() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return scrolled;
}

/** Scroll active section spy hook */
function useScrollSpy(ids, offset = 160) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;

      if (window.scrollY < 200) {
        setActiveId('');
        return;
      }

      let currentId = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentId = id;
            break;
          }
        }
      }
      setActiveId(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ids, offset]);

  return activeId;
}

/** Magnetic hover effect for buttons */
function MagneticButton({ children, className, href, onClick, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.2;
      const dy = (e.clientY - cy) * 0.2;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    function onLeave() {
      el.style.transform = '';
      el.style.transition = 'transform 400ms cubic-bezier(.16,1,.3,1)';
      setTimeout(() => { el.style.transition = ''; }, 400);
    }

    el.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave, { passive: true });

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (href) {
    return <a ref={ref} className={className} href={href} onClick={onClick} {...props}>{children}</a>;
  }
  return <button ref={ref} className={className} onClick={onClick} {...props}>{children}</button>;
}

/** Animated metric counter component */
function AnimatedMetric({ value, label }) {
  const ref = useRef(null);
  useCountUp(ref, value);
  return (
    <div className="case-metric reveal-scale">
      <strong className="metric-value" ref={ref}>0</strong>
      <span className="metric-label">{label}</span>
    </div>
  );
}

/* ─── TICKER ────────────────────────────────────────────────────── */
const TICKER_ITEMS = {
  es: ['Estrategia', 'Visibilidad', 'Posicionamiento', 'Identidad', 'Crecimiento', 'Dirección', 'Resultados'],
  en: ['Strategy', 'Visibility', 'Positioning', 'Identity', 'Growth', 'Direction', 'Results'],
};

function Ticker({ locale = 'es' }) {
  const baseItems = TICKER_ITEMS[locale] || TICKER_ITEMS.es;
  const items = [...baseItems, ...baseItems, ...baseItems]; // triplicate for seamless loop
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-inner">
        {items.map((item, i) => (
          <span key={`${locale}-${i}`} className="ticker-item">
            {item}
            <span className="ticker-sep" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── FLOATING GLOW ORBS ─────────────────────────────────────────── */
function FloatingOrbs({ variant = 'dark' }) {
  return (
    <div className={`floating-orbs floating-orbs-${variant}`} aria-hidden="true">
      <div className="float-orb float-orb-1" />
      <div className="float-orb float-orb-2" />
      <div className="float-orb float-orb-3" />
      <div className="float-orb float-orb-4" />
    </div>
  );
}

/* ─── MAIN APP ──────────────────────────────────────────────────── */
function App() {
  const [locale, setLocale] = useState('es');
  const [activeHeroWord, setActiveHeroWord] = useState(0);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeMethodStep, setActiveMethodStep] = useState(0);
  const [modalService, setModalService] = useState(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const servicesRef = useRef(null);
  const globalCanvasRef = useRef(null);

  const t = useCallback((key) => translations[locale]?.[key] ?? key, [locale]);

  const services = useMemo(() => t('services.list'), [t]);
  const scenarioCards = useMemo(() => t('scenarios.cards'), [t]);
  const differences = useMemo(() => t('difference.rows'), [t]);
  const steps = useMemo(() => t('method.steps'), [t]);
  const heroWords = useMemo(() => t('hero.words'), [t]);
  const testimonials = useMemo(() => t('testimonials.list'), [t]);

  // Hooks
  useGlobalParticles(globalCanvasRef);
  useScrollReveal();
  useParallax();
  const { dotRef, ringRef } = useCursor();
  const topbarScrolled = useTopbarScroll();
  const activeSection = useScrollSpy(['servicios', 'como-funciona', 'diferencial']);

  useEffect(() => { setActiveHeroWord(0); }, [heroWords]);

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) return;
    const id = setInterval(() => setActiveHeroWord(i => (i + 1) % heroWords.length), 1300);
    return () => clearInterval(id);
  }, [heroWords.length]);

  // Hero carousel auto-play
  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) return;
    const id = setInterval(() => setHeroSlide(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    const fn = () => { if (isMobileMenuOpen) setIsMobileMenuOpen(false); };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback((href) => {
    setIsMobileMenuOpen(false);
    if (href) {
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, []);

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) return;
    const id = setInterval(() => setActiveTestimonial(i => (i + 1) % testimonials.length), 4500);
    return () => clearInterval(id);
  }, [testimonials.length]);

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) return;
    const id = setInterval(() => setActiveMethodStep(i => (i + 1) % steps.length), 5000);
    return () => clearInterval(id);
  }, [steps.length]);

  const modalServiceData = useMemo(
    () => services.find(s => s.id === modalService) ?? null,
    [services, modalService]
  );

  const handleServicesScroll = useCallback(() => {
    if (!servicesRef.current) return;
    const { scrollLeft, clientWidth } = servicesRef.current;
    setActiveServiceIndex(Math.round(scrollLeft / clientWidth));
  }, []);

  const scrollToService = useCallback((index) => {
    if (!servicesRef.current) return;
    servicesRef.current.scrollTo({ left: index * servicesRef.current.clientWidth, behavior: 'smooth' });
    setActiveServiceIndex(index);
  }, []);

  // Re-run scroll reveal when locale changes (new elements)
  useEffect(() => {
    const revealClasses = ['.reveal:not(.visible)', '.reveal-left:not(.visible)', '.reveal-right:not(.visible)', '.reveal-scale:not(.visible)', '.reveal-rotate:not(.visible)'];
    const els = document.querySelectorAll(revealClasses.join(', '));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.10, rootMargin: '0px 0px -50px 0px' }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [locale]);

  return (
    <div className="page-shell">
      {/* GLOBAL particle canvas — covers entire page */}
      <canvas className="global-particle-canvas" ref={globalCanvasRef} aria-hidden="true" />

      {/* Custom cursor */}
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />

      {/* ── MOBILE MENU OVERLAY ── */}
      <div className={`mobile-menu-overlay${isMobileMenuOpen ? ' open' : ''}`} aria-hidden={!isMobileMenuOpen}>
        <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
        <nav className="mobile-menu-drawer" aria-label="Menú de navegación móvil">
          <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Cerrar menú" type="button">
            ✕
          </button>
          <a className="brand mobile-menu-brand" href="#inicio" onClick={() => closeMobileMenu('#inicio')}>
            <img src={logoImg} className="brand-logo" alt="SCALIA Logo" />
          </a>
          <div className="mobile-menu-links">
            <a href="#inicio" className="mobile-nav-link" onClick={() => closeMobileMenu('#inicio')}>
              <span className="mobile-nav-num">01</span>{t('nav.home')}
            </a>
            <a href="#servicios" className="mobile-nav-link" onClick={() => closeMobileMenu('#servicios')}>
              <span className="mobile-nav-num">02</span>{t('nav.services')}
            </a>
            <a href="#como-funciona" className="mobile-nav-link" onClick={() => closeMobileMenu('#como-funciona')}>
              <span className="mobile-nav-num">03</span>{t('nav.how')}
            </a>
            <a href="#diferencial" className="mobile-nav-link" onClick={() => closeMobileMenu('#diferencial')}>
              <span className="mobile-nav-num">04</span>{t('nav.difference')}
            </a>
            <a href="#contacto" className="mobile-nav-link" onClick={() => closeMobileMenu('#contacto')}>
              <span className="mobile-nav-num">05</span>{t('nav.contact')}
            </a>
          </div>
          <a className="mobile-menu-cta button-header-cta" href="https://wa.me/12023179939?text=Hola%20quiero%20hacer%20crecer%20mi%20marca%20con%20SCALIA" target="_blank" rel="noreferrer" onClick={() => setIsMobileMenuOpen(false)}>
            {t('nav.cta')}
          </a>
          <div className="mobile-menu-locale">
            <button className={`locale${locale === 'es' ? ' active' : ''}`} type="button" onClick={() => setLocale('es')}>SPA</button>
            <button className={`locale${locale === 'en' ? ' active' : ''}`} type="button" onClick={() => setLocale('en')}>ENG</button>
          </div>
        </nav>
      </div>

      {/* ── TOPBAR ── */}
      <header className={`topbar${topbarScrolled ? ' scrolled' : ''}`}>
        <div className="brand-logo-container">
          <button
            className="hamburger-btn"
            onClick={() => setIsMobileMenuOpen(o => !o)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
            type="button"
          >
            <span className={`hamburger-line${isMobileMenuOpen ? ' open' : ''}`} />
            <span className={`hamburger-line${isMobileMenuOpen ? ' open' : ''}`} />
            <span className={`hamburger-line${isMobileMenuOpen ? ' open' : ''}`} />
          </button>
          <a className="brand" href="#inicio" aria-label="SCALIA inicio">
            <img src={logoImg} className="brand-logo" alt="SCALIA Logo" />
          </a>
        </div>

        <nav className="desktop-nav" aria-label="Navegación principal">
          <a href="#inicio" className={`nav-pill${activeSection === '' ? ' active' : ''}`}>
            {locale === 'es' ? 'INICIO' : 'HOME'}
          </a>
          <a href="#servicios" className={`nav-pill${activeSection === 'servicios' ? ' active' : ''}`}>
            {locale === 'es' ? 'SERVICIOS' : 'SERVICES'}
          </a>
          <a href="#como-funciona" className={`nav-pill${activeSection === 'como-funciona' ? ' active' : ''}`}>
            {locale === 'es' ? 'CÓMO FUNCIONA' : 'HOW IT WORKS'}
          </a>
          <a href="#diferencial" className={`nav-pill${activeSection === 'diferencial' ? ' active' : ''}`}>
            {locale === 'es' ? 'DIFERENCIAL' : 'DIFFERENCE'}
          </a>
          <a href="#contacto" className={`nav-pill${activeSection === 'contacto' ? ' active' : ''}`}>
            {locale === 'es' ? 'CONTACTO' : 'CONTACT'}
          </a>
        </nav>

        <div className="topbar-actions">
          <div className="locale-switch" aria-label="Selector de idioma">
            <button className={`locale${locale === 'es' ? ' active' : ''}`} type="button" onClick={() => setLocale('es')}>SPA</button>
            <button className={`locale${locale === 'en' ? ' active' : ''}`} type="button" onClick={() => setLocale('en')}>ENG</button>
          </div>
          <MagneticButton className="button-header-cta" href="https://wa.me/12023179939?text=Hola%20quiero%20hacer%20crecer%20mi%20marca%20con%20SCALIA" target="_blank" rel="noreferrer">{t('nav.cta')}</MagneticButton>
        </div>
      </header>

      <main>
        {/* ── HERO ── */}
        <section id="inicio" className="hero-wrapper section-dark">

          {/* ── Part 1: Image Carousel ── */}
          <div className="hero-carousel-wrapper">
            <div className="hero-bg-carousel" aria-hidden="true">
              {HERO_SLIDES.map((src, i) => (
                <div
                  key={i}
                  className={`hero-bg-slide${i === heroSlide ? ' active' : ''}`}
                  style={{ backgroundImage: `url(${src})` }}
                />
              ))}
              <div className="hero-bg-overlay" />
            </div>

            {/* Slide pill tabs at bottom of carousel */}
            <div className="hero-slide-tabs" aria-label="Seleccionar diapositiva">
              {[
                { label: locale === 'es' ? 'DISEÑO' : 'DESIGN', href: '#servicios' },
                { label: locale === 'es' ? 'CRECIMIENTO' : 'GROWTH', href: '#como-funciona' },
                { label: locale === 'es' ? 'POSICIONAMIENTO' : 'POSITIONING', href: '#diferencial' },
              ].map((tab, i) => (
                <a
                  key={tab.label}
                  href={tab.href}
                  className={`hero-slide-tab${i === heroSlide ? ' active' : ''}`}
                  onClick={() => setHeroSlide(i)}
                >
                  {tab.label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Part 2: Text Content Below Carousel ── */}
          <div className="hero-text-block">
            <div className="container">
              <h1 className="hero-title">
                <span className="hero-line-1">{t('hero.title.before')}</span>
                <span key={activeHeroWord + locale} className="accent hero-word-carousel">
                  {heroWords[activeHeroWord]}
                </span>
                <span className="hero-line-3">{t('hero.title.after')}</span>
              </h1>
              <p className="hero-copy">{t('hero.copy')}</p>
              <div className="hero-actions">
                <MagneticButton className="button button-premium hero-cta-anim" href="https://wa.me/12023179939?text=Hola%20quiero%20hacer%20crecer%20mi%20marca%20con%20SCALIA" target="_blank" rel="noreferrer">{t('hero.cta')} <span aria-hidden="true">→</span></MagneticButton>
                <MagneticButton className="button button-ghost hero-cta-anim hero-cta-delay" href="#como-funciona">{t('hero.cta.cases')}</MagneticButton>
              </div>
            </div>
          </div>

        </section>

        {/* ── TICKER ── */}
        <Ticker locale={locale} />

        {/* ── STATEMENT ── */}
        <section className="statement section-light">
          <FloatingOrbs variant="light" />
          <div className="container statement-grid">
            <div className="reveal-left">
              <p className="eyebrow eyebrow-dark">{t('statement.eyebrow')}</p>
              <h2 className="section-title section-title-dark">
                {t('statement.title')}<span className="accent-dark">{t('statement.title.accent')}</span>
              </h2>
            </div>
            <p className="section-copy section-copy-dark reveal-right">
              {t('statement.copy')}
            </p>
          </div>
        </section>

        {/* ── RESULTS STRIP ── */}
        <section className="results-strip">
          <div className="container results-strip-inner">
            <p className="quote reveal-scale">
              <span className="quote-mark" aria-hidden="true">"</span>
              {t('results.quote').replace(/^"|"$/g, '')}
            </p>
          </div>
        </section>

        {/* ── SCENARIOS ── */}
        <section className="scenarios section-light">
          <FloatingOrbs variant="light" />
          <div className="container">
            <div className="scenarios-heading reveal">
              <p className="eyebrow eyebrow-dark">{t('scenarios.eyebrow')}</p>
              <h2 className="section-title section-title-dark">
                {t('scenarios.title')}<span className="accent-dark">{t('scenarios.title.accent')}</span>
              </h2>
            </div>
            <div className="objection-grid">
              {scenarioCards.map((card, i) => (
                <div key={card.icon} className="objection-card reveal" style={{ transitionDelay: `${i * 120}ms` }}>
                  <span className="objection-icon pulse-icon">{card.icon}</span>
                  <h3 className="objection-title">{card.title}</h3>
                  <p className="objection-copy">{card.copy}</p>
                  <div className="card-shine" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DECISION CTA ── */}
        <section className="decision section-light">
          <div className="decision-particles" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
          </div>
          <div className="container decision-inner">
            <div className="reveal-left">
              <h2 className="section-title section-title-dark small-margin">{t('decision.title')}</h2>
              <p className="section-copy section-copy-dark subtle">{t('decision.copy')}</p>
            </div>
             <MagneticButton className="button button-primary reveal-right glow-button" href="https://wa.me/12023179939?text=Hola%20quiero%20hacer%20crecer%20mi%20marca%20con%20SCALIA" target="_blank" rel="noreferrer">{t('decision.cta')} <span aria-hidden="true">→</span></MagneticButton>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="testimonials section-light">
          <FloatingOrbs variant="light" />
          <div className="container">
            <div className="testimonials-heading reveal">
              <p className="eyebrow eyebrow-dark">{t('testimonials.eyebrow')}</p>
              <h2 className="section-title section-title-dark">
                {t('testimonials.title')}<span className="accent-dark">{t('testimonials.title.accent')}</span>
              </h2>
            </div>
            <div className="testimonials-carousel">
              {testimonials.map((item, i) => (
                <div key={i} className={`testimonial-card${i === activeTestimonial ? ' active' : ''}`}>
                  <blockquote>
                    <p>"{item.text}"</p>
                    <footer>
                      <strong>{item.name}</strong>
                      <span>{item.role}</span>
                    </footer>
                  </blockquote>
                </div>
              ))}
            </div>
            <div className="testimonials-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`testimonial-dot${i === activeTestimonial ? ' active' : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                  aria-label={`Testimonio ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="servicios" className="services section-dark">
          <FloatingOrbs variant="dark" />
          <div className="container">
            <div className="services-heading reveal">
              <p className="eyebrow">{t('services.eyebrow')}</p>
              <h2 className="section-title">
                {t('services.title')}<span className="accent">{t('services.title.accent')}</span>
              </h2>
              <p className="section-copy" style={{ color: 'var(--text-dim)', marginTop: '1rem' }}>{t('services.copy')}</p>
            </div>

            <div className="services-carousel" ref={servicesRef} onScroll={handleServicesScroll}>
              {services.map((service, index) => (
                <div key={service.id} className={`service-card${index === activeServiceIndex ? ' active' : ''}`}>
                  <span className="service-card-eyebrow">0{index + 1} — {service.eyebrow}</span>
                  <h3 className="service-card-title">{service.label}</h3>
                  <p className="service-card-desc">{service.description}</p>
                  <MagneticButton className="button button-primary service-card-cta" onClick={() => setModalService(service.id)}>
                    {locale === 'es' ? 'Ver ahora' : 'See now'} <span aria-hidden="true">→</span>
                  </MagneticButton>
                  <div className="card-shine" aria-hidden="true" />
                </div>
              ))}
            </div>

            <div className="services-carousel-dots">
              {services.map((_, i) => (
                <button
                  key={i}
                  className={`carousel-dot${i === activeServiceIndex ? ' active' : ''}`}
                  onClick={() => scrollToService(i)}
                  aria-label={`${locale === 'es' ? 'Ir a' : 'Go to'} ${services[i].label}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── METHOD ── */}
        <section id="como-funciona" className="method section-light">
          <FloatingOrbs variant="light" />
          <div className="container method-grid">
            <div className="method-copy-block reveal-left">
              <p className="eyebrow eyebrow-dark">{t('method.eyebrow')}</p>
              <h2 key={activeMethodStep + 'title' + locale} className="section-title section-title-dark reveal-fade-text">
                {t(`method.title.${activeMethodStep}`)}
              </h2>
              <p key={activeMethodStep + 'copy' + locale} className="section-copy section-copy-dark reveal-fade-text">
                {t(`method.copy.${activeMethodStep}`)}
              </p>
              <div className="method-progress" aria-hidden="true">
                {steps.map((step, i) => (
                  <button
                    key={step + locale}
                    className={`progress-dot${i === activeMethodStep ? ' active' : ''}`}
                    onClick={() => setActiveMethodStep(i)}
                    aria-label={`Paso ${i + 1}`}
                    type="button"
                    style={{ border: 0, padding: 0 }}
                  />
                ))}
              </div>
            </div>

            <div className="method-steps reveal-right">
              <p className="method-intro">{t('method.intro')}</p>
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`method-step${index === activeMethodStep ? ' active' : ''}`}
                  style={{ transitionDelay: `${index * 100}ms`, cursor: 'pointer' }}
                  onClick={() => setActiveMethodStep(index)}
                  onMouseEnter={() => setActiveMethodStep(index)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step}</strong>
                  {index === activeMethodStep ? <span className="method-arrow" aria-hidden="true">→</span> : <span />}
                </div>
              ))}
              <MagneticButton className="button button-dark-cta" href="https://wa.me/12023179939?text=Hola%20quiero%20hacer%20crecer%20mi%20marca%20con%20SCALIA" target="_blank" rel="noreferrer" style={{ marginTop: '2rem', display: 'inline-flex' }}>
                {t('method.cta')} <span aria-hidden="true">→</span>
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* ── DIFFERENCE ── */}
        <section id="diferencial" className="difference section-dark">
          <FloatingOrbs variant="dark" />
          <div className="container difference-inner">
            <div className="reveal" data-parallax="0.05">
              <p className="eyebrow">{t('difference.eyebrow')}</p>
              <h2 className="section-title">
                {t('difference.title.before')}<span className="accent">{t('difference.title.accent')}</span>
              </h2>
            </div>

            <div className="difference-list reveal" style={{ transitionDelay: '100ms' }}>
              {differences.map(([bad, good], i) => (
                <div key={bad} className="difference-row" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="difference-bad">
                    <span className="diff-icon diff-icon-bad" aria-hidden="true">✕</span>
                    <span>{bad}</span>
                  </div>
                  <div className="difference-good">
                    <span className="diff-icon diff-icon-good" aria-hidden="true">✓</span>
                    <span>{good}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="difference-quote reveal" style={{ transitionDelay: '200ms' }} data-parallax="-0.03">{t('difference.quote')}</p>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contacto" className="contact section-dark">
          <FloatingOrbs variant="dark" />
          <div className="container contact-grid">
            <div className="contact-copy reveal">
              <p className="eyebrow">{t('contact.eyebrow')}</p>
              <h2 className="section-title">
                {t('contact.title.before')}<span className="accent">{t('contact.title.accent')}</span>
              </h2>
              <p className="section-copy">{t('contact.copy')}</p>

              <div className="contact-actions">
                <MagneticButton className="button button-success glow-button-green" href="https://wa.me/12023179939?text=Hola%20quiero%20hacer%20crecer%20mi%20marca%20con%20SCALIA" target="_blank" rel="noreferrer">
                  {t('contact.whatsapp')}
                </MagneticButton>
              </div>

              <div className="contact-benefits reveal" style={{ transitionDelay: '150ms' }}>
                <div>
                  <strong>{t('contact.benefit1.title')}</strong>
                  <span>{t('contact.benefit1.desc')}</span>
                </div>
                <div>
                  <strong>{t('contact.benefit2.title')}</strong>
                  <span>{t('contact.benefit2.desc')}</span>
                </div>
              </div>
              <p className="contact-location">{t('contact.location')}</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer section-dark">
        <div className="container footer-grid">
          <div>
            <p className="footer-heading">{t('footer.heading')}</p>
            <p className="footer-copy">{t('footer.copy')}</p>
          </div>
          <div>
            <p className="footer-label">{t('footer.nav')}</p>
            <div className="footer-links">
              <a href="#inicio">{t('nav.home')}</a>
              <a href="#servicios">{t('nav.services')}</a>
              <a href="#como-funciona">{t('nav.how')}</a>
              <a href="#diferencial">{t('nav.difference')}</a>
              <a href="#contacto">{t('nav.contact')}</a>
            </div>
          </div>
          <div>
            <p className="footer-label">{t('footer.connect')}</p>
            <div className="footer-links">
              <a href="https://wa.me/12023179939?text=Hola%20quiero%20hacer%20crecer%20mi%20marca%20con%20SCALIA" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>{t('footer.copyright')}</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.12rem' }}>SCALIA ✦</span>
        </div>
      </footer>

      {/* ── FLOATING WA ── */}
      <a className="floating-whatsapp" href="https://wa.me/12023179939?text=Hola%20quiero%20hacer%20crecer%20mi%20marca%20con%20SCALIA" target="_blank" rel="noreferrer" aria-label="Abrir WhatsApp">
        <img src={waLogoImg} className="floating-whatsapp-icon" alt="WhatsApp" />
      </a>

      {/* ── MODAL ── */}
      {modalServiceData && (
        <div className="modal-overlay" onClick={() => setModalService(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalService(null)} type="button" aria-label="Cerrar">✕</button>
            <span className="modal-eyebrow">{modalServiceData.eyebrow}</span>
            <h3 className="modal-title">{modalServiceData.headline}</h3>
            <p className="modal-desc">{modalServiceData.description}</p>

            <div className="modal-meta">
              <div className="modal-meta-item">
                <span className="modal-meta-label">{locale === 'es' ? 'Para quién' : 'For whom'}</span>
                <span className="modal-meta-value">{modalServiceData.audience}</span>
              </div>
              <div className="modal-meta-item">
                <span className="modal-meta-label">{locale === 'es' ? 'Tiempo estimado' : 'Estimated time'}</span>
                <span className="modal-meta-value">{modalServiceData.timeline}</span>
              </div>
            </div>

            <div className="modal-deliverables">
              <h4 className="modal-section-title">{locale === 'es' ? 'Incluye' : 'Includes'}</h4>
              <div className="deliverable-grid">
                {modalServiceData.deliverables.map((item, i) => (
                  <span key={item} className="deliverable-pill" style={{ animationDelay: `${i * 60}ms` }}>
                    <span className="pill-dot" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-outcomes">
              <h4 className="modal-section-title">{t('services.results')}</h4>
              <ul>
                {modalServiceData.outcomes.map(outcome => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </div>

            <MagneticButton className="button button-premium modal-cta" href="https://wa.me/12023179939?text=Hola%20quiero%20hacer%20crecer%20mi%20marca%20con%20SCALIA" target="_blank" rel="noreferrer" onClick={() => setModalService(null)}>
              {t('services.cta')} <span aria-hidden="true">→</span>
            </MagneticButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
