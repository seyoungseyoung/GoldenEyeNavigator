'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { generateProjectIntro, type GenerateProjectIntroInput } from '@/ai/flows/generate-project-intro';
import type { Project } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Wand2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const formSchema = z.object({
  projectName: z.string().min(1, 'Project name is required.'),
  projectDescription: z.string().min(10, 'Project description must be at least 10 characters.'),
  targetAudience: z.string().min(1, 'Target audience is required.'),
  projectStyle: z.string().min(1, 'Project style is required.'),
});

type ProjectIntroFormValues = z.infer<typeof formSchema>;

interface ProjectIntroGeneratorProps {
  project: Project;
  onIntroGenerated: (intro: string) => void;
}

export default function ProjectIntroGenerator({ project, onIntroGenerated }: ProjectIntroGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProjectIntroFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: project.name,
      projectDescription: project.initialDescription,
      targetAudience: project.targetAudience,
      projectStyle: project.projectStyle,
    },
  });

  const onSubmit: SubmitHandler<ProjectIntroFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const result = await generateProjectIntro(data);
      onIntroGenerated(result.introduction);
      toast({
        title: 'Introduction Generated!',
        description: 'The AI has crafted a new introduction for your project.',
      });
    } catch (error) {
      console.error('Failed to generate introduction:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate introduction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full mt-4">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <Button variant="outline" size="sm" className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? 'Generating...' : 'Generate AI Introduction'}
          </Button>
        </AccordionTrigger>
        <AccordionContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2 p-1">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Tech recruiters, potential clients" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Style</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Professional, innovative, concise" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Generating...' : 'Generate'}
              </Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
