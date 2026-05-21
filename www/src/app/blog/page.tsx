import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Blog",
  description: "Latest posts from the OfferLab team.",
};

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <Section>
      <h1 className="mb-12 text-h1 font-bold tracking-tight">Blog</h1>
      <div className="grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-border p-6 transition-colors hover:bg-surface"
          >
            <time className="text-caption text-muted">{post.publishedAt}</time>
            <h2 className="mt-2 text-h3 font-semibold group-hover:text-brand-600">
              {post.title}
            </h2>
            <p className="mt-2 text-body text-muted">{post.description}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
