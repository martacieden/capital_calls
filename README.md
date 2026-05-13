# Legal entities & assets

Front-end prototype for an **estate intelligence catalog**: assets, entities, documents, timeline, valuations, and an AI assistant (“Fojo”) wired to **mock data** for demos and design iteration.

## Links

- **Live prototype:** [smart-catalog-prototype.vercel.app](https://smart-catalog-prototype.vercel.app)
- **Storybook:** run `npm run storybook`, then open **Introduction** in the sidebar for repo and prototype links

## Stack

- **React** · **TypeScript** · **Vite**
- **Tailwind CSS** v4
- **Storybook** for UI documentation
- Charts (**Nivo**), graphs (**React Flow**), PDF previews (**react-pdf**), motion (**Motion**)

## Prerequisites

- Node.js 20+ (or current LTS) and npm

## Scripts

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | App dev server (default [http://localhost:5173](http://localhost:5173)) |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |
| `npm run storybook` | Storybook on [http://localhost:6006](http://localhost:6006) |
| `npm run build-storybook` | Static Storybook into `storybook-static/` |

## Repository layout

- `src/components/` — UI (atoms / molecules / organisms / pages)
- `src/stories/` — Storybook stories and the **Introduction** doc
- `src/data/` — Mock catalog, documents, Fojo responses, etc.
- `src/styles/` — Global CSS and design tokens

Everything is **client-side**; there is no backend or real authentication in this repo.
# capital_calls
