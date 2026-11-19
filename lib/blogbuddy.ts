import type { BlogBuddyConfig } from "@blogbuddy/sdk/server";

export const blog: BlogBuddyConfig = {
  blog: "portfolio",
  apiKey: process.env.BLOGBUDDY_API_KEY!,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  postUrlTemplate: "/blog/{slug}",
  siteName: "Sona Sargsyan",
};
