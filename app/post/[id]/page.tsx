import { notFound } from "next/navigation"
import CommentSection from "../../components/CommentSection"
import SocialShare from "../../components/SocialShare"
import { headers } from "next/headers";


export default async function Post({ params }: { params: { id: string } }) {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/posts/${params.id}`, {
    cache: "no-store", // SSR로 최신 데이터 가져오기
  });
  const data = await res.json();

  if (!data.success) return notFound();

  const post = data.post;


  return (
    <article className="prose prose-invert prose-green max-w-none">
      <h1 className="font-pixel">{post.title}</h1>
      <span className="inline-block px-2 py-1 bg-green-600 text-black text-sm font-mono rounded mb-4">
        {post.category}
      </span>
      <div className="font-mono text-lg leading-relaxed">{post.content}</div>
      <SocialShare url={`https://yourdomain.com/post/${post.id}`} title={post.title} />
      <CommentSection />
    </article>
  )
}
