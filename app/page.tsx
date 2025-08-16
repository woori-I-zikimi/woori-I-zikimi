// app/page.tsx (Server Component)
import { sql } from "@vercel/postgres";
import HomeClient from "./HomeClient";
import { isValidCategory } from "@/lib/category";

export const revalidate = 0;

type DBRow = {
  id: string;
  title: string | null;
  content: string | null;
  category: string | null;
  createdat: string;
  likecount: number;
  commentcount: number;
};

export default async function Page() {
  const { rows } = await sql<DBRow>`
    SELECT
      p.id,
      p.title,
      p.content,
      p.category,
      p.createdat,
      COALESCE(pl.cnt, 0)::int  AS likecount,
      COALESCE(cm.cnt, 0)::int  AS commentcount
    FROM public.post p
    LEFT JOIN (
      SELECT postid, COUNT(*) AS cnt
      FROM public.postlikes
      GROUP BY postid
    ) pl ON pl.postid = p.id
    LEFT JOIN (
      SELECT postid, COUNT(*) AS cnt
      FROM public.comments
      GROUP BY postid
    ) cm ON cm.postid = p.id
    ORDER BY p.createdat DESC
  `;

  const posts = rows.map((r) => ({
    id: r.id,
    category: isValidCategory(r.category) ? r.category : "기타",
    title: r.title ?? "(제목 없음)",
    content: r.content ?? "",
    likes: r.likecount,
    comments: r.commentcount,
    createdAt: r.createdat,
  }));

  return <HomeClient initialPosts={posts} />;
}
