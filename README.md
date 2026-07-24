# H&G Armory

A weapon database and TTK calculator for Heroes & Generals. Query and compare damage, DPS, time-to-kill, recoil, accuracy, armor penetration and reload times for every rifle, SMG, LMG, pistol, anti-tank launcher, grenade and mine, with support for attachments, ammo types and badges.

> Source repository: https://github.com/tzm13/HnG-Armory

## What this fork does

This fork is a full engineering refactor of the original project, plus several new features. Main work:

### Architecture refactor
- Migrated to **Vue 3 + TypeScript + Vite**
- Adopted **Pinia** for state management (weapons / config / versus / ui stores)
- Added **Vue Router** to split the app into detail / table / compare views
- Reorganized source by responsibility: `components/` (charts, common, compare, detail, sidebar, table), `composables/`, `lib/`, `stores/`, `locales/`, `types/`
- Vite build splits chunks by vendor / weapons data / app logic for better long-term caching

### Internationalization
- Integrated **vue-i18n** with Chinese / English toggle (`src/locales/zh.json`, `en.json`)
- Replaced hardcoded strings in the original project (unit labels, group titles, fireMode, EP, etc.) with i18n keys

### Data & formulas
- Ported `compute()` formulas and `recoilPattern()` noise seeds from the original project; values match the original site exactly
- Fixed edge cases around NaN propagation, Infinity and division by zero (`safeNum`, `rpm` guards, `htkNear` upper bound, etc.)
- Batch-downloaded weapon images from Fandom Wiki and localized them (`public/weapons/{id}.png`, including fixing mismatched images)

### Visuals & interaction
- Recreated the original brass / military-green dark theme; fixed topbar height jump caused by font `display=swap`
- Sidebar search auto-expands the factions and categories that contain matches
- Compare view supports 2–3 weapons side by side, with VersusChart visualization
- Fixed SVG namespace issues by replacing `v-html` injection with native Vue template bindings

### Engineering
- Pinned all dependency versions with `~` (patch updates only)
- Switched package manager to **pnpm**
- Fixed duplicated `vite.config.ts` include in `tsconfig.json`
- Added SEO metadata (Open Graph, Twitter Card, JSON-LD WebApplication), `site.webmanifest`, favicon

## Local development

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # outputs dist/
pnpm preview  # preview the build
```

## Directory structure

```
src/
├── assets/styles/      # global styles (layout / base / variables)
├── components/
│   ├── charts/         # MetricChart, RecoilSvg, SilhouetteSvg, TankSvg, BlastChart
│   ├── common/         # Badge, SegButtons, StatCell, SectionGroup, ContactPop
│   ├── compare/        # CompareView, VersusChart, WeaponPicker, ColumnConfig
│   ├── detail/         # DetailView, ConfigPanel, GunReadouts, ExplosiveReadouts, EquipmentReadouts, CombatCurves
│   ├── sidebar/        # WeaponSidebar, FactionBlock, CatHead, WeaponItem
│   └── table/          # WeaponTable
├── composables/        # useCompute, useSpread
├── data/weapons.ts     # full weapon dataset
├── lib/                # compute, recoil, classify, format, constants
├── locales/            # zh.json / en.json
├── stores/             # weapons / config / versus / ui
├── types/weapon.ts
├── App.vue
├── main.ts
├── router.ts
└── i18n.ts
public/
└── weapons/            # weapon 2D images {id}.png
```

## Credits

- Original author: [tzm13](https://github.com/tzm13)
- Source repository: https://github.com/tzm13/HnG-Armory
- Refactor + i18n: DoubleBird

## License

UNLICENSED
