# Documentación Funcional — SCALIA Website

## Arquitectura general

Aplicación **Single Page Application (SPA)** construida con React 19 y Vite 6. No utiliza frameworks CSS ni librerías de UI externas. Todo el estilo es CSS vanilla con variables personalizadas.

### Flujo de carga

```
index.html → main.jsx → App.jsx + styles.css + translations.js
```

`main.jsx` monta el componente `App` en el DOM. `App.jsx` contiene toda la estructura, hooks y componentes internos.

---

## 1. Estructura de secciones

Orden de renderizado en la página:

| # | Sección | Clase | Idioma |
|---|---------|-------|--------|
| 1 | **Topbar** (header fijo) | `.topbar` | `nav.*` |
| 2 | **Hero** | `.hero-wrapper` | `hero.*` |
| 3 | **Brand Statement** | `.brand-statement` | `statement.*` |
| 4 | **Ticker** (cinta animada) | `.ticker` | nativo |
| 5 | **Service Showcase** | `.service-showcase` | `showcase.*` + `services.list[].*` |
| 6 | **Results Strip** (quote) | `.results-strip` | `results.*` |
| 7 | **Scenarios** (cards) | `.scenarios` | `scenarios.*` |
| 8 | **Decision CTA** | `.decision` | `decision.*` |
| 9 | **Testimonials** | `.testimonials` | `testimonials.*` |
| 10 | **Services** (carrousel + modal) | `.services` | `services.*` |
| 11 | **Method** (pasos interactivos) | `.method` | `method.*` |
| 12 | **Difference** (tabla) | `.difference` | `difference.*` |
| 13 | **Contact** | `.contact` | `contact.*` |
| 14 | **Footer** | `.footer` | `footer.*` |
| 15 | **Floating WhatsApp** | `.floating-whatsapp` | nativo |

---

## 2. Sistema de partículas global

### Archivo: `App.jsx` — Hook `useGlobalParticles`

**Comportamiento:**
- Canvas `position: fixed` que cubre toda la ventana (`z-index: 1`)
- **85 partículas** en desktop, **35 en móvil**
- Colores: azul corporativo (`76,120,212`) y plateado (`148,163,184`)
- Cada partícula tiene pulso de opacidad sinusoidal (frecuencia individual)
- **Glow**: en desktop, cada partícula tiene un halo 4.5× su radio con 22% de opacidad

**Física:**
1. **Deriva natural**: las partículas flotan lentamente con velocidad aleatoria
2. **Repulsión**: al pasar el mouse, las partículas son repelidas (radio 180px / 80px móvil)
3. **Spring physics**: al alejar el mouse, vuelven a su posición base con amortiguación (0.88)
4. **Wrap**: al cruzar bordes, se reposicionan sin saltos visuales

**Rendimiento:**
- `requestAnimationFrame` con throttling a ~60fps
- En móvil: menos partículas, menor opacidad, sin glow
- `prefers-reduced-motion`: desactiva completamente las partículas

---

## 3. Animaciones y scroll

### `useScrollReveal`
- Observa elementos con clases `.reveal`, `.reveal-left`, `.reveal-right`, `.reveal-scale`, `.reveal-rotate`
- Umbral: 10% visible
- Agrega clase `.visible` que dispara la transición CSS (800ms cubic-bezier)

### `useParallax`
- Elementos con atributo `data-parallax="0.15"` se mueven a velocidad diferente al scroll
- Valor negativo invierte la dirección

### `useCountUp`
- Cuenta desde 0 hasta el valor objetivo cuando el elemento entra en viewport
- Easing: ease-out quart (1 — (1-t)⁴)
- Soporta sufijos (ej: "+34%")

### Animaciones específicas del Hero
- **Staggered entrance**: eyebrow → title líneas → copy → botones (100ms a 1050ms de delay)
- **Word carousel**: las palabras cambian cada 1300ms con fade + translateY + blur + rotateX
- **Gradient shift**: el acento del título cambia de color con `background-position` animado

---

## 4. Traducciones (bilingüe)

### Archivo: `translations.js`

**Estructura:**
```js
{
  es: { 'hero.title.before': 'Tu marca.', ... },
  en: { 'hero.title.before': 'Your brand.', ... },
}
```

