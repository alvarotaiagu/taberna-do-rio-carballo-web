// GSAP/ScrollTrigger/Flip load from a CDN — if that fails (ad blocker, flaky
// network, CDN outage), nothing below should break: only the motion is
// optional here, not the mobile nav, hours status, map, filters, etc.
const gsapReady =
  typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && typeof Flip !== "undefined";
if (gsapReady) {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

/* ---------- Word splitting (accessible) ---------- */
function splitWords(el) {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  const words = text.split(/\s+/);
  el.innerHTML = "";
  const wrap = document.createElement("span");
  wrap.className = "split-wrap";
  wrap.setAttribute("aria-hidden", "true");
  words.forEach((word, i) => {
    const outer = document.createElement("span");
    outer.className = "split-word";
    const inner = document.createElement("span");
    inner.textContent = word;
    outer.appendChild(inner);
    wrap.appendChild(outer);
    if (i < words.length - 1) wrap.appendChild(document.createTextNode(" "));
  });
  el.appendChild(wrap);
  return Array.from(wrap.querySelectorAll(".split-word > span"));
}

const splitTargets = document.querySelectorAll("[data-split-word]");
const splitMap = new Map();
splitTargets.forEach((el) => splitMap.set(el, splitWords(el)));

/* ---------- Google rating (única fuente de la cifra — edítala aquí
   cuando cambie, en vez de buscarla por todo index.html). Verificada en
   Google Maps: 4,3 sobre 5, 158 reseñas (11-09-2026). ---------- */
const GOOGLE_RATING = { value: "4,3", count: "158", outOf5: 4.3 };

function initGoogleRating() {
  const { value, count, outOf5 } = GOOGLE_RATING;
  const seal = document.querySelector(".google-seal");
  const sealCount = document.querySelector(".google-seal-count");
  const ctaCount = document.querySelector(".resenas-cta-count");
  const ring = document.querySelector(".resenas-ring");
  const ringValue = document.querySelector(".resenas-ring-value strong");
  const countText = document.querySelector(".resenas-count");
  if (seal) seal.setAttribute("aria-label", `${value} sobre 5 en Google — ver ficha de Google (se abre en una pestaña nueva)`);
  if (sealCount) sealCount.textContent = "en Google";
  if (ctaCount) ctaCount.textContent = `Ver reseñas en Google (${value}★)`;
  if (ring) ring.style.setProperty("--pct", (outOf5 / 5) * 100 + "%");
  if (ringValue) ringValue.textContent = value;
  if (countText) countText.textContent = `${count} reseñas en Google. Lo que más se repite:`;
}
initGoogleRating();

/* ---------- Hero: escena de iconos orbitando (copa, pote, guitarra, ficha)
   sobre el póster SVG estático de la terraza. Solo se activa con motion
   permitido y si el canvas 2D existe; si no, el póster se queda como
   escena completa (ver js/scene-icons.js). ---------- */
let heroScene = null;
function initHeroScene() {
  const card = document.querySelector("[data-hero-scene]");
  const canvas = card && card.querySelector(".hero-scene-canvas");
  if (!card || !canvas || typeof window.createIconOrbitScene !== "function") return;
  heroScene = window.createIconOrbitScene(canvas);
  if (heroScene) card.classList.add("is-animated");
}

/* ---------- Cookie notice ---------- */
function initCookieBanner() {
  const banner = document.querySelector(".cookie-banner");
  const ackBtn = document.querySelector(".cookie-ack");
  if (!banner || !ackBtn) return;
  const KEY = "taberna-do-rio-cookie-ack";
  let acknowledged = false;
  try {
    acknowledged = localStorage.getItem(KEY) === "1";
  } catch (e) {}
  if (!acknowledged) {
    banner.hidden = false;
    document.body.classList.add("has-cookie-banner");
  }
  ackBtn.addEventListener("click", () => {
    banner.hidden = true;
    document.body.classList.remove("has-cookie-banner");
    try {
      localStorage.setItem(KEY, "1");
    } catch (e) {}
  });
}
initCookieBanner();

/* ---------- WhatsApp floating button ---------- */
function initWhatsappFab() {
  const fab = document.querySelector(".whatsapp-fab");
  const hero = document.querySelector(".hero");
  if (!fab || !hero) return;
  if (!gsapReady) {
    const observer = new IntersectionObserver(([entry]) => {
      fab.classList.toggle("is-visible", !entry.isIntersecting);
    });
    observer.observe(hero);
    return;
  }
  ScrollTrigger.create({
    trigger: hero,
    start: "bottom top",
    onEnter: () => fab.classList.add("is-visible"),
    onLeaveBack: () => fab.classList.remove("is-visible"),
  });
}
initWhatsappFab();

/* ---------- Map: solo carga el iframe (y sus cookies) de Google al clic ---------- */
function initMapConsent() {
  document.querySelectorAll(".map-consent").forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const iframe = document.createElement("iframe");
        iframe.title = btn.dataset.mapTitle || "Mapa";
        iframe.src = btn.dataset.mapSrc;
        iframe.loading = "lazy";
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        btn.replaceWith(iframe);
      },
      { once: true }
    );
  });
}
initMapConsent();

