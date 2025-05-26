export interface Project {
  id: string;
  name: string;
  initialDescription: string;
  imageUrl: string;
  dataAiHint: string;
  targetAudience: string;
  projectStyle: string;
  liveLink?: string;
  repoLink?: string;
  tags: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  dataAiHint: string;
  snippet: string;
  tags: string[];
  slug: string; // For routing to full blog post
}
