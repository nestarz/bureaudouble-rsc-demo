import { createTailwindClient } from "@bureaudouble/outils/tailwind/createTailwindClient.ts";

export const tailwindClient = await createTailwindClient({
  tailwindConfig: (importNSA) => importNSA("@/tailwind.config.ts"),
  outDirectoryURL: import.meta.resolve("@/build/.tailwind/"),
});