/* ---------- Carta filters ---------- */
function initCartaFilters() {
  const group = document.querySelector(".carta-filters");
  const cards = Array.from(document.querySelectorAll(".carta-block"));
  if (!group || !cards.length) return;
  const pills = Array.from(group.querySelectorAll(".carta-filter"));
  const grid = document.querySelector(".carta-sheet");

  function applyFilter(filter, animate) {
    if (!gsapReady) {
      cards.forEach((card) => {
        const match = filter === "todo" || card.dataset.category === filter;
        card.hidden = !match;
      });
      return;
    }

    gsap.killTweensOf(cards);
    const beforeHeight = grid ? grid.getBoundingClientRect().height : 0;
    const state = animate && window.Flip ? Flip.getState(cards) : null;

    cards.forEach((card) => {
      const match = filter === "todo" || card.dataset.category === filter;
      card.hidden = !match;
    });

    if (state) {
      const afterHeight = grid ? grid.getBoundingClientRect().height : 0;
      if (grid) gsap.set(grid, { height: beforeHeight, overflow: "hidden" });
      gsap.set(cards, { pointerEvents: "none" });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(cards, { clearProps: "transform,pointerEvents" });
          if (grid) gsap.set(grid, { clearProps: "height,overflow" });
        },
      });
      if (grid) tl.to(grid, { height: afterHeight, duration: 0.5, ease: "power2.inOut" }, 0);
      tl.add(
        Flip.from(state, {
          duration: 0.5,
          ease: "power2.inOut",
          absolute: true,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }),
          onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.25, ease: "power2.in" }),
        }),
        0
      );
    }
  }

  function selectPill(pill, { focus = false, animate = true } = {}) {
    pills.forEach((p) => {
      const active = p === pill;
      p.setAttribute("aria-checked", active ? "true" : "false");
      p.tabIndex = active ? 0 : -1;
    });
    if (focus) pill.focus();
    applyFilter(pill.dataset.filter, animate);
  }

  pills.forEach((pill, i) => {
    pill.addEventListener("click", () => {
      if (pill.getAttribute("aria-checked") === "true") return;
      selectPill(pill, { animate: !reduceQuery.matches });
    });
    pill.addEventListener("keydown", (e) => {
      const moves = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(e.key in moves)) return;
      e.preventDefault();
      const next = pills[(i + moves[e.key] + pills.length) % pills.length];
      selectPill(next, { focus: true, animate: !reduceQuery.matches });
    });
  });
}
initCartaFilters();

/* ---------- Horario: barra y cocina en directo ----------
   Datos verificados en la ficha de Google Maps del negocio (11-09-2026).
   La barra abre en franja amplia; la cocina solo sirve comida en dos
   turnos (almuerzo y cena) — de ahí el aviso y el segundo indicador,
   para que nadie llegue esperando comer fuera de esas horas. Ninguna
   franja cruza medianoche, así que no hace falta arrastre al día
   siguiente en isOpenAt(). */
const BAR_HOURS = {
  1: [["08:00", "23:00"]], // Lunes
  2: [], // Martes: cerrado
  3: [["08:00", "23:00"]], // Miércoles
  4: [["08:00", "23:00"]], // Jueves
  5: [["08:00", "23:30"]], // Viernes
  6: [["09:00", "23:30"]], // Sábado
  0: [["09:00", "23:00"]], // Domingo
};

