AMMOS CinematicField TypeScript fix

Replace components/CinematicField.tsx.

From ~/Ammos/apps/web:
unzip -o ~/storage/downloads/AMMOS-cinematic-field-ts-fix.zip -d .
rm -rf .next
npx tsc --noEmit
npm run lint
npm run build

The fix keeps the cinematic canvas motion and resolves strict-null errors by guarding the canvas and 2D context before use.
