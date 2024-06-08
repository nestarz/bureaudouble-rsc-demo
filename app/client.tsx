// @deno-types="@types/react"
import {
  Component,
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  startTransition,
  type Usable,
  use,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createFromReadableStream,
  encodeReply,
} from "react-server-dom-esm/client.browser";
// @deno-types="@types/react-dom/client"
import { hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";
import urlcat from "@bureaudouble/outils/urlcat.ts";

const contentMap = new Map<string, ControlledRoot>();

const ErrorContext = createContext({
  pathname: location.pathname,
  error: null as Error | null,
  setError: (_arg: Error | null) => {},
  subscribe: (_callback: (error: Error | null) => void) => {},
});

const ErrorContextProvider = (
  { children, initialPathname }: {
    initialPathname: string;
    children: ReactNode;
  },
) => {
  const [error, setError] = useState<Error | null>(null);
  const [pathname, setPathname] = useState<string>(initialPathname);
  const subscribers = useRef<((error: Error | null) => void)[]>([]);
  useEffect(() => {
    if (!error) return;
    contentMap.delete(location.pathname);
    const listener = () => (setPathname(location.pathname), setError(null));
    globalThis.addEventListener("popstate", listener);
    return () => globalThis.removeEventListener("popstate", listener);
  }, [error]);
  useEffect(() => {
    subscribers.current.forEach((callback) => callback(error));
  }, [error]);
  const subscribe = (callback: (error: Error | null) => void) => {
    subscribers.current.push(callback);
  };
  return (
    <ErrorContext value={{ error, pathname, setError, subscribe }}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </ErrorContext>
  );
};

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  static contextType = ErrorContext;
  declare context: React.ContextType<typeof ErrorContext>;

  componentDidMount() {
    this.context.subscribe((error) => this.setState({ error }));
  }

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.context.setError(error);
  }

  render() {
    if (this.state?.error) {
      return (
        <html>
          <head>
            <link rel="stylesheet" href="/styles/styles.css" />
          </head>
          <body className="p-4">
            <h1 className="font-bold">Error</h1>
            <p>{this.context.error?.message}</p>
          </body>
        </html>
      );
    }
    return this.props.children;
  }
}

interface ControlledRoot {
  root: Usable<any>;
  abortController?: AbortController;
}
interface ReadableStreamOptions {
  callServer: (id: string, args: unknown[]) => Usable<any>;
}

let cacheSetComponent: Dispatch<SetStateAction<ControlledRoot | undefined>>;
export const useNavigation = () => {
  const { pathname: initialPathname } = useContext(ErrorContext);
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
          root,
        });
      }
      const nextComponent = contentMap.get(path);
      if (!nextComponent) return;
      component?.abortController?.abort();
      //getRoot().render(nextComponent.root);
      //void globalThis.scrollTo(0, 0);
      // console.log(nextComponent);
      setComponent(nextComponent);
      // setPathname(path);
    });
  };

  const interceptLinkClick = (event_: Event) => {
    const event = event_ as MouseEvent;
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
    type EventListenerArgs = [string, EventListener, boolean?];
    const arr: EventListenerArgs[] = [];
    const listen = (...v: EventListenerArgs) =>
      globalThis.addEventListener(...arr.at(arr.push(v) - 1)!);
    listen("click", interceptLinkClick, true);
    listen("popstate", () => navigate(location.pathname));
    listen("hmr", () => navigate(location.pathname, { force: true }));
    return () => arr.forEach((v) => globalThis.removeEventListener(...v));
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

const Route = () => useNavigation();

hydrateRoot(
  globalThis.document,
  <ErrorContextProvider initialPathname={globalThis.location.pathname}>
    <Route />
  </ErrorContextProvider>,
);
