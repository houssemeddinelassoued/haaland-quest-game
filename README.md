# ⚽ Super Haaland Quest

A Super Mario-style 2D platformer starring **Erling Haaland** — pixel-art
Viking cyborg, golden ponytail and all. Built with **Phaser 3** (Arcade
Physics). Every sprite, tile, background, and sound effect is generated
procedurally at boot, so the game ships with **zero binary assets** and runs
straight from a static file server with no build step.

![Phaser 3](https://img.shields.io/badge/engine-Phaser%203.80-6cabdd)

## ▶️ How to Run

Any static file server works:

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

or `npx serve`, or deploy the folder as-is to GitHub Pages / Netlify / Vercel.

## 🎮 Controls

| Key | Action |
| --- | --- |
| ← → / A D | Run |
| ↑ / W / SPACE | **The Power Leap** — big, slightly floaty jump (hold to float) |
| SHIFT | **Slide-Tackle Dash** — smashes bricks, takes out defenders |
| Z / K | Kick a flaming mini-football (requires Beef power) |
| M | Mute | 
| R | Restart level |

## 🧪 Power-Ups

| Item | Effect |
| --- | --- |
| 🥛 **Glass of Raw Milk** | Grow into Super Erling — take an extra hit, smash bricks with a headbutt |
| 💛 **Kknekki Hair Tie** | Temporary invincibility — the ponytail glows and Erling hits max cyborg speed |
| 🥩 **Beef Heart** | Kick flaming mini-footballs that bounce along the ground |
| 👜 **Hermès Handbag** | A shield that absorbs one hit without losing Super status |

## 👿 Enemies

- **Slide-Tackling Defenders** — patrol platforms; stomp or dash through them
- **Whistle-Blowing Referees** — lob red cards in an arc
- **Paparazzi Drones** — hover overhead and fire blinding flashes that stun
- **The Giant Goalkeeper** (final boss) — armoured keeper who kicks giant
  footballs; stomp his head (or pepper him with fireballs) to win

## 🗺️ Worlds

1. **The Fjords** — lush platforms, icy water pits, Viking longhouses
2. **The Training Ground** — cone drills, referees, bouncy exercise balls
3. **The Big City** — rainy rooftops, neon skyline, *slippery* scaffolding
4. **The Final Stadium** — floodlights, a wall of fans, and the boss fight

**Finishing a level:** leap onto the giant drum at the end. Land hard enough
(a proper Power Leap from above) and Erling sits down in his **Zen Lotus
pose** for a +5000 bonus while the pixel-art crowd does the **Viking Row**.

## 🛠️ Tech

- [Phaser 3.80](https://phaser.io/) — vendored in `assets/vendor/`, no CDN or
  network needed at runtime
- **Procedural pixel art** — `src/textures.js` renders every sprite from
  ASCII pixel grids onto canvases at boot
- **Procedural audio** — `src/audio.js` synthesizes all SFX and the per-world
  chip-tune loop with the WebAudio API
- **ASCII level maps** — `src/levels.js`; one character per 32px tile, easy
  to edit by hand (legend at the top of the file)
- **Scenes** — Boot → Menu → Level (×4) → GameOver / Victory, with score,
  coins, lives, and power state tracked in the Phaser registry

## 📁 Project Layout

```
index.html            entry point
assets/vendor/        phaser.min.js
src/audio.js          WebAudio SFX + music
src/textures.js       procedural pixel-art generation
src/levels.js         ASCII maps for the four worlds
src/game.js           scenes, player, enemies, boss, HUD
```
