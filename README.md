# A Taberna do Rio — landing

Sitio estático (HTML/CSS/JS, sin build), mismo *toolkit* técnico que
[melao-carballo-web](https://github.com/alvarotaiagu/melao-carballo-web)
(GSAP+ScrollTrigger, Lenis, Flip) pero con su **propia estructura de página**
— ver "Rediseño estructural (2026-09-12)" más abajo. Abrir `index.html` con
un servidor estático cualquiera (por ejemplo `python -m http.server`) — no
funciona bien con `file://` porque las fuentes y el `<script>` de
`js/main.js` necesitan HTTP.

## Rediseño estructural (2026-09-12)

La primera entrega (sesión nocturna sin supervisión, ver más abajo) seguía
casi al pie de la letra el esqueleto de secciones de Melao — mismo orden,
mismo nav superior, mismo grid de tarjetas para la carta y las reseñas. Como
este workspace usa cada web como plantilla reutilizable para futuros
clientes, eso corría el riesgo de leerse como "la misma plantilla" al
comparar varios sitios. Esta revisión mantiene el toolkit de motion (GSAP,
Lenis, reveals por sección, magnetic buttons, tilt) pero convierte a Taberna
do Rio en una **tercera familia estructural**, distinta de Melao y de
Marabú:

- **Nav lateral de puntos** (`.rail-nav`) en vez de la barra superior con
  subrayado — hace también de indicador de progreso de scroll.
- **Hero con iconos orbitando** (`js/scene-icons.js`): copa de albariño,
  pote de cocido, guitarra y ficha de dominó, en canvas 2D (sin WebGL),
  sobre el póster SVG de la terraza — variante propia de la técnica
  "orbiting icons" ya explorada para Melao, con acabado sólido+sombra en
  vez del gooey. Pausado fuera de viewport/pestaña oculta, cae a solo el
  póster estático sin motion/sin canvas.
- **"Reloj de la taberna"**: línea de tiempo de 8h a 24h con las franjas de
  barra y cocina de hoy y una marca en vivo de "ahora", en vez de una lista
  plana de horario.
- **Carta en hoja impresa** (`.carta-sheet`): sin tarjetas ni fotos, con
  líneas de puntos plato…precio, en vez del grid de tarjetas de Melao.
- **"Ambiente"**: fusiona lo que antes eran dos secciones (`#eventos` +
  `#mosaico`) en una sola tira de scroll horizontal (`.filmstrip`) con
  botones prev/next accesibles, en vez de un grid con lightbox.
- **Reseñas**: anillo de valoración (conic-gradient) + chips de temas, en
  vez de la fila de 3 tarjetas que se repetía también en "La taberna" y en
  "Eventos" de la versión anterior.
- Cursor personalizado añadido (`initCustomCursor` en `js/main.js`), gateado
  igual que el resto del motion fino: solo con `(pointer: fine)` y
  `prefers-reduced-motion: no-preference`.

Validado con Playwright (Chromium local) en desktop/mobile, con
`reducedMotion: 'reduce'` y con `javaScriptEnabled: false`: sin errores de
consola ni requests fallidas en ningún caso.

## Dirección de arte

- **Idea visual:** taberna tradicional junto al río Anllóns, en Carballo —
  barra de toda la vida, terraza fluvial y cocido por encargo. El lema "Mesa
  junto al río, de toda la vida" apunta a esa doble idea: ubicación y
  tradición.
- **Paleta:** propia para este negocio, **deliberadamente distinta** de la de
  Melao (coral/cielo/lima sobre crema). Aquí el eje es río + piedra + madera:
  verde río (`--river` `#276F60` / `--river-deep` `#1A4B40`), terracota/madera
  (`--wood` `#B5652E` / `--wood-deep` `#8A4A1E`) y un dorado de candil/albariño
  (`--gold` `#C4943B`), sobre una base piedra cálida (`--stone` `#F4EFE3`).
  Ver `css/style.css`, bloque `:root`.
- **Tipografía:** Bitter (slab serif, más robusta/rústica que la Fraunces
  italic de Melao — encaja mejor con "taberna tradicional") + Inter (texto e
  interfaz).
- **Logo:** el negocio no tiene logo real facilitado. Se creó un emblema
  propio (iniciales "TR" sobre un círculo verde río, con una onda dorada
  debajo — `scripts/gen_assets.py`) para favicon, iconos de "añadir a inicio"
  y marca de agua del pie de página. **No es una foto ni un logo real del
  negocio** — si el dueño tiene un logo propio, sustituir estos archivos.
- **Fotografía — IMPORTANTE:** el negocio no tiene banco de fotos propio, y
  esta sesión (nocturna, sin supervisión) **no tuvo acceso de red para
  descargar fotos de stock** (Unsplash/Pexels bloqueados por la política de
  red del entorno de ejecución). En vez de dejar huecos vacíos o usar fotos
  genéricas de baja calidad, se optó por **ilustraciones propias en SVG**
  (inline en `index.html`, sin peso de imagen añadido — cero KB de fotos,
  carga instantánea) para el póster del hero y la sección "Ambiente y
  especialidades" (`#ambiente`, ver rediseño 2026-09-12): terraza con mesa y
  sombrilla, plato de cocido, bocadillo de chapata, tortilla, pulpo á feira,
  guitarra/música en directo, dados/dominó.
  **Antes de enseñar la web al dueño, sustituir estas ilustraciones por fotos
  reales del local** (plato real, terraza real, gente real) — es el ajuste
  pendiente más importante de esta entrega. La sección lleva un aviso visible
  ("Ilustraciones propias — pendiente sustituir por fotos reales del local")
  para que quede claro que es un placeholder de diseño, no un descuido.
- **Motion:** mismo stack que Melao — GSAP + ScrollTrigger para las
  revelaciones por sección, Flip para el filtro de la carta, Lenis como motor
  de scroll suave, cursor personalizado. En vez del shader WebGL de Melao, el
  hero usa un canvas 2D propio de iconos orbitando (ver rediseño 2026-09-12)
  — misma familia de técnica, sin WebGL. Todo el motion es opcional: si el
  CDN de GSAP falla (probado expresamente
  desactivando la red), el sitio se degrada con limpieza — nav, filtros,
  horario en vivo, mapa y WhatsApp siguen funcionando sin un solo error de
  consola (ver "Validación hecha" más abajo). **Corrección sobre la
  plantilla de Melao:** el `main.js` original de Melao llama a
  `ScrollTrigger.refresh()` sin comprobar antes si GSAP cargó — si el CDN
  falla, esas dos líneas finales lanzan una excepción no capturada. Aquí se
  corrigió envolviendo esas llamadas en el mismo `gsapReady` que ya protege
  el resto del archivo; merece la pena aplicar el mismo arreglo en Melao.
- **Icons:** Solar + Mynaui/MDI (Iconify) para los símbolos de interfaz, igual
  que Melao.
- **Skill de diseño usada:** mismo patrón que Melao, adaptado — sistema de
  motion/calidad con dirección de arte propia (paleta, tipografía, contenido
  e ilustraciones) para este negocio.

## Extras añadidos (estrategia de venta)

Pensados para impresionar al dueño más allá del rediseño básico:

- **Horario doble en vivo** (`js/main.js`, `BAR_HOURS` / `KITCHEN_HOURS`): la
  barra abre en franja amplia pero la cocina solo sirve comida en dos turnos
  (13:00–15:30 y 20:30–23:00). En vez de mostrar un único indicador "abierto/
  cerrado" como Melao, aquí hay **dos indicadores independientes** ("Barra
  abierta ahora" / "Cocina cerrada (solo barra)") más un aviso fijo explicando
  la diferencia — para que nadie llegue esperando comer fuera de esas horas,
  tal y como pedía el encargo.
- **Menú del día destacado** (`#menudia`): tarjeta editable de ejemplo
  (primero/segundo/postre+bebida, 12,50 €) con una nota explícita de que es
  una plantilla que se personaliza en un minuto — pensado como argumento de
  venta ("esto lo editas tú mismo cada semana").
- **Sección de eventos** (dentro de `#ambiente` desde el rediseño 2026-09-12): pone en valor "actuaciones en directo"
  y "juegos de mesa" (datos verificados de la ficha de Google Maps) con CTA a
  WhatsApp para reservar terraza o preguntar por la próxima actuación — sin
  inventar fechas ni artistas concretos.
- **Botón de WhatsApp** (`wa.me/34671378821`) flotante y en cabecera/footer/
  CTA final. **Pendiente confirmar que ese número tiene WhatsApp Business (o
  WhatsApp normal) activo** antes de enseñar la web al dueño — si no lo tiene,
  el botón fallaría en producción.
- **Mapa de Google embebido** bajo consentimiento de clic (mismo patrón de
  privacidad que Melao: no carga cookies de terceros hasta que el visitante
  hace clic en "Cargar el mapa").
- **SEO básico:** meta title/description, Open Graph + Twitter Card (con
  imagen OG generada localmente, `assets/img/web/og-image.jpg`), JSON-LD
  `BarOrPub` con dirección, teléfono, horario y `aggregateRating`, y
  `<link rel="canonical">`.
- **Rendimiento:** sin fotos que cargar (ilustraciones SVG inline), CSS/JS
  propios sin build ni dependencias pesadas — carga prácticamente instantánea
  incluso en 3G.

## Contenido real vs. pendiente

**Confirmado y usado tal cual** (datos verificados en Google Maps,
11-09-2026, más el nombre del propietario del negocio y contexto de
TripAdvisor):
- Nombre, dirección (Rúa Xirona, 3, 15100 Carballo), teléfono
  (671 37 88 21), valoración de Google (**4,3★, 158 reseñas**), rango de
  precio (10–20 €), categoría (Bar), opciones de servicio (terraza,
  actuaciones en directo, juegos de mesa).
- Horario de barra y de cocina, día a día — implementado en
  `OPENING_HOURS`/`BAR_HOURS`/`KITCHEN_HOURS` (`js/main.js`) y en el
  `#hours-list` visible, con lógica de "abierto ahora" en vivo para ambos.
- Especialidades mencionadas en reseñas (TripAdvisor y búsquedas): bocadillos
  de chapata, cocido tradicional gallego, tortilla española, tapas/raciones,
  calamares y pulpo — reflejadas en "La carta" y en las tarjetas temáticas de
  "Reseñas".
- **Carta de "Raciones" y "Postres" (actualizado 2026-09-14):** Álvaro pasó
  capturas del widget de menú de la ficha de Google del negocio. Se
  sustituyeron los platos inventados de esas dos categorías por la lista
  real (Chipirones a la plancha, Zorza, Raxo, Ensaladilla, Solomillo de
  cerdo, Tabla de ibéricos, Croquetas de jamón, Tortilla —con nota de
  tamaños Pequeña/mediana/grande, tal y como la muestra Google— y en
  Postres: Tiramisú, Helado). Google no da precios, así que **se quitaron
  los precios de toda la sección "La carta"** (no solo de Raciones/Postres,
  por consistencia — ver punto siguiente) en vez de dejar unos inventados
  junto a platos reales sin precio.

**⚠️ Pendiente / decisiones tomadas por mi cuenta — revisar antes de enseñar
la web:**
- **Fotos reales del local** (ver "Fotografía" arriba) — es lo primero que
  hay que cambiar. Las ilustraciones SVG son un recurso de diseño digno,
  pero no sustituyen a fotos reales de cara al dueño. Álvaro dio permiso
  para usar fotos de stock (Unsplash u otras) si hiciera falta alguna para
  un plato o sección — no se ha usado ninguna todavía porque "La carta" es
  deliberadamente una hoja sin fotos (ver rediseño 2026-09-12); el sitio más
  indicado para una foto de stock, si se quiere, sería "Ambiente" (que hoy
  usa ilustraciones SVG) — pendiente de decidir con Álvaro.
- **Precios de la carta**: no existe carta física ni fotografiada disponible
  (a diferencia de Melao, donde el dueño facilitó fotos de su carta real).
  Bocadillos, "De cuchara y tradicional" y Bebidas siguen siendo una
  selección de platos plausible basada en reseñas/costumbre de bar gallego,
  **sin confirmar por el negocio** (a diferencia de Raciones/Postres, que sí
  son la lista real de Google) — pendiente confirmar con el dueño o
  sustituir por su carta física. Ya no se muestra ningún precio por plato en
  ninguna categoría (antes eran estimaciones orientativas; se quitaron para
  no mezclar cifras inventadas con la lista real de Raciones/Postres). El
  precio medio real (10–20 €/persona, verificado en Google) sí se sigue
  mostrando en el texto de la sección y en el JSON-LD.
- **Reseñas (actualizado 2026-09-14):** Álvaro facilitó capturas de la ficha
  de Google del negocio con tres reseñas reales de 5★. Se añadieron como
  citas textuales en `#resenas` (`.resenas-quotes` en `index.html`/
  `style.css`), debajo del panel de valoración agregada — **atribuidas solo
  con nombre + inicial del apellido** (p. ej. "Jose Luis N.", nunca el
  nombre y apellido completos de la captura), siguiendo el mismo criterio de
  privacidad que Melao. No se ha tocado el texto de las reseñas salvo
  limpieza tipográfica menor (comillas, espaciado); ver commit
  correspondiente para el texto exacto de las capturas.
  - Nota de investigación (histórica): en la sesión inicial se intentó
    extraer citas de TripAdvisor y búsqueda web sin éxito por falta de
    acceso de red — ya resuelto con las capturas reales de Álvaro.
  - Nota de investigación: la ficha de TripAdvisor de este negocio aparece
    "sin reclamar", con muy pocas reseñas propias (una encontrada, de fecha
    no disponible, con valoración mixta) — la fuente fiable y actual sigue
    siendo la ficha de Google Maps (4,3★/158), tal y como indicaba el
    encargo.
- **WhatsApp**: falta confirmar que 671 37 88 21 tiene WhatsApp activo.
- **Teléfono alternativo de TripAdvisor** (+34 647 65 66 44): descartado por
  indicación expresa del encargo (probablemente desactualizado); no se usa
  en ningún sitio de la web.
- **Nombre del propietario / año de apertura**: no disponibles en las fuentes
  consultadas, así que no aparecen en la web (a diferencia de Melao, que sí
  cita su fecha de apertura). Si Álvaro los consigue en la visita, se pueden
  añadir a "La taberna" o al JSON-LD.
- Los metadatos usan `https://alvarotaiagu.github.io/taberna-do-rio-carballo-web/`
  (URL de GitHub Pages) como dominio; si el negocio consigue un dominio
  propio, sustituir esa URL en `index.html` (canonical, `og:url`, `og:image`,
  `twitter:image` y el JSON-LD) y en `404.html`.

## Validación hecha

- Servido en local (`python -m http.server`) y revisado con Playwright
  (Chromium) en 1440px y 390px. La red del entorno de compilación bloquea los
  CDN externos (GSAP, Lenis, Iconify, Google Fonts, el iframe de Google
  Maps), así que la validación en este entorno cubrió exactamente el **modo
  degradado sin motion/sin iconos** — nav móvil, filtro de carta (instantáneo,
  sin Flip), horario en vivo (barra + cocina, con los dots de color
  correctos según la hora real), botón de WhatsApp, aviso de cookies y CTA,
  todo funcionando **sin un solo error de consola** una vez corregido el bug
  heredado de `ScrollTrigger.refresh()` (ver arriba). Con red normal (el caso
  real de un visitante), GSAP/ScrollTrigger/Flip/Lenis cargan desde cdnjs y
  jsdelivr — mismas CDN y versiones que ya funcionan en producción en
  melao-carballo-web — y añaden las animaciones de scroll, el tilt de
  tarjetas y los botones magnéticos.
- Probado también con `javaScriptEnabled: false`: la hero y toda la página
  se ven correctamente (las ilustraciones son SVG inline, no dependen de
  JS) — degrada mejor en este aspecto que un sitio con fotos con blur-up.
- Menú móvil, filtro de la carta y aviso de cookies probados por interacción
  real (clic), no solo visualmente.
#   T a b e r n a - D o - R i o  
 