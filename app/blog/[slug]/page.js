import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPostBySlug } from "../../../lib/posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return { title: `${post.title} — Signal/Noise`, description: post.excerpt };
}

function renderParagraph(text, idx) {
  if (text.startsWith("```")) {
    const code = text.replace(/^```\w*\n?/, "").replace(/```$/, "");
    return (
      <pre key={idx}>
        <code>{code}</code>
      </pre>
    );
  }
  return <p key={idx}>{text}</p>;
}

export default function ArticlePage({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return notFound();

  return (
    <div className="container">
      <div className="article-header">
        <Link href="/" className="back-link">
          ← Back to all articles
        </Link>
        <div className="post-meta">
          {post.category} ·{" "}
          {new Date(post.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          · {post.readTime}
        </div>
        <h1>{post.title}</h1>
      </div>
      <article className="article-body">
        {post.content.map((block, idx) => renderParagraph(block, idx))}
      </article>
    </div>
  );
}
