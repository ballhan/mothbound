# Mothbound — The Drowned Bell

A small original browser action platformer inspired by atmospheric metroidvanias. Explore a drowned cathedral, collect embers, rest at lantern checkpoints, and defeat the Bellwarden. All artwork is drawn in Canvas; sound effects are synthesized locally. No external assets or runtime dependencies.

## Play locally

Requires Node.js 20 or later. Run `npm run dev` in this directory, then open http://127.0.0.1:4173. Alternatively serve this directory with any static web server.

## Controls

| Action | Key |
| --- | --- |
| Move | A / D or arrow keys |
| Jump / double jump | Space, W, or up arrow |
| Sword | J |
| Dash | K or Shift |
| Heal | Hold L while standing still; costs 35 soul |
| Rest and save | E near a lantern |
| Pause | Escape |

Touch controls appear on touch devices. Strike enemies to restore soul. Dash through attacks; jump over the Bellwarden's ground shockwaves. Lantern saves use browser local storage. This is a compact prototype with four areas and one boss, not a full commercial-length game.

## Checks

`npm test` exercises landing, double jumping, dash, combat rewards, boss transitions and victory, and checkpoint respawn using a mocked DOM and Canvas. These checks do not replace visual testing in a browser.

## Hosting

Deploy the repository root with GitHub Pages, using the `main` branch. No build step is required.
