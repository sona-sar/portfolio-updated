import { Suspense } from "react";
import BlogNav from "../blog-nav";
import { notFound } from "next/navigation";
import {
  BlogBuddyPost,
  blogBuddyMetadata,
  blogBuddyStaticParams,
} from "@blogbuddy/sdk/server";
import { blog } from "@/lib/blogbuddy";

const metadata = blogBuddyMetadata(blog);
const staticParams = blogBuddyStaticParams(blog);

export async function generateMetadata(props: PageProps<"/blog/[slug]">) {
  "use cache";
  return metadata(props);
}

// With Cache Components, this must return at least one param. If there are no posts yet,
// a placeholder keeps the build going; it 404s like any unknown slug.
export async function generateStaticParams() {
  const params = await staticParams().catch(() => []);
  return params.length ? params : [{ slug: "__placeholder__" }];
}

async function Post({ slug }: { slug: string }) {
  "use cache";
  return <BlogBuddyPost {...blog} slug={slug} onNotFound={notFound} />;
}

async function PostForSlug({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  return <Post slug={slug} />;
}

export default function Page(props: PageProps<"/blog/[slug]">) {
  return (
    <>
      <BlogNav allPosts />
      <Suspense fallback={<p className="hand">flipping pages…</p>}>
        <PostForSlug {...props} />
      </Suspense>
    </>
  );
}
