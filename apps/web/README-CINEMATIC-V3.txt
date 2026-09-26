AMMOS CINEMATIC HOME V3

This is an overlay patch for the existing AMMOS app. It intentionally contains only the files changed for the new landing experience.

What changes:
- full-screen cinematic landing hero
- GPU-friendly canvas particle/ribbon field with pointer parallax
- restrained blue/violet visual language
- cinematic top navigation on the homepage
- live backend values remain wired into the hero
- real DeFiLlama market chart remains live in the command-center reveal
- live opportunity cards remain sourced from the existing backend
- existing agent reasoning and chat surfaces remain intact
- existing non-home routes are not replaced

Apply from ~/Ammos/apps/web:
  unzip -o ~/storage/downloads/AMMOS-cinematic-home-v3.zip -d .
  rm -rf .next
  npx tsc --noEmit
  npm run lint
  npm run build

Then run:
  npm run dev
