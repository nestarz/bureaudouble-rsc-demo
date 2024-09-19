import { createRouter } from "@fartlabs/rt";
import { setupClientComponents } from "@bureaudouble/rsc-engine";
import { createStaticHandler } from "@bureaudouble/outils/routes/createStaticHandler.ts";
import { createHmr } from "@bureaudouble/outils/routes/createHmrRouter.ts";
import { tailwindClient } from "@/app/utils/tailwind.ts";

const clientRsc = await setupClientComponents({
  entryPoint: import.meta.url,
  bootstrapModules: [import.meta.resolve("@bureaudouble/rsc-engine/client")],
});

const router = createRouter()
  .use(createHmr({ name: clientRsc.hmrRebuildEventName, mode: "event" }).router)
  .with(clientRsc.route)
  .get("/styles/:id", tailwindClient.getResponse)
  .get("/public/*", createStaticHandler({ baseUrl: import.meta.url }))
  .use(
    clientRsc.createRscRoutes({
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
