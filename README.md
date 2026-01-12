
# Obsidian Hill Charts (Bases View)

An **interactive Hill Chart view for Obsidian Bases**.
Visualize project progress directly from your Base using draggable dots that stay in sync with note frontmatter.

This plugin implements a **custom Bases view** that renders a hill-shaped progress curve and maps each file’s `hillPos` property to a position on the hill.

---

## What this is for

Hill charts are useful when:

* Progress is **non-linear**
* Exact percentages are misleading
* You want to see **where thinking ends and execution begins**

This plugin makes hill charts a **first-class Bases view**, not a static embed or image.

---

## Features

* ✅ Custom **Bases View** (not a hack or embed)
* ✅ Reads `hillPos` directly from Base query results
* ✅ Drag dots to update note frontmatter (`hillPos`)
* ✅ Debounced writes (no metadata spam)
* ✅ Survives tab switching, reloads, and deferred views
* ✅ Dark-mode optimized visuals
* ✅ Smooth color transitions along the hill
* ✅ CSS-driven dot styling (outer + inner circles)

---

## How it works (high level)

* Extends `BasesView`
* Uses `BasesQueryResult.data` as the source of truth
* Converts entries → `HillItem`s via an adapter
* Renders via `hill-chart` (SVG)
* Writes back to notes using `processFrontMatter`
* Handles Obsidian’s **Deferred View lifecycle** correctly

No polling. No DOM guessing. No unsafe casts.

---

## Requirements

* Obsidian **v1.10.0+**
* Core **Bases** plugin enabled
* Notes must have a numeric frontmatter property (default: `hillPos`)

Example:

```yaml
---
hillPos: 42
---
```

---

## Installation (development)

```bash
git clone https://github.com/yourname/obsidian-hill-charts
cd obsidian-hill-charts
npm install
npm run build
```

Copy the built folder into:

```
<vault>/.obsidian/plugins/
```

Enable the plugin in Obsidian.

---

## Usage

1. Create a `.base` file
2. Add a query that returns notes with `hillPos`
3. Open the Base
4. Switch the view type to **Hill Chart**
5. Drag dots to update progress

Changes are written back to the source notes automatically.

---

## Configuration

Currently implicit by convention:

| Property  | Type           | Meaning                 |
| --------- | -------------- | ----------------------- |
| `hillPos` | number (0–100) | Position along the hill |

Future versions may expose:

* Property name override
* Color scales
* Hill shape presets
* Grouping behavior

---

## Known limitations

* No mobile-specific optimizations yet


## License

MIT
