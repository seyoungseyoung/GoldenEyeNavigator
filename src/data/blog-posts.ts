import type { BlogPost } from '@/types';

export const blogPostsData: BlogPost[] = [
  {
    id: '1',
    title: 'Mastering Next.js: A Deep Dive',
    date: '2024-07-15',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'coding tutorial',
    snippet: 'Explore advanced concepts in Next.js, from server components to edge functions. This post breaks down complex topics into understandable insights.',
    tags: ['Next.js', 'Web Development', 'JavaScript'],
    slug: 'mastering-nextjs-deep-dive'
  },
  {
    id: '2',
    title: 'The Future of AI in Web Design',
    date: '2024-06-28',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'artificial intelligence',
    snippet: 'How AI is revolutionizing the way we design websites, from automated layouts to personalized user experiences.',
    tags: ['AI', 'Web Design', 'UX'],
    slug: 'future-ai-web-design'
  },
  {
    id: '3',
    title: 'A Guide to Effective Remote Collaboration',
    date: '2024-05-10',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'team work',
    snippet: 'Tips and tools for maintaining productivity and fostering teamwork in a remote setting. Based on personal experiences and best practices.',
    tags: ['Remote Work', 'Productivity', 'Teamwork'],
    slug: 'guide-remote-collaboration'
  },
];
