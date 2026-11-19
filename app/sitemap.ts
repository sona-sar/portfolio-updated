import { blogBuddySitemap } from "@blogbuddy/sdk/server";
import { blog } from "@/lib/blogbuddy";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default blogBuddySitemap(blog, {
  extra: [
    {
      url: `${siteUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ],
});
