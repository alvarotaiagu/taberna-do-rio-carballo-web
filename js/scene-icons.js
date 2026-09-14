/* ---------- Hero: iconos orbitando (copa, pote, guitarra, ficha) ----------
   Técnica "orbiting characteristic icons" del catálogo de motion del
   workspace: silueta sólida + sombra suave + linework claro encima, cada
   icono con su propio color de marca, orbitando en trayectorias tipo
   Lissajous y con un "lean" hacia el puntero (factor decreciente por
   icono). Sin WebGL: canvas 2D, DPR limitado a 2, pausado fuera de
   viewport/pestaña oculta, con render estático bajo prefers-reduced-motion.
   No sustituye contenido: el <canvas> es aria-hidden y se dibuja sobre un
   póster SVG estático que sigue siendo la escena completa si el canvas no
   se inicializa (sin JS, sin 2D context, o reduced motion). */
(function () {
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawGlass(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, -s * 0.55);
    ctx.bezierCurveTo(-s * 0.5, s * 0.05, -s * 0.18, s * 0.28, 0, s * 0.3);
    ctx.bezierCurveTo(s * 0.18, s * 0.28, s * 0.5, s * 0.05, s * 0.42, -s * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-s * 0.035, s * 0.3, s * 0.07, s * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, s * 0.84, s * 0.26, s * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.34, -s * 0.08);
    ctx.lineTo(s * 0.34, -s * 0.08);
    ctx.stroke();
  }

  function drawPot(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, -s * 0.1);
    ctx.quadraticCurveTo(-s * 0.5, s * 0.5, 0, s * 0.5);
    ctx.quadraticCurveTo(s * 0.5, s * 0.5, s * 0.5, -s * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-s * 0.55, -s * 0.22, s * 1.1, s * 0.12);
    ctx.beginPath();
    ctx.arc(0, -s * 0.3, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-s * 0.58, -s * 0.02, s * 0.1, s * 0.16, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.58, -s * 0.02, s * 0.1, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, s * 0.08);
    ctx.lineTo(s * 0.4, s * 0.08);
    ctx.stroke();
  }

  function drawGuitar(ctx, s) {
    ctx.beginPath();
    ctx.arc(0, s * 0.15, s * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -s * 0.28, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-s * 0.045, -s * 0.85, s * 0.09, s * 0.6);
    ctx.fillRect(-s * 0.11, -s * 0.95, s * 0.22, s * 0.14);
    ctx.beginPath();
    ctx.arc(0, s * 0.15, s * 0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.015, -s * 0.85);
    ctx.lineTo(-s * 0.015, s * 0.4);
    ctx.moveTo(s * 0.015, -s * 0.85);
    ctx.lineTo(s * 0.015, s * 0.4);
    ctx.stroke();
  }

  function drawDomino(ctx, s) {
    const w = s * 0.7,
      h = s * 1.15,
      r = s * 0.14;
    roundRect(ctx, -w / 2, -h / 2, w, h, r);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo((-w / 2) * 0.8, 0);
    ctx.lineTo((w / 2) * 0.8, 0);
    ctx.stroke();
    const pipR = s * 0.06;
    const savedFill = ctx.fillStyle;
    ctx.fillStyle = "rgba(255,253,247,0.92)";
    [-w * 0.22, 0, w * 0.22].forEach((px) => {
      ctx.beginPath();
      ctx.arc(px, -h * 0.25, pipR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, h * 0.25, pipR, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = savedFill;
  }

  const DRAWERS = { glass: drawGlass, pot: drawPot, guitar: drawGuitar, domino: drawDomino };

  function drawIcon(ctx, type, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = "rgba(15,20,17,0.35)";
    ctx.shadowBlur = size * 0.35;
    ctx.shadowOffsetY = size * 0.12;
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255,253,247,0.85)";
    ctx.lineWidth = Math.max(1, size * 0.045);
    (DRAWERS[type] || drawGlass)(ctx, size);
    ctx.restore();
  }

  const ICONS = [
    { type: "glass", color: "#C4943B", radiusX: 0.3, radiusY: 0.22, speedX: 0.55, speedY: 0.7, phase: 0, size: 0.15, pull: 0.5 },
    { type: "pot", color: "#276F60", radiusX: 0.36, radiusY: 0.28, speedX: 0.4, speedY: 0.5, phase: 2.1, size: 0.19, pull: 0.28 },
    { type: "guitar", color: "#8A4A1E", radiusX: 0.26, radiusY: 0.32, speedX: 0.6, speedY: 0.42, phase: 4.2, size: 0.16, pull: 0.4 },
    { type: "domino", color: "#1A4B40", radiusX: 0.2, radiusY: 0.18, speedX: 0.75, speedY: 0.6, phase: 1.4, size: 0.11, pull: 0.62 },
  ];

  window.createIconOrbitScene = function createIconOrbitScene(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0,
      height = 0,
      cx = 0,
      cy = 0;
    let pointer = { x: 0, y: 0 };
    let t = 0;
    let raf = null;
    let running = false;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = width / 2;
      cy = height / 2;
    }

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    function onPointerLeave() {
      pointer.x = 0;
      pointer.y = 0;
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width, height);
      ICONS.forEach((icon) => {
        const ox = Math.cos(t * icon.speedX + icon.phase) * icon.radiusX * scale;
        const oy = Math.sin(t * icon.speedY + icon.phase * 1.3) * icon.radiusY * scale;
        const leanX = pointer.x * icon.pull * 22;
        const leanY = pointer.y * icon.pull * 22;
        drawIcon(ctx, icon.type, cx + ox + leanX, cy + oy + leanY, icon.size * scale, icon.color);
      });
    }

    function loop() {
      if (!running) return;
      t += 0.008;
      frame();
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    resize();
    frame();

    const onResize = () => {
      resize();
      frame();
    };
    window.addEventListener("resize", onResize);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !document.hidden) start();
          else stop();
        },
        { threshold: 0.05 }
      );
      io.observe(canvas);
    } else {
      start();
    }

    function onVisibility() {
      if (document.hidden) stop();
      else {
        const rect = canvas.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) start();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return {
      destroy() {
        stop();
        window.removeEventListener("resize", onResize);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        document.removeEventListener("visibilitychange", onVisibility);
        if (io) io.disconnect();
      },
    };
  };
})();
