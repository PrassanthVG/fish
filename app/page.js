import Link from "next/link";
import { posts, getAllCategories, getAllTags } from "../lib/posts";

export default function Home() {
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <div className="container">
      <section className="hero">
        <h1>Notes on building software that actually ships.</h1>
        <p>
          Short, practical write-ups on the parts of engineering that don't
          fit in a tutorial — debugging, systems thinking, and the process
          changes that make teams faster.
        </p>
      </section>

      <div className="page-layout">
        <main className="post-grid">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="post-card">
              <div className="post-meta">
                {post.category} · {new Date(post.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {post.readTime}
              </div>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
            </Link>
          ))}
        </main>

        <aside>
          <div className="sidebar-section">
            <h3>About</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>
              Signal/Noise is a small, independent demo blog used to show
              transparent, consent-based visitor analytics end to end — see{" "}
              <Link href="/privacy">what's recorded</Link>.
            </p>
          </div>

          <div className="sidebar-section">
            <h3>Categories</h3>
            <ul className="sidebar-list">
              {categories.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>Tags</h3>
            <div>
              {tags.map((t) => (
                <span key={t} className="tag-pill">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
