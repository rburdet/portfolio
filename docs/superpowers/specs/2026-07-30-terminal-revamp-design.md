# Spec: Terminal revamp de rburdet.com

**Fecha:** 2026-07-30
**Estado:** aprobado por Rodrigo
**Decidido con mockups en:** `.superpowers/brainstorm/17718-1785453687/content/` (dirección: terminal → híbrido → modern zinc)

## Objetivo

Revamp visual del portfolio con estética de terminal moderna ("piel de terminal"
navegable) más un chat AI real embebido como línea de comando (`ask>`), para que
el sitio comunique "hace cosas con AI" de forma funcional, no cosmética.

## Decisiones de diseño (tomadas en brainstorm)

1. **Dirección**: terminal (sobre dark-glass y editorial).
2. **Modelo de interacción**: híbrido — sitio normal navegable (scroll/click,
   mobile-friendly) vestido de terminal; lo único tipeable es el `ask>`.
3. **Paleta**: "modern zinc" — no verde-Matrix, no amber CRT.
4. **Chat AI**: sí, con **Workers AI** (sin API keys externas).
5. **Alcance**: todo el sitio (home, about, projects, contact).

## Look & feel

- **Dark permanente**: se elimina el toggle claro/oscuro (theme-provider queda
  fijo en dark o se elimina).
- **Paleta zinc** (tokens en `globals.css`):
  - fondo `#09090b`, superficie de cards `#111113`, bordes `#27272a`
  - texto principal `zinc-100`, secundario `zinc-400`, apagado `zinc-500`
  - prompt/acciones verde `#34d399`; links y nombres de "directorio" celeste `#7dd3fc`
  - error (stderr) rojo `#f87171`
- **Tipografía**: todo font-mono con JetBrains Mono vía `next/font` (reemplaza
  Arial como fuente del body).
- **Marco de terminal** en un layout de route group `app/(terminal)/layout.tsx`
  que envuelve SOLO home/about/projects/contact: barra superior con los tres
  semáforos (rojo/amarillo/verde) + título `rodrigo@rburdet.com:~`; la
  navegación (about / projects / contact) va en esa barra como tabs de
  terminal. `/exercises` y `/projects/tictactoe` quedan fuera del marco y sin
  ask bar (solo heredan fondo/tipografía del layout raíz).
- **Micro-animaciones sobrias**:
  - typing effect SOLO en el `$ whoami` del hero de la home, al cargar
  - cursor block parpadeante al final de la línea tipeada
  - hover de cards: borde pasa de `#27272a` a acento
  - nada de glassmorphism, gradientes ni parallax.

## Estructura de páginas

Cada página abre con su "comando" como heading (componente `Prompt`):

- **Home** (`app/page.tsx`):
  1. `$ whoami` → nombre + tagline (hero, con typing effect)
  2. `$ ls projects/` → grid de cards actual re-skineado como salida de `ls`:
     título celeste con `/` final, descripción zinc, tecnologías como `[tag]`
     planos (reemplaza los Badge pill de shadcn)
  3. ask bar (ver abajo)
- **About** (`app/about/page.tsx`): `$ cat about.md` → bio en formato markdown
  renderizado con estética de archivo de texto.
- **Projects** (`app/projects/page.tsx`): `$ ls -la projects/` → misma data de
  `lib/projects.ts` en lista detallada (una línea por proyecto: permisos
  fake/fecha/nombre, descripción).
- **Contact** (`app/contact/page.tsx`): `$ cat contact` → mail, GitHub,
  LinkedIn como líneas de salida clickeables.
- **Sin tocar en v1**: `/exercises` (gym) y `/projects/tictactoe` siguen
  funcionando tal cual; solo heredan el layout oscuro global. No romperlos.
- Las reglas de link de las cards (Task previo) se conservan: `status: "code"`
  sin link interno, `repoUrl` si existe, externalUrl con ícono.

## Chat AI (`ask>`)

**UI:**
- Barra fija abajo en las páginas del marco de terminal (componente `AskBar`,
  client component, montado en `app/(terminal)/layout.tsx`): prompt `ask>`
  verde + input mono.
- Al enviar la primera pregunta se expande un panel de transcript por encima
  (alto máx ~50vh, scrolleable). Respuestas con streaming (van apareciendo).
- Errores del backend se muestran como stderr: línea roja `error: model
  unavailable`.
- Rate limit alcanzado: línea `rate limit exceeded — try tomorrow`.

**Backend:**
- `POST /api/ask` (edge runtime, Pages Function via next-on-pages).
- Binding **Workers AI** (`ai`) declarado en `wrangler.jsonc`; modelo
  `@cf/meta/llama-3.1-8b-instruct-fp8` (el modelo original fue deprecado por
  Cloudflare en 2026; se usa el sibling fp8), respuesta en streaming.
- **Contexto** en `lib/ai-context.ts`: system prompt con la bio de Rodrigo +
  la data de `lib/projects.ts` serializada (única fuente de verdad de
  proyectos). El prompt restringe alcance: solo responde sobre Rodrigo y sus
  proyectos, contesta en el idioma de la pregunta, respuestas cortas.
- **Historia**: el cliente envía los últimos 6 mensajes; el server es
  stateless.
- **Rate limit**: 20 preguntas/día por IP, contador en KV namespace nuevo
  `ASK_RATELIMIT` con TTL de 24h. Excedido → HTTP 429.
- **Validación**: pregunta max 500 chars; historia max 6 mensajes; si no,
  HTTP 400.

## Verificación

- `npm run build` verde.
- Dev server + screenshot de home/about/projects/contact.
- `curl -X POST /api/ask` en preview local (`npm run preview`, que corre
  Pages localmente con bindings) y en prod: respuesta con contenido y 429 al
  exceder el límite (bajar el límite temporalmente para probar o testear la
  rama de código).
- Smoke test en prod post-deploy: las 4 páginas + una pregunta al ask bar.

## Fuera de alcance

- Re-skin interno de `/exercises` y `/projects/tictactoe`.
- Analytics del chat, persistencia de conversaciones.
- CLI "de verdad" (comandos tipeables más allá del ask).
- Modo claro.
