import { createRouter } from "@fartlabs/rt";
import { setupClientComponents } from "@bureaudouble/rsc-engine";
import { createTailwindClient } from "@bureaudouble/outils/tailwind/createTailwindClient.ts";
import { createStaticHandler } from "@bureaudouble/outils/routes/createStaticHandler.ts";
import { withRouteContext } from "@/app/components/route-context.tsx";

export const tailwindClient = await createTailwindClient({
  namespace: "default",
  baseUrl: new URL(".", import.meta.url).href,
  tailwindConfig: (importNSA) => importNSA("@/tailwind.config.ts"),
  outDirectory: "./build/.tailwind/",
});

const clientRsc = await setupClientComponents({
  minify: !Deno.env.get("DEV_ENV"),
  namespace: "default",
  entryPoint: import.meta.url,
  moduleBaseURL: import.meta.resolve("./"),
  importMap: import.meta.resolve("./deno.json"),
  bootstrapModules: [import.meta.resolve("./app/client.tsx")],
  external: [],
});

const router = createRouter()
  .with(clientRsc.route)
  .get("/styles/:id", tailwindClient.getResponse)
  .get("/static/*", createStaticHandler({ baseUrl: import.meta.url }))
  .use(
    (
      [
        {
          method: "GET",
          pathname: "/",
          handle: () => import("./app/pages/index.tsx"),
        },
        {
          method: "GET",
          pathname: "/about{/}?",
          handle: () => import("./app/pages/about.tsx"),
        },
        {
          method: "POST",
          pathname: "/actions{/}?",
          handle: () => Promise.reject("'use server only'"),
        },
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
