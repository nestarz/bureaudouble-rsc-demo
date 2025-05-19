import { getHmrScriptPath } from "@bureaudouble/outils/routes/createHmrRouter.ts";
import { Header } from "@/app/components/header.tsx";
import { Footer } from "@/app/components/footer.tsx";
import { tailwindClient } from "@/app/utils/tailwind.ts";

type RootLayoutProps = { children?: React.ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const data = await getData();
  const tailwind = await tailwindClient.getOutput();
  const hmrScriptPath = getHmrScriptPath();

  return (
    <html>
      <head>
        <link rel="stylesheet" href={`/styles/${tailwind.id}`} />
        <link rel="icon" type="image/png" href="/public/images/favicon.png" />
        {hmrScriptPath && <script src={hmrScriptPath} defer async />}
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
