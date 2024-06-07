import { createRouter } from "@fartlabs/rt";
import { setupClientComponents } from "@bureaudouble/rsc-engine";
import { createStaticHandler } from "@bureaudouble/outils/routes/createStaticHandler.ts";
import { withRouteContext } from "@/app/components/route-context.tsx";

const clientRsc = await setupClientComponents({
  minify: !Deno.env.get("DEV_ENV"),
  namespace: "default",
  entryPoint: import.meta.url,
  moduleBaseURL: import.meta.resolve("./"),
  importMap: import.meta.resolve("./deno.json"),
  bootstrapModules: [import.meta.resolve("./app/client.tsx")],
  external: [],
});

const layout = await import("@/app/pages/_layout.tsx");
const index = await import("@/app/pages/index.tsx").then((v) => () => v);
const about = await import("@/app/pages/about.tsx").then((v) => () => v);
const actions = () => Promise.reject("'use server only'");

const router = createRouter()
  .with(clientRsc.route)
  .get("/styles/:id", layout.tailwindClient.getResponse)
  .get("/static/*", createStaticHandler({ baseUrl: import.meta.url }))
  .use(
    (
      [
        { method: "GET", pathname: "/", handle: index },
        { method: "GET", pathname: "/about{/}?", handle: about },
        { method: "POST", pathname: "/actions{/}?", handle: actions },
      ] as const
    )
      .map(({ method, handle, pathname }) => ({
        match: { method, pattern: new URLPattern({ pathname }) },
        handle: clientRsc.render(withRouteContext(handle)),
      }))
      .flatMap(({ match, handle }) => [{ match, handle }]),
  )
  .default(() => new Response("Not found", { status: 404 }))
  .error(
    (error) => (console.error(error), new Response("Error", { status: 500 })),
  );

Deno.args.some((v) => v === "build")
  ? Deno.exit(0)
  : Deno.serve((request) => router.fetch(request));

// server actions needs to be statically analyzable
(() => import("@/app/actions/incrementLike.ts"));
