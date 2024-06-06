import RootLayout from "@/src/pages/_layout.tsx";

export default async function AboutPage() {
  const data = await getData();

  return (
    <RootLayout>
      <title>{data.title}</title>
      <h1 className="text-4xl font-bold tracking-tight">{data.headline}</h1>
      <p>{data.body}</p>
      <a href="/" className="mt-4 inline-block underline">
        Return home
      </a>
    </RootLayout>
  );
}

const getData = async () => {
  const data = {
    title: "About",
    headline: "About bureaudouble/rsc-engine",
    body: "The minimal React framework",
  };

  return data;
};