const KITCHEN_HOURS = {
  1: [["13:00", "15:30"], ["20:30", "23:00"]],
  2: [],
  3: [["13:00", "15:30"], ["20:30", "23:00"]],
  4: [["13:00", "15:30"], ["20:30", "23:00"]],
  5: [["13:00", "15:30"], ["20:30", "23:00"]],
  6: [["13:00", "15:30"], ["20:30", "23:00"]],
  0: [["13:00", "15:30"], ["20:30", "23:00"]],
};

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function isOpenAt(hoursMap, date) {
  const day = date.getDay();
  const minutes = date.getHours() * 60 + date.getMinutes();
  const today = hoursMap[day] || [];
  const yesterday = hoursMap[(day + 6) % 7] || [];

  const openNow = today.some(([open, close]) => {
    const o = toMinutes(open);
    const c = toMinutes(close);
    return c > o ? minutes >= o && minutes < c : minutes >= o;
  });
  if (openNow) return true;

  return yesterday.some(([open, close]) => {
    const o = toMinutes(open);
    const c = toMinutes(close);
    return c <= o && minutes < c;
  });
}

/* ---------- Reloj de la taberna: línea de tiempo 8h–24h con las franjas
   de barra/cocina de hoy y una marca en vivo de "ahora". Eje fijo de 960
   minutos (08:00–24:00, rango real de apertura) para que las franjas y la
   marca de "ahora" se posicionen en % sin depender del layout. ---------- */
const CLOCK_AXIS_START = 8 * 60;
const CLOCK_AXIS_END = 24 * 60;
const CLOCK_AXIS_RANGE = CLOCK_AXIS_END - CLOCK_AXIS_START;

function clockPct(minutes) {
  return Math.min(100, Math.max(0, ((minutes - CLOCK_AXIS_START) / CLOCK_AXIS_RANGE) * 100));
}

function renderClockTrack(track, hoursMap, day) {
  if (!track) return;
  const nowMark = track.querySelector(".clock-now");
  track.querySelectorAll(".clock-window").forEach((el) => el.remove());
  (hoursMap[day] || []).forEach(([open, close]) => {
    const span = document.createElement("span");
    span.className = "clock-window";
    const left = clockPct(toMinutes(open));
    const right = clockPct(toMinutes(close));
    span.style.left = left + "%";
    span.style.width = Math.max(0, right - left) + "%";
    track.appendChild(span);
  });
  if (nowMark) track.appendChild(nowMark);
}

function initOpeningHours() {
  const barStatus = document.getElementById("bar-status-text");
  const kitchenStatus = document.getElementById("kitchen-status-text");
  const barDot = document.querySelector('[data-status-dot="bar"]');
  const kitchenDot = document.querySelector('[data-status-dot="kitchen"]');
  const list = document.getElementById("hours-list");
  const barTrack = document.querySelector('[data-clock-track="bar"]');
  const kitchenTrack = document.querySelector('[data-clock-track="kitchen"]');
  const nowMarks = document.querySelectorAll("[data-clock-now]");
  if (!barStatus || !list) return;

  let lastDay = null;

  function update() {
    const now = new Date();
    const day = now.getDay();
    list.querySelectorAll("li").forEach((li) => {
      li.classList.toggle("is-today", Number(li.dataset.day) === day);
    });
    const barOpen = isOpenAt(BAR_HOURS, now);
    barStatus.textContent = barOpen ? "Barra abierta ahora" : "Barra cerrada ahora";
    if (barDot) barDot.classList.toggle("is-closed", !barOpen);

    if (kitchenStatus) {
      const kitchenOpen = isOpenAt(KITCHEN_HOURS, now);
      kitchenStatus.textContent = kitchenOpen ? "Cocina sirviendo ahora" : "Cocina cerrada (solo barra)";
      if (kitchenDot) kitchenDot.classList.toggle("is-closed", !kitchenOpen);
    }

    if (day !== lastDay) {
      renderClockTrack(barTrack, BAR_HOURS, day);
      renderClockTrack(kitchenTrack, KITCHEN_HOURS, day);
      lastDay = day;
    }
    if (nowMarks.length) {
      const minutes = now.getHours() * 60 + now.getMinutes();
      const pct = clockPct(minutes) + "%";
      nowMarks.forEach((mark) => (mark.style.left = pct));
    }
  }
  update();
  setInterval(update, 60000);
}
initOpeningHours();

