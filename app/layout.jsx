import "./globals.css";

export const metadata = {
  title: "友達リスト",
  description: "Next.js + SQLite で作った友達リスト",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <a href="/" className="brand">
            👥 友達リスト
          </a>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
