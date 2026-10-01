import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createApiFromEnv } from 'ikea-tinder-backend/server';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

/**
 * The Hono API runs inside SvelteKit's server, so pages and `/api/*` share one
 * process and one port in dev (`vite dev`) and production (`node build`) alike.
 */
const api = createApiFromEnv();

const handleApi: Handle = ({ event, resolve }) =>
	event.url.pathname.startsWith('/api/') ? api.fetch(event.request) : resolve(event);

/** Resolves the UI locale per request and stamps it on `<html lang dir>`. */
const handleLocale: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html.replace('%paraglide.lang%', locale).replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle = sequence(handleApi, handleLocale);
