import { createTailwindClient } from "@bureaudouble/outils/tailwind/createTailwindClient.ts";

export const tailwindClient = await createTailwindClient({
  from: import.meta.resolve("@/main.css"),
  outDirectoryURL: import.meta.resolve("@/build/.tailwind/"),
});
