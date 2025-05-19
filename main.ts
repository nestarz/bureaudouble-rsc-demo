import setupClientAndActions from "@bureaudouble/rsc-engine";
import { createRouter } from "@bureaudouble/routeur";
import { createStaticHandler } from "@bureaudouble/outils/routes/createStaticHandler.ts";
import { createHmr } from "@bureaudouble/outils/routes/createHmrRouter.ts";
import { tailwindClient } from "@/app/utils/tailwind.ts";

const { render, statics, actions } = await setupClientAndActions({
  entryPoint: import.meta.url,
  bootstrapModules: [import.meta.resolve("@bureaudouble/rsc-engine/client")],
});

if (Deno.args.includes("build")) Deno.exit(0);

const router = createRouter()
  .use(createHmr({ name: "hmr", mode: "event" }).router)
  .get("/styles/:id", tailwindClient.getResponse)
  .get("/public/*", createStaticHandler({ baseUrl: import.meta.url }))
  .get("/", render(import("@/app/pages/index.tsx")))
  .get("/about{/}?", render(import("@/app/pages/about.tsx")))
  .get("/*", statics)
  .post("/actions{/}?", actions)
  .default(() => new Response("Not found", { status: 404 }))
  .error(
    (error) => (console.error(error) ?? new Response("Error", { status: 500 })),
  );

export default router satisfies Deno.ServeDefaultExport;
