import { notFound } from "next/navigation";
import CommentSection from "../../components/CommentSection";
import SocialShare from "../../components/SocialShare";
import { headers } from "next/headers";
import CodeBlock from "@/app/components/CodeBlock";

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
      {/* 코드 블럭 */}
      {/* 코드 길이가 2 이상이면, 코드 블럭 보여주기 */}
      {post.code.length > 1 && (
        <div className="my-6">
          {/* <h3 className="font-pixel text-lg mb-3">Code Example</h3> */}
          <CodeBlock code={post.code} />
        </div>
      )}
      <SocialShare url={`${baseUrl}/post/${post.id}`} title={post.title} />
      <CommentSection />
    </article>
  );
}
