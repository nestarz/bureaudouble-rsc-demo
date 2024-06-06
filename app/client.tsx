import {
  createFromReadableStream,
  encodeReply,
} from "react-server-dom-esm/client.browser";
// @deno-types="@types/react"
import { startTransition, Usable, use, useEffect, useState } from "react";
import { type Dispatch, type SetStateAction } from "react";
// @deno-types="@types/react-dom/client"
import { hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";
import urlcat from "@bureaudouble/outils/urlcat.ts";
import { ErrorBoundary } from "react-error-boundary";

interface ControlledRoot {
  root: Usable<any>;
  abortController?: AbortController;
}
interface ReadableStreamOptions {
  callServer: (id: string, args: unknown[]) => Usable<any>;
}

const Error = ({ error }: { error?: Error }) => (
  <html>
    <head>
      <link rel="stylesheet" href="/styles/styles.css" />
    </head>
    <body className="p-4">
      {error?.message}
    </body>
  </html>
);

const contentMap = new Map<string, ControlledRoot>();
let cacheSetComponent: Dispatch<SetStateAction<ControlledRoot | undefined>>;
export const useNavigation = (initialPathname: string) => {
  const [component, setComponent] = useState<ControlledRoot>();
  cacheSetComponent = setComponent;
  const readableStreamOptions: ReadableStreamOptions = {
    callServer: async (id: string, args: unknown[]) => {
      const pathname = globalThis.location.pathname;
      const abortController = new AbortController();
      const signal = abortController.signal;
      const actionResult = createFromReadableStream(
        await fetch(urlcat("/actions", { rsc_action_id: id }), {
          method: "POST",
          signal,
          headers: { accept: "text/x-component" },
          body: await encodeReply(args),
        }).then((r) => r.body),
        readableStreamOptions,
      );
      contentMap.set(pathname, {
        abortController,
        root: Promise.all([contentMap.get(pathname)?.root, actionResult]).then(
          ([root, { _value, ...v }]) => ({ ...(root ?? {}), ...v }),
        ),
      });
      startTransition(() => cacheSetComponent(contentMap.get(pathname)!));
      return (await actionResult)._value;
    },
  };
  globalThis.callServer = readableStreamOptions.callServer;

  const navigate = (path: string, options?: { force?: boolean }) => {
    startTransition(async () => {
      if (options?.force || !contentMap.get(path)) {
        const abortController = new AbortController();
        const signal = abortController.signal;
        const headers = { Accept: "text/x-component" };
        const response = await fetch(path, { signal, headers });
        const root = createFromReadableStream(
          response.body!,
          readableStreamOptions,
        );
        contentMap.set(path, {
          abortController,
          root: Promise.resolve(
            <ErrorBoundary fallbackRender={Error}>{root}</ErrorBoundary>,
          ),
        });
      }
      const nextComponent = contentMap.get(path);
      if (!nextComponent) return;
      component?.abortController?.abort();
      //getRoot().render(nextComponent.root);
      //void globalThis.scrollTo(0, 0);
      // console.log(nextComponent);
      setComponent(nextComponent);
    });
  };

  const interceptLinkClick = (event: MouseEvent) => {
    if (event.defaultPrevented) return;
    let target = event.target as HTMLAnchorElement | null;
    if (target?.tagName !== "A") target = target?.closest("a") ?? null;
    const goodKey = !event.metaKey && !event.ctrlKey && !event.shiftKey &&
      !event.altKey;
    if (target && goodKey) {
      const href = target.getAttribute("href");
      if (href?.startsWith("/") && target.getAttribute("target") !== "_self") {
        event.preventDefault();
        globalThis.history.pushState(null, "", href);
        navigate(href);
      }
    }
  };

  useEffect(() => {
    const listen = globalThis.addEventListener;
    listen("click", interceptLinkClick, true);
    listen("popstate", () => navigate(location.pathname));
    listen("hmr", () => navigate(location.pathname, { force: true }));
  }, []);

  useEffect(() => void globalThis.scrollTo(0, 0), [component]);

  return use(
    (
      component ??
        contentMap.get(initialPathname) ??
        contentMap
          .set(initialPathname, {
            root: createFromReadableStream(rscStream, readableStreamOptions),
          })
          .get(initialPathname)!
    ).root,
  );
};

const Client = ({ path }: { getRoot: any; path: string }) =>
  useNavigation(path);
const root = hydrateRoot(
  globalThis.document,
  <Client path={globalThis.location.pathname} getRoot={() => root} />,
);
