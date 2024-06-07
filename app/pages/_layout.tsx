import { createTailwindClient } from "@bureaudouble/outils/tailwind/createTailwindClient.ts";
import { Header } from "@/app/components/header.tsx";
import { Footer } from "@/app/components/footer.tsx";

type RootLayoutProps = { children?: JSX.Element | JSX.Element[] };

export const tailwindClient = await createTailwindClient({
  tailwindConfig: (importNSA) => importNSA("@/tailwind.config.ts"),
  outDirectoryURL: import.meta.resolve("@/build/.tailwind/"),
});

export default async function RootLayout({ children }: RootLayoutProps) {
  const data = await getData();
  const tailwind = await tailwindClient.getOutput();

  return (
    <html>
      <head>
        <link rel="stylesheet" href={`/styles/${tailwind.id}`} />
      </head>
      <body>
        <div className="font-['Nunito']">
          <meta property="description" content={data.description} />
          <link rel="icon" type="image/png" href={data.icon} />
          <Header />
          <main className="m-6 flex items-center flex-col lg:m-0 lg:min-h-svh lg:justify-center">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

const getData = async () => {
  const data = {
    description: "An internet website!",
    icon: "/images/favicon.png",
  };

  return data;
};
