'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Project } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProjectIntroGenerator from './project-intro-generator';
import { ExternalLink, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [generatedIntro, setGeneratedIntro] = useState<string | null>(null);

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">{project.name}</CardTitle>
      </CardHeader>
      <div className="relative w-full h-48">
        <Image
          src={project.imageUrl}
          alt={project.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={project.dataAiHint}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="flex-grow pt-4">
        <CardDescription className="mb-4 text-sm">
          {generatedIntro || project.initialDescription}
        </CardDescription>
        <div className="mb-4">
          <h4 className="font-semibold text-xs mb-1 text-muted-foreground">TECHNOLOGIES USED:</h4>
          <div className="flex flex-wrap gap-2">
            {project.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>
        <ProjectIntroGenerator project={project} onIntroGenerated={setGeneratedIntro} />
      </CardContent>
      <CardFooter className="flex justify-start gap-2 border-t pt-4">
        {project.liveLink && (
          <Button variant="outline" size="sm" asChild>
            <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
            </a>
          </Button>
        )}
        {project.repoLink && (
          <Button variant="ghost" size="sm" asChild>
            <a href={project.repoLink} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" /> Source Code
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
