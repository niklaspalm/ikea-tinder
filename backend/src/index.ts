/** Runs the API on its own. The app normally serves it through SvelteKit; see frontend/src/hooks.server.ts. */
import { serve } from "@hono/node-server";
import { z } from "zod";
import { createApiFromEnv } from "./server.ts";

const { PORT } = z.object({ PORT: z.coerce.number().int().positive().default(3000) }).parse(process.env);
const app = createApiFromEnv();

serve({ fetch: app.fetch, port: PORT }, ({ port }) => {
  console.log(`IKEA Tinder API listening on http://localhost:${port}`);
});