/* ---------- Mobile nav ---------- */
const navToggle = document.querySelector(".nav-toggle");
const mobileNav = document.getElementById("mobile-nav");

function closeMobileNav() {
  mobileNav.hidden = true;
  navToggle.setAttribute("aria-expanded", "false");
}
function openMobileNav() {
  mobileNav.hidden = false;
  navToggle.setAttribute("aria-expanded", "true");
}
navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  isOpen ? closeMobileNav() : openMobileNav();
});
mobileNav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") closeMobileNav();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
    closeMobileNav();
    navToggle.focus();
  }
});

/* ---------- Reduced motion & smooth-scroll wiring ---------- */
const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let lenis = null;

const revealTimelines = [];
function completeRevealsBefore(targetEl) {
  const targetTop = targetEl.getBoundingClientRect().top + window.scrollY;
  revealTimelines.forEach(({ group, tl }) => {
    const groupTop = group.getBoundingClientRect().top + window.scrollY;
    if (groupTop <= targetTop + 40) tl.progress(1);
  });
}

function smoothScrollToSelector(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  completeRevealsBefore(target);
  const headerOffset = 68;
  if (lenis) {
    lenis.scrollTo(target, { offset: -headerOffset });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: reduceQuery.matches ? "auto" : "smooth" });
  }
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const id = link.getAttribute("href");
  if (id.length <= 1) return;
  if (!document.querySelector(id)) return;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    closeMobileNav();
    smoothScrollToSelector(id);
  });
});

document.querySelectorAll("[data-scroll-target]").forEach((btn) => {
  btn.addEventListener("click", () => smoothScrollToSelector(btn.dataset.scrollTarget));
});

/* ---------- Rail nav: activa el punto de la sección visible y sube el
   relleno de la guía como si fuera el nivel del río ---------- */
function setRailActive(id) {
  document.querySelectorAll(".rail-links a").forEach((a) => {
    a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
  });
  document.querySelectorAll('.mobile-nav a[href^="#"], .footer-nav a[href^="#"]').forEach((a) => {
    a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
  });
}

/* ---------- Nav scroll-spy ---------- */
function initScrollSpy() {
  if (!gsapReady) return;
  ["taberna", "carta", "ambiente", "resenas", "encuentranos"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top center",
      end: "bottom center",
      onEnter: () => setRailActive(id),
      onEnterBack: () => setRailActive(id),
    });
  });
}

/* ---------- Scroll chrome ---------- */
function initScrollChrome() {
  if (!gsapReady) return;
  const bar = document.querySelector(".scroll-progress-bar");
  const header = document.querySelector(".site-header");
  const railFill = document.querySelector(".rail-track-fill");
  if (bar || railFill) {
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (bar) bar.style.transform = `scaleX(${self.progress})`;
        if (railFill) railFill.style.height = self.progress * 100 + "%";
      },
    });
  }
  if (header) {
    ScrollTrigger.create({
      trigger: document.body,
      start: "top -80",
      onEnter: () => header.classList.add("is-scrolled"),
      onLeaveBack: () => header.classList.remove("is-scrolled"),
    });
  }
}

/* ---------- Torch-light spotlight sobre "Encuéntranos" ---------- */
function initSpotlight() {
  document.querySelectorAll(".spotlight").forEach((section) => {
    section.addEventListener("pointermove", (e) => {
      const rect = section.getBoundingClientRect();
      const mx = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%";
      const my = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%";
      section.style.setProperty("--mx", mx);
      section.style.setProperty("--my", my);
    });
  });
}

/* ---------- Motion setup ---------- */
if (!gsapReady) {
  document.body.classList.add("motion-reduced");
}

const mm = gsapReady ? gsap.matchMedia() : null;

