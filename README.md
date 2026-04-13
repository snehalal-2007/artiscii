# Artiscii

Real-time webcam to ASCII art in the browser (React + Vite, client-side only).

## Run locally

```bash
cd artiscii
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Allow camera access when prompted.

## Build

```bash
npm run build
npm run preview
```

## Notes

- Uses `getUserMedia` for the webcam and `requestAnimationFrame` for the render loop.
- A hidden canvas captures downscaled frames; ASCII is drawn to a `<pre>` (monochrome) or `<canvas>` (color).
