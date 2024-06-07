import { LikeButton } from "@/app/components/like-button.tsx";
import RootLayout from "@/app/pages/_layout.tsx";

export default async function HomePage() {
  const data = await getData();

  return (
    <RootLayout>
      <title>{data.title}</title>
      <h1 className="text-4xl font-bold tracking-tight">{data.headline}</h1>
      <p>{data.body}</p>
      <LikeButton initialLikeCount={data.likeCount ?? 0} />
      <a href="/about" className="mt-4 inline-block underline">
        About page
      </a>
    </RootLayout>
  );
}

const kv = await Deno.openKv();
const getData = async () => {
  const likeCount = (await kv.get<number>(["likes"])).value;
  const data = {
    title: "bureaudouble/rsc-engine",
    headline: "bureaudouble/rsc-engine",
    body: "Hello world!",
    likeCount,
  };

  return data;
};