if (mm) mm.add(
  {
    isMotion: "(prefers-reduced-motion: no-preference)",
    isFinePointer: "(pointer: fine)",
  },
  (context) => {
    const { isMotion, isFinePointer } = context.conditions;

    if (isMotion) {
      lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      runHeroIntro();
      runSectionReveals();
      runGhostParallax();
      runMarquee();
      initScrollSpy();
      initScrollChrome();
      initHeroScene();

      if (isFinePointer) {
        initMagneticButtons();
        initTiltCards();
        initHeroTilt();
        initSpotlight();
        initCustomCursor();
      }

      window.addEventListener("pagehide", () => {
        lenis && lenis.destroy();
        ScrollTrigger.getAll().forEach((t) => t.kill());
        if (heroScene) heroScene.destroy();
      });
    } else {
      document.body.classList.add("motion-reduced");
      initScrollSpy();
      initScrollChrome();
    }

    return () => {
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
    };
  }
);

/* ---------- Hero intro ---------- */
function runHeroIntro() {
  const tl = gsap.timeline({ delay: 0.15 });
  tl.from(".site-header", { y: -24, opacity: 0, duration: 0.7, ease: "power3.out" });
  tl.from(".hero-eyebrow", { y: 12, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.35");
  tl.from(".hero-title", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.25");
  tl.from(".hero-claim", { y: 16, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.45");
  tl.from(".hero-actions", { y: 14, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.35");
  tl.from(".hero-note", { y: 10, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");
  tl.from(".hero-media", { y: 26, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.75");
  tl.from(".scroll-cue", { opacity: 0, duration: 0.5 }, "-=0.2");
}

/* ---------- Section-by-section reveals ---------- */
function runSectionReveals() {
  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    const heading = group.querySelector("h2");
    const headingSplitTargets = heading
      ? Array.from(heading.matches("[data-split-word]") ? [heading] : heading.querySelectorAll("[data-split-word]"))
      : [];
    const headingWords = headingSplitTargets.length
      ? headingSplitTargets.flatMap((el) => splitMap.get(el) || [])
      : null;
    const blocks = group.querySelectorAll("p, .ambiente-cta, .resenas-panel");
    const cards = group.querySelectorAll(
      ".rasgo-row, .carta-block, .film-panel, .clock-card, .info-list li, .map-card, .menudia-card, .resena-card"
    );
    const rows = group.querySelectorAll(".carta-block .carta-items li, .hours-list li, .menudia-course li");

    if (headingWords) gsap.set(headingWords, { yPercent: 110, opacity: 0 });
    gsap.set(blocks, { y: 16, opacity: 0 });
    gsap.set(cards, { y: 30, opacity: 0, scale: 0.95 });
    gsap.set(rows, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: group,
        start: "top 78%",
        toggleActions: "play none none none",
      },
    });
    if (headingWords) {
      tl.to(headingWords, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "power4.out" });
    }
    tl.to(blocks, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out" }, headingWords ? "-=0.35" : 0);
    tl.to(
      cards,
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: Math.min(0.07, 0.4 / Math.max(cards.length, 1)), ease: "power3.out" },
      headingWords || blocks.length ? "-=0.35" : 0
    );
    if (rows.length) {
      const rowStagger = Math.min(0.02, 0.4 / rows.length);
      tl.to(rows, { opacity: 1, duration: 0.25, stagger: rowStagger, ease: "power1.out" }, "-=0.3");
    }
    revealTimelines.push({ group, tl });
  });
}

/* ---------- Ghost watermark parallax ---------- */
function runGhostParallax() {
  document.querySelectorAll(".ghost-word").forEach((el) => {
    gsap.to(el, {
      yPercent: -16,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("section"),
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

/* ---------- Marquee divider ---------- */
function runMarquee() {
  const track = document.querySelector(".marquee-track");
  if (!track) return;

  function start() {
    const seqWidth = track.scrollWidth / 2;
    const pxPerSecond = 55;

    const tween = gsap.to(track, {
      xPercent: -50,
      duration: seqWidth / pxPerSecond,
      ease: "none",
      repeat: -1,
    });

    ScrollTrigger.create({
      trigger: track,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => tween.play(),
      onEnterBack: () => tween.play(),
      onLeave: () => tween.pause(),
      onLeaveBack: () => tween.pause(),
    });
  }

  if (document.fonts && document.fonts.status !== "loaded") {
    document.fonts.ready.then(start);
  } else {
    start();
  }
}

/* ---------- Magnetic buttons ---------- */
function initMagneticButtons() {
  document.querySelectorAll(".btn").forEach((el) => {
    const moveX = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const moveY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      moveX((e.clientX - rect.left - rect.width / 2) * 0.25);
      moveY((e.clientY - rect.top - rect.height / 2) * 0.4);
    });
    el.addEventListener("mouseleave", () => {
      moveX(0);
      moveY(0);
    });
  });
}

/* ---------- Tilt on carta/rasgo/tema/evento cards ---------- */
function initTiltCards() {
  document.querySelectorAll(".carta-block, .rasgo-row, .film-panel").forEach((el) => {
    const rotX = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power2" });
    const rotY = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power2" });
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * 6);
      rotX(-py * 6);
    });
    el.addEventListener("mouseleave", () => {
      rotX(0);
      rotY(0);
    });
  });
}

/* ---------- Hero 3D tilt ---------- */
function initHeroTilt() {
  const hero = document.querySelector(".hero");
  const content = document.querySelector(".hero-content");
  if (!hero || !content) return;

  const rotX = gsap.quickTo(content, "rotationX", { duration: 0.7, ease: "power2" });
  const rotY = gsap.quickTo(content, "rotationY", { duration: 0.7, ease: "power2" });

  hero.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotY(px * 4);
    rotX(-py * 4);
  });
  hero.addEventListener("pointerleave", () => {
    rotX(0);
    rotY(0);
  });
}

/* ---------- Cursor personalizado (solo puntero fino) ----------
   Anillo + punto central, ambos con mix-blend-mode: difference (ver CSS)
   para que se vean sobre cualquier fondo, claro u oscuro, sin necesidad de
   detectar la sección por JS. */
function initCustomCursor() {
  const ring = document.querySelector(".cursor-ring");
  const dot = document.querySelector(".cursor-dot");
  if (!ring || !dot) return;
  document.body.classList.add("custom-cursor-active");

  const moveRingX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
  const moveRingY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });
  const moveDotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
  const moveDotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });

  function onMove(e) {
    ring.classList.add("is-visible");
    dot.classList.add("is-visible");
    moveRingX(e.clientX);
    moveRingY(e.clientY);
    moveDotX(e.clientX);
    moveDotY(e.clientY);
  }
  window.addEventListener("pointermove", onMove, { passive: true });

  document.querySelectorAll("a, button, [tabindex], .film-panel, .rasgo-row").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      ring.classList.add("is-hover");
      dot.classList.add("is-hover");
    });
    el.addEventListener("mouseleave", () => {
      ring.classList.remove("is-hover");
      dot.classList.remove("is-hover");
    });
  });

  window.addEventListener("blur", () => {
    ring.classList.remove("is-visible");
    dot.classList.remove("is-visible");
  });
  document.addEventListener("mouseleave", () => {
    ring.classList.remove("is-visible");
    dot.classList.remove("is-visible");
  });
}

/* ---------- Filmstrip de "Ambiente": botones prev/next accesibles sobre
   el scroll-snap horizontal nativo (funciona igual sin JS, solo sin
   botones: el scroll táctil/trackpad sigue disponible). ---------- */
function initFilmstripNav() {
  const strip = document.querySelector("[data-filmstrip]");
  const prev = document.querySelector(".filmstrip-prev");
  const next = document.querySelector(".filmstrip-next");
  if (!strip || (!prev && !next)) return;
  function step(dir) {
    const panel = strip.querySelector(".film-panel");
    const amount = panel ? panel.getBoundingClientRect().width + 20 : strip.clientWidth * 0.8;
    strip.scrollBy({ left: dir * amount, behavior: reduceQuery.matches ? "auto" : "smooth" });
  }
  if (prev) prev.addEventListener("click", () => step(-1));
  if (next) next.addEventListener("click", () => step(1));
}
initFilmstripNav();

/* Refresh ScrollTrigger measurements once fonts + layout settle — guarded
   by gsapReady since GSAP/ScrollTrigger may not have loaded (CDN down,
   ad blocker, no network): unlike Melao's original template, this must
   not assume the global exists. */
if (gsapReady) {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
