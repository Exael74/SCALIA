# SCALIA — Landing Page

Sitio web institucional de **SCALIA**, consultoría estratégica de marca. Diseño premium oscuro con partículas animadas, carrusel de servicios y traducción bilingüe (ES/EN).

## Stack

- **React 19** + **Vite 6**
- CSS vanilla (sin frameworks ni librerías externas de UI)
- Canvas API para sistema de partículas global
- Animaciones con IntersectionObserver y CSS transitions

## Inicio rápido

```bash
npm install
npm run dev
```

## Build para producción

```bash
npm run build
```

El output se genera en la carpeta `dist/`.

## Estructura del proyecto

```
├── App.jsx              # Componente principal con todas las secciones
├── styles.css           # Todos los estilos (variables, layout, animaciones, responsive)
├── translations.js      # Textos bilingüe español/inglés
├── main.jsx             # Entry point de React
├── index.html           # HTML base
├── vite.config.js       # Configuración de Vite
├── package.json         # Dependencias
├── logo.png             # Logo de SCALIA (header y menú móvil)
├── whatsappLogo.png     # Icono de WhatsApp flotante
├── image copy.png       # Slide 1 del carrusel (Diseño)
├── image copy 2.png     # Slide 2 del carrusel (Posicionamiento)
├── image copy 3.png     # Slide 3 del carrusel (Crecimiento)
└── dist/                # Build de producción
```

## Personalización rápida

| Elemento | Archivo | Qué buscar |
|----------|---------|------------|
| Textos | `translations.js` | Keys como `hero.title.before` |
| Número WhatsApp | `App.jsx` | `wa.me/12023179939` |
| Imágenes carrusel | `App.jsx` (top) | `import heroSlide1 from` |
| Logo | `logo.png` | Reemplazar el archivo |
| Colores | `styles.css` | `:root` variables CSS |

## Licencia

Uso exclusivo de SCALIA.
