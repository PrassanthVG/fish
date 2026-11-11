export default function Footer() {
  return (
    <footer className="site-footer container">
      <span>© {new Date().getFullYear()} Signal/Noise — an independent demo blog.</span>
      <span>
        <a href="/privacy">Privacy &amp; analytics disclosure</a>
      </span>
    </footer>
  );
}
