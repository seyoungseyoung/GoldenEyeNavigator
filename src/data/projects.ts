import type { Project } from '@/types';

export const projectsData: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    initialDescription: 'A full-featured e-commerce platform with Next.js, Stripe integration, and a custom CMS for managing products.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'online store',
    targetAudience: 'Small to medium-sized businesses',
    projectStyle: 'Professional and scalable',
    liveLink: '#',
    repoLink: '#',
    tags: ['Next.js', 'Stripe', 'E-commerce', 'CMS']
  },
  {
    id: '2',
    name: 'Task Management App',
    initialDescription: 'A collaborative task management application with real-time updates, user authentication, and a drag-and-drop interface.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'productivity tool',
    targetAudience: 'Teams and individuals',
    projectStyle: 'Modern and intuitive',
    liveLink: '#',
    tags: ['React', 'Firebase', 'Productivity', 'Collaboration']
  },
  {
    id: '3',
    name: 'Personal Blog Engine',
    initialDescription: 'A lightweight and fast blog engine built with Astro and Markdown, focusing on performance and SEO.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'writing platform',
    targetAudience: 'Developers and writers',
    projectStyle: 'Minimalist and performant',
    repoLink: '#',
    tags: ['Astro', 'Markdown', 'Blog', 'SEO']
  },
  {
    id: '4',
    name: 'AI Powered Recipe Generator',
    initialDescription: 'An innovative web app that uses AI to generate unique recipes based on user-provided ingredients and dietary preferences.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'food technology',
    targetAudience: 'Home cooks and food enthusiasts',
    projectStyle: 'Creative and user-friendly',
    liveLink: '#',
    repoLink: '#',
    tags: ['Python', 'Flask', 'AI', 'Next.js']
  },
];
