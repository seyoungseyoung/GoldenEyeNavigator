import BlogPostCard from '@/components/blog-post-card';
import { blogPostsData } from '@/data/blog-posts';

export default function BlogPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">My Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPostsData.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
      {blogPostsData.length === 0 && (
        <p className="text-center text-muted-foreground">No blog posts yet. Check back soon!</p>
      )}
    </div>
  );
}
