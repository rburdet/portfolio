# Spec: Proyectos de ~/hobby en el portfolio

**Fecha:** 2026-07-30
**Estado:** aprobado por Rodrigo

## Objetivo

Agregar los proyectos de `~/hobby` al portfolio (`rburdet.com`), deployando los
que van con demo pública y mostrando como card estática los que no. Formalizar
la infra necesaria (dominios en Cloudflare, tunnel en la VPS de Hetzner).

## Alcance

### A — Demo pública (deploy + card con link)

| Proyecto | Dominio | Plataforma | Notas |
|---|---|---|---|
| `clavos` | `clavos.rburdet.com` | Cloudflare Workers | Ya tiene wrangler.toml + open-next |
| `expensas` | `expensas.rburdet.com` | Cloudflare Workers | React Router v7 SSR; se publica con los datos reales tal cual (decisión de Rodrigo) |
| `classic` | `classic.rburdet.com` | Cloudflare Workers + D1 | Dos workers (web + scraper) con D1 compartida |
| `portolimpic` | `portolimpic.rburdet.com` | Cloudflare (static assets) | Vite + React |
| `tuyairbnb` | `tuyairbnb.rburdet.com` | Cloudflare Workers + D1 | Detrás de **Cloudflare Access** (Zero Trust): allow solo el email de Rodrigo. Sin cambios de código |
| `guardiapp` | `guardiapp.rburdet.com` | VPS Hetzner | Named tunnel de cloudflared + systemd (ver Infra) |
| `world-tides` | `tides.rburdet.com` (a futuro) | — | **Proyecto aparte**: hay que desarrollarlo desde cero (src/ vacío). Tendrá su propio brainstorm/spec. Su card se agrega recién cuando esté live |

### B — Card sin demo viva

| Proyecto | Link en la card | Notas |
|---|---|---|
| `etiquetas` | ninguno (repo privado) | App Electron + extensión Chrome para etiquetas QR (Brother QL-800) |
| `facturador-zalva` | ninguno (sin remote) | Facturador; datos/credenciales reales |
| `harvester` | repo GitHub (público) | CLI Python: timesheets de Harvest desde commits git |
| `hasura-json` | ninguno (sin remote) | Extensión Chrome: JSON viewer para la consola Hasura |

Si más adelante se hacen públicos otros repos, se agrega el `repoUrl` a la card.

### Skip

- `rburdet` (sitio personal viejo — el portfolio lo reemplaza)
- `quesopla` (es el mismo proyecto que la card "Wind" ya existente)
- `constellation`, `merk2-scrapper`, `three`, `mercadolibre-mcp`, `brenp-prismic-test` (excluidos por Rodrigo)

## Cambios en el portfolio

En `lib/projects.ts`:

- Extender la interfaz `Project` con `repoUrl?: string` y `status?: "live" | "code"`.
  - `live` (default): card con link a la demo (`externalUrl`).
  - `code`: card sin demo; muestra descripción + tecnologías + `repoUrl` si existe.
- Agregar las entradas nuevas: 6 tipo A (todas menos world-tides) + 4 tipo B.
- Cada card A se agrega recién cuando su deploy esté verificado funcionando
  (hasta entonces esa card no existe en `projects.ts`). Las cards B se agregan
  todas de entrada.

En los componentes (`components/project-grid.tsx`): render del link al repo y
del estado `code`. Se mantiene el estilo actual de cards, **sin screenshots**.

## Infra

### DNS (zona rburdet.com en Cloudflare)

- Custom domain por worker deployado (clavos, expensas, classic, portolimpic, tuyairbnb).
- Apex `rburdet.com` → portfolio (Cloudflare Pages custom domain; hoy solo resuelve `www`).
- `guardiapp.rburdet.com` → CNAME al named tunnel.

### Deploys Cloudflare

Cada proyecto se deploya desde su propio repo con `wrangler deploy`, con el
custom domain declarado en su config de wrangler. **Sin CI por ahora** (mismo
esquema que gym/mareas/encarta). CI con GitHub Actions queda como mejora futura.

### Cloudflare Access (tuyairbnb)

Aplicación Zero Trust sobre `tuyairbnb.rburdet.com` con política allow para el
email de Rodrigo. Login con Google/OTP manejado por Cloudflare; el worker no se toca.

### VPS Hetzner (guardiapp)

Hoy: apps corriendo en puertos de desarrollo con tunnels efímeros de cloudflared.
Objetivo:

- **Named tunnel** de cloudflared (config persistente, ingress
  `guardiapp.rburdet.com → localhost:<puerto>`), corriendo como servicio.
- Backend de guardiapp (FastAPI + OR-Tools) como **servicio systemd** en modo
  producción (no dev server).

## Orden de trabajo

1. **Portfolio**: extender modelo, agregar cards B (quedan listas ya) y deploy del portfolio.
2. **Deploys Cloudflare** uno por uno (clavos → expensas → classic → portolimpic → tuyairbnb+Access), agregando el `externalUrl` a cada card al verificar que anda.
3. **VPS**: formalizar guardiapp (systemd + named tunnel) y agregar su card.
4. **Apex** `rburdet.com` → portfolio.
5. **world-tides**: brainstorm + spec propios; fuera del alcance de este trabajo.

## Fuera de alcance

- Desarrollo de world-tides (proyecto aparte).
- CI/CD con GitHub Actions.
- Screenshots en las cards.
- Migrar a Docker en la VPS (se eligió systemd).
