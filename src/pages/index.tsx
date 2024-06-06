import { LikeButton } from "@/src/components/like-button.tsx";
import RootLayout from "@/src/pages/_layout.tsx";

export default async function HomePage() {
  const data = await getData();

  return (
    <RootLayout>
      <title>{data.title}</title>
      <h1 className="text-4xl font-bold tracking-tight">{data.headline}</h1>
      <p>{data.body}</p>
      <LikeButton />
      <a href="/about" className="mt-4 inline-block underline">
        About page
      </a>
    </RootLayout>
  );
}

const getData = async () => {
  const data = {
    title: "bureaudouble/rsc-engine",
    headline: "bureaudouble/rsc-engine",
    body: "Hello world!",
  };

  return data;
};
