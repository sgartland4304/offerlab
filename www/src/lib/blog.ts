import type { BlogPost } from "@/types/blog";
import fs from "fs";
import path from "path";

/**
 * Blog content store.
 *
 * Posts live in src/content/blog/ as individual .ts files, each
 * default-exporting a BlogPost object. This keeps everything in
 * the repo, version-controlled, and trivially editable via Claude.
 *
 * No CMS, no MDX pipeline — just TypeScript data files.
 */

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export async function getAllPosts(): Promise<BlogPost[]> {
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".ts") && !f.startsWith("_"));

  const posts: BlogPost[] = [];

  for (const file of files) {
    const mod = await import(`@/content/blog/${file.replace(".ts", "")}`);
    const post: BlogPost = mod.default;
    if (!post.draft) {
      posts.push(post);
    }
  }

  posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return posts;
}

export async function getPostBySlug(
  slug: string
): Promise<BlogPost | undefined> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}
