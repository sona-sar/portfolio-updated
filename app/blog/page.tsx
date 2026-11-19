import { Suspense } from "react";
import BlogNav from "./blog-nav";
import { BlogBuddyList, blogBuddyMetadata } from "@blogbuddy/sdk/server";
import { blog } from "@/lib/blogbuddy";

const metadata = blogBuddyMetadata(blog, { title: "Blog" });

export async function generateMetadata() {
  "use cache";
  return metadata();
}

async function PostList({ page }: { page: number }) {
  "use cache";
  return <BlogBuddyList {...blog} perPage={10} page={page} title="Blog" />;
}

async function PostListForPage({ searchParams }: PageProps<"/blog">) {
  const { page } = await searchParams;
  return <PostList page={Number(page) || 1} />;
}

export default function Page(props: PageProps<"/blog">) {
  return (
    <>
      <BlogNav />
      <p className="blog-mirror hand">
        these posts also live at{" "}
        <a href="https://sonasar.blogbuddy.app" target="_blank" rel="noreferrer">
          sonasar.<span style={{ color: "#54ba4f" }}>blogbuddy</span>.app
        </a>
      </p>
      <Suspense fallback={<p className="hand">flipping pages…</p>}>
        <PostListForPage {...props} />
      </Suspense>
    </>
  );
}
