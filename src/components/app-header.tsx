import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { LogoIcon } from '@/components/icons';

export function AppHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <LogoIcon className="h-6 w-6" />
            <span className="hidden sm:inline-block">LawFinder AI</span>
          </Link>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://github.com/example/lawfinder-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository">
              <Github className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