**Mecanismo:**
- `useState('en')` — idioma por defecto: inglés
- Función `t(key)` en App.jsx: `translations[locale][key] ?? key`
- Locale switcher en topbar (`.locale-switch`) y menú móvil (`.mobile-menu-locale`)
- Cambiar de idioma actualiza todos los textos **y** reinicia las animaciones de scroll reveal

**Convención de keys:**
```
seccion.subseccion.descripcion
ej: 'services.list[0].label', 'showcase.0.eyebrow'
```

---

## 5. Service Showcase (módulo principal)

### Ubicación: después del Brand Statement

**Estructura:**
1. **Carrusel de imágenes** — 3 slides (Diseño, Crecimiento, Posicionamiento)
2. **Pill tabs** [DISEÑO] [CRECIMIENTO] [POSICIONAMIENTO] — glass oscuro
3. **Contenido 2 columnas**:
   - Izquierda: eyebrow + título + descripción (desde `services.list[heroSlide]`)
   - Derecha: "INCLUYE" label + chips (`deliverables`) + CTA

**Comportamiento:**
- Click en tab cambia: imagen, eyebrow, título, descripción y chips
- CTA navega a `#servicios` con el servicio correspondiente activo
- `heroSlide` (0/1/2) controla qué contenido se muestra
- `scrollToService(index)` sincroniza el carrusel de servicios con el tab activo

---

## 6. Menú de navegación

### Desktop (>820px)
- Topbar fijo con logo, nav pills (INICIO, SERVICIOS, CÓMO FUNCIONA, DIFERENCIAL, CONTACTO), locale switcher y CTA
- `useScrollSpy` detecta sección activa basado en scroll position (offset 160px)
- Scroll spy actualiza `.nav-pill.active`

### Móvil (≤820px)
- Menú hamburguesa reemplaza nav desktop
- Drawer desliza desde la izquierda
- Cierra al: hacer click en backdrop, click en X, click en cualquier link, o hacer scroll
- Body scroll lock mientras está abierto (`overflow: hidden`)

---

## 7. Responsive breakpoints

| Breakpoint | Cambios principales |
|------------|-------------------|
| **1120px** | Grids a 1 columna, nav pills más compactos, padding-top de main: 112px |
| **820px** | Menú hamburguesa, topbar más pequeño (70px min-height), padding-top main: 86px |
| **560px** | Hero 45vh, topbar 64px min-height, sin cursor custom, padding-top main: 76px |

---

## 8. Colores y variables CSS

Definidas en `:root` en `styles.css`:

```css
--bg:        #05070a     /* fondo oscuro principal */
--bg-2:      #0b0e14     /* fondo oscuro secundario */
--cream:     #f1f5f9     /* fondo claro (section-light) */
--blue:      #3b82f6     /* azul corporativo */
--gold:      #cbd5e1     /* plateado (tono metálico) */
--text:      #f8fafc     /* texto en oscuro */
--text-dim:  rgba(241,245,249,0.65)  /* texto secundario oscuro */
--text-dark: #0f172a     /* texto en claro */
--blue-glow: rgba(59,130,246,0.25)   /* glow azul */
```

---

## 9. Componentes y hooks internos

| Nombre | Tipo | Propósito |
|--------|------|-----------|
| `useGlobalParticles` | Hook | Canvas de partículas con física |
| `useScrollReveal` | Hook | IntersectionObserver para animaciones |
| `useParallax` | Hook | Efecto parallax basado en scroll |
| `useCountUp` | Hook | Contador animado |
| `useCursor` | Hook | Cursor personalizado (dot + ring) |
| `useTopbarScroll` | Hook | Detecta scroll para cambiar estilo del topbar |
| `useScrollSpy` | Hook | Detecta sección activa en viewport |
| `MagneticButton` | Componente | Botón que sigue el cursor |
| `AnimatedMetric` | Componente | Métrica con contador animado |
| `Ticker` | Componente | Cinta de texto con scroll infinito |
| `FloatingOrbs` | Componente | Orbes decorativos de fondo |

---

## 10. Dependencias

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@vitejs/plugin-react": "^4.0.0",
  "vite": "^6.0.0"
}
```

Sin dependencias externas de UI, animación o estado.
