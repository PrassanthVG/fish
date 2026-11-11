import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="logo">
          <span>📡</span> Signal/Noise
        </Link>
        <nav className="main-nav">
          <Link href="/">Home</Link>
          <Link href="/blog">Articles</Link>
          <Link href="/privacy">Privacy &amp; analytics</Link>
          <Link href="/admin/login">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
