# Mothbound — The Drowned Bell

A small original browser action platformer inspired by atmospheric metroidvanias. Explore a drowned cathedral, collect embers, rest at lantern checkpoints, and defeat the Bellwarden. A painted panorama sits behind animated Canvas characters, foliage, fog, and lighting. Music and effects are synthesized locally. No external services or runtime dependencies.

[Play Mothbound](https://ballhan.github.io/mothbound/)

## The illustrated-world update

- Painted cathedral background with blue cloisters, jade glass gardens, and a violet/gold belfry. Multiple moving depth layers, flowers, hanging vines, light rays, mist, rim lighting, and detailed stonework.
- Animated moth pilgrim, beetles, flying wisps, ranged stone sentries, and armored Bellwarden. Sword crescents, impact pause, recoil, dash trails, landing dust, and healing rings.
- Directional sword attacks, downward strike bounce, variable jump height, double jump, dash invulnerability, and a soul projectile.
- Map with visited areas, upper exploration paths, four collectible clusters, and two lore inscriptions.
- A lamplighter merchant sells permanent weapon and health upgrades. Death leaves recoverable embers. Upgrades, discovered memories, saved collectibles, and boss victory persist in local storage.
- Bellwarden charge and leap attacks, ground shockwaves, and a new projectile fan in phase two.
- Ambient and boss music, sound toggle, mobile controls, proportional rendering, and reduced camera shake/flashes when reduced motion is requested.

## Play locally

Requires Node.js 22 or later for development. Run `npm run dev` in this directory, then open http://127.0.0.1:4173. Alternatively serve this directory with any static web server.

## Controls

| Action | Key |
| --- | --- |
| Move | A / D or arrow keys |
| Jump / double jump | Space or W; release early for a shorter jump |
| Sword | J |
| Aim sword up / down | Hold up / down arrow + J (downward strikes bounce while airborne) |
| Dash | K or Shift |
| Soul projectile | F; costs 25 soul |
| Heal | Hold L while standing still; costs 35 soul |
| Rest / talk / read | E near a lantern, merchant, or inscription |
| Map | M |
| Pause | Escape |

Touch controls appear on touch devices. Strike enemies to restore soul. Dash through attacks; jump over the Bellwarden's ground shockwaves. Lantern saves use browser local storage. This is a compact prototype with four areas and one boss, not a full commercial-length game.

## Checks

`npm test` checks movement, directional combat, spells, healing, merchant pricing, death recovery, modal pause, boss behavior, and save migration/persistence with a mocked DOM and Canvas.

`npm install` then `npm run render-check` generates real native Canvas images of the cloister, gardens, belfry, and a mobile viewport in `qa/`. These inspect the same renderer used in the browser; they do not exercise browser layout, input, or audio. The current update was checked with native renders; interactive browser validation remains outstanding.

The game remains a compact four-area, one-boss prototype. It does not reproduce Hollow Knight's full campaign, world map, bosses, charm system, wall climbing, quests, or hand-animated sprite library. All characters, artwork, lore, and music here are original. The design reference was [Team Cherry's description of its hand-drawn world and evolving abilities](https://www.hollowknight.com/).

See [art provenance and the generation prompt](assets/ART.md).

## Hosting

Deploy the repository root with GitHub Pages, using the `main` branch. No build step is required.
