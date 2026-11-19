import Link from "next/link";

export default function BlogNav({ allPosts = false }: { allPosts?: boolean }) {
  return (
    <nav className="blog-nav hand">
      <Link href="/">← back to my notebook</Link>
      {allPosts && <Link href="/blog">all posts</Link>}
    </nav>
  );
}
