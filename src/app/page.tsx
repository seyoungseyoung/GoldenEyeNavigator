import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Download, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <section className="mb-12 text-center">
        <Image
          src="https://placehold.co/150x150.png"
          alt="Your Name"
          width={150}
          height={150}
          data-ai-hint="profile picture"
          className="rounded-full mx-auto mb-6 shadow-lg"
        />
        <h1 className="text-4xl font-bold mb-2 text-primary">Jane Doe</h1>
        <p className="text-xl text-muted-foreground mb-6">Full-Stack Developer & UI/UX Enthusiast</p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/contact">
              Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="/placeholder-resume.pdf" download>
              Download CV <Download className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      <section className="mb-12">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg space-y-4">
              <p>
                Hello! I&apos;m Jane, a passionate Full-Stack Developer with a keen eye for design and user experience.
                I specialize in creating modern, responsive, and user-friendly web applications.
                With a background in computer science and several years of hands-on experience, I&apos;ve honed my skills in
                various technologies including Next.js, React, Node.js, and Python.
              </p>
              <p>
                My journey in tech is driven by a constant curiosity and a desire to solve real-world problems
                through elegant and efficient code. I believe in lifelong learning and am always excited to explore
                new tools and frameworks. When I&apos;m not coding, you can find me exploring the outdoors, reading about
                the latest tech trends, or contributing to open-source projects.
              </p>
              <p>
                This portfolio showcases some of my recent work and ongoing projects. Feel free to explore and
                reach out if you&apos;d like to collaborate or learn more about my experience!
              </p>
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6 text-center text-primary">My Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'HTML/CSS', 'Tailwind CSS', 'Firebase', 'SQL', 'NoSQL', 'Git'].map((skill) => (
            <Card key={skill} className="text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardTitle className="text-lg">{skill}</CardTitle>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
