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
| `clavos` | `clavos.rburdet.com` | Cloudflare Workers | Ya tiene wrangler.toml + open-next. **Deploy nuevo** |
| `expensas` | `expensas.rburdet.com` | Cloudflare Workers | React Router v7 SSR; se publica con los datos reales tal cual (decisión de Rodrigo). El worker se renombra de `react-router-app` a `expensas`. No es repo git: se inicializa. **Deploy nuevo** |
| `classic` | `classic.rburdet.com` | Cloudflare Workers + D1 | Dos workers (web con vinext + scraper con cron) y D1 `classic-cars-db` compartida; migraciones 0001–0008 en `db/migrations/`. **Deploy nuevo** |
| `portolimpic` | `wind.rburdet.com` | Cloudflare Workers | **Ya deployado**: es la app de la card "Wind Conditions". Solo se actualiza esa card (descripción/tecnologías) |
| `tuyairbnb` | `airbnb.rburdet.com` | Cloudflare Workers + D1 | **Ya deployado y ya detrás de Cloudflare Access** (verificado). Solo falta la card |
| `guardiapp` | `guardias.rburdet.com` | VPS Hetzner | **Ya live** vía named tunnel "guardias" + start.sh + crontab @reboot. Se deja el setup como está; solo falta la card |
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
del estado `code`. Ojo: hoy la card sin `externalUrl` linkea a
`/projects/<id>` (página interna); para las cards `code` el título no debe ser
link (o linkea a `repoUrl` si existe). Se mantiene el estilo actual de cards,
**sin screenshots**.

Además se actualiza la card existente **"Wind Conditions"** con la descripción
y tecnologías reales de portolimpic (Cloudflare Workers, KV, cron, Web Push).

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

**Ya configurado y verificado**: `airbnb.rburdet.com` redirige al login de
Access. No hay nada que hacer.

### VPS Hetzner (guardiapp)

**Se deja como está** (decisión de Rodrigo): named tunnel "guardias" +
`start.sh` + crontab @reboot ya sobreviven reinicios y sirven
`guardias.rburdet.com` en modo producción.

## Orden de trabajo

1. **Portfolio**: extender modelo; agregar cards B + cards de lo ya live
   (tuyairbnb → airbnb.rburdet.com, guardiapp → guardias.rburdet.com) y
   actualizar la card Wind.
2. **Deploys Cloudflare** uno por uno (clavos → expensas → classic),
   agregando la card de cada uno al verificar que anda.
3. **Apex** `rburdet.com` → portfolio, y deploy final del portfolio.
4. **world-tides**: brainstorm + spec propios; fuera del alcance de este trabajo.

## Fuera de alcance

- Desarrollo de world-tides (proyecto aparte).
- CI/CD con GitHub Actions.
- Screenshots en las cards.
- Cambios en la VPS (guardiapp queda con su setup actual).
