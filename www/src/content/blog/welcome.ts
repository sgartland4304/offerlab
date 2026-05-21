import type { BlogPost } from "@/types/blog";

const post: BlogPost = {
  slug: "welcome-to-offerlab",
  title: "Welcome to the OfferLab Blog",
  description:
    "We're building a new home for OfferLab on the web. Here's what to expect.",
  content: `
    <p>We're excited to launch the new OfferLab website. Stay tuned for updates
    on product features, offer strategy guides, and more.</p>
  `,
  publishedAt: "2026-04-03",
  author: "OfferLab Team",
  tags: ["announcement"],
};

export default post;
