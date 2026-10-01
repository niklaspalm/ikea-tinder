// Starts the production server (`npm run build` first).
// SvelteKit rejects form posts whose Origin doesn't match the site's own (CSRF protection),
// and adapter-node can only know that origin from ORIGIN. Default it for local runs;
// a real deployment sets ORIGIN (e.g. https://tinder.example.com) itself.
process.env.ORIGIN ??= `http://localhost:${process.env.PORT ?? 3000}`;

await import('./build/index.js');
