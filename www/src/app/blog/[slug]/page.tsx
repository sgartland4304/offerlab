import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { Section } from "@/components/ui/section";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <Section>
      <article className="mx-auto max-w-[var(--container-content)]">
        <time className="text-caption text-muted">{post.publishedAt}</time>
        <h1 className="mt-2 text-h1 font-bold tracking-tight">{post.title}</h1>
        <p className="mt-4 text-body-lg text-muted">{post.description}</p>
        <div
          className="prose mt-12 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </Section>
  );
}
