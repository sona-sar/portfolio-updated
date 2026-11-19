export default function BlogLayout({ children }: LayoutProps<"/blog">) {
  return (
    <main className="blog-page">
      <div className="blog-body">{children}</div>
    </main>
  );
}
