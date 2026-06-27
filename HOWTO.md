# Cómo hacer cambios en la web de SCALIA

Guía práctica para el cliente. Todos los cambios son sencillos y no requieren conocimientos avanzados de programación.

---

## 1. Cambiar textos (español e inglés)

Los textos están en **`translations.js`**. El archivo tiene dos bloques: `es` (español) y `en` (inglés).

**Ejemplo — cambiar el título del Hero:**

```
Buscar:  'hero.title.before': 'Tu marca.',
Cambiar: 'hero.title.before': 'Tu nuevo texto.',
```

Los textos se organizan por secciones con nombres descriptivos como `hero.*`, `services.*`, `contact.*`, etc.

> **Importante:** si agregás un key nuevo, debe existir TANTO en `es` como en `en`.

---

## 2. Cambiar el número de WhatsApp

El número aparece en múltiples botones CTA. Se puede reemplazar fácilmente.

1. Abrí **`App.jsx`**
2. Buscá `wa.me/12023179939`
3. Reemplazá `12023179939` por el nuevo número (código de país incluido, sin espacios ni signos)

**Aparece en:** Hero CTA, Service Showcase CTA, Method CTA, Decision CTA, Contact CTA, Modal CTA, Footer, Floating WhatsApp, Mobile Menu CTA.

---

## 3. Cambiar las imágenes del carrusel

1. Colocá las nuevas imágenes en la raíz del proyecto (o en `src/`)
2. Abrí **`App.jsx`** y buscá las líneas:

```js
import heroSlide1 from './image copy.png';
import heroSlide2 from './image copy 2.png';
import heroSlide3 from './image copy 3.png';
```

3. Reemplazá la ruta del archivo por la nueva imagen

**Correspondencia:**

| Slide | Imagen actual | Tab |
|-------|--------------|-----|
| 1 | `image copy.png` | Diseño |
| 2 | `image copy 2.png` | Posicionamiento |
| 3 | `image copy 3.png` | Crecimiento |

---

## 4. Cambiar el logo

Reemplazá el archivo **`logo.png`** en la raíz del proyecto. Mantené el mismo nombre y extensión para que funcione automáticamente.

---

## 5. Cambiar colores y estilos

Los colores principales están definidos como variables CSS en **`styles.css`**, dentro de `:root`:

```css
--bg:        #05070a;     /* fondo oscuro */
--blue:      #3b82f6;     /* azul corporativo */
--cream:     #f1f5f9;     /* fondo claro */
--gold:      #cbd5e1;     /* plateado (reemplazó al dorado) */
--text:      #f8fafc;     /* texto sobre fondo oscuro */
--text-dark: #0f172a;     /* texto sobre fondo claro */
```

Cambiá estos valores para modificar la paleta completa del sitio.

---

## 6. Activar o desactivar secciones

Cada sección del sitio está comentada en **`App.jsx`**:

```
HERO / BRAND STATEMENT / TICKER / SERVICE SHOWCASE / RESULTS STRIP / SCENARIOS / DECISION / TESTIMONIALS / SERVICES / METHOD / DIFFERENCE / CONTACT / FOOTER
```

Para ocultar una sección, simplemente comentá o eliminá el bloque JSX correspondiente.

---

## 7. Subir los cambios a producción

```bash
npm run build      # genera la carpeta dist/
```

Luego subí el contenido de `dist/` a tu servidor web (Netlify, Vercel, hosting tradicional, etc.).

---

## 8. ¿Necesitás ayuda?

Si no te sentís cómodo editando los archivos, cualquier desarrollador web con conocimientos básicos de React y Vite puede hacerlo sin problemas. Todos los mensajes de error aparecen en la terminal y en la consola del navegador (F12).
