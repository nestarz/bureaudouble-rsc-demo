import { cache } from "react";
export const getRouteContext = cache(() => ({ id: Math.random() }));
const Context = ({ ctx, Component }) => {
  Object.assign(getRouteContext(), ctx);
  return <Component {...ctx} />;
};
export const withRouteContext = (handle: () => any) => {
  return async () => {
    const { default: Component } = await handle();
    return {
      default: (ctx) => <Context ctx={ctx} Component={Component} />,
    };
  };
};
