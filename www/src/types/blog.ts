export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  coverImage?: string;
  draft?: boolean;
}
