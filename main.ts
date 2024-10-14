import { createRouter } from "@fartlabs/rt";
import {
  hmrRebuildEventName,
  setupClientAndActions,
} from "@bureaudouble/rsc-engine";
import { createStaticHandler } from "@bureaudouble/outils/routes/createStaticHandler.ts";
import { createHmr } from "@bureaudouble/outils/routes/createHmrRouter.ts";
import { tailwindClient } from "@/app/utils/tailwind.ts";

const clientAndActions = await setupClientAndActions({
  entryPoint: import.meta.url,
  bootstrapModules: [import.meta.resolve("@bureaudouble/rsc-engine/client")],
});

const router = createRouter()
  .use(createHmr({ name: hmrRebuildEventName, mode: "event" }).router)
  .get("/styles/:id", tailwindClient.getResponse)
  .get("/public/*", createStaticHandler({ baseUrl: import.meta.url }))
  .use(
    clientAndActions({
      "/": import("@/app/pages/index.tsx"),
      "/about{/}?": import("@/app/pages/about.tsx"),
    }),
  )
  .default(() => new Response("Not found", { status: 404 }))
  .error(
    (error) => (console.error(error), new Response("Error", { status: 500 })),
  );

Deno.args.some((v) => v === "build")
  ? Deno.exit(0)
  : Deno.serve((request, serveHandlerInfo) =>
    router.fetch(request, undefined, { serveHandlerInfo })
  );
