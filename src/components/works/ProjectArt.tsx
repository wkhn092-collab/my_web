import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Project } from '@/lib/content/types';

const TINTS = ['#2e7c8a', '#7a2338', '#a8742f', '#3a4f8a', '#9b4f63', '#4f6b4a', '#6b4a8a'];

function tintFor(slug: string) {
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length];
}

/**
 * The project's screenshot, or (until there is one) a typographic tile in the project's own tint.
 * Never a stock or invented image.
 */
export function ProjectArt({ project, sizes, priority = false }: { project: Project; sizes: string; priority?: boolean }) {
  if (project.cover) {
    return (
      <Image
        src={project.cover.url}
        alt={project.cover.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out)] group-hover:scale-[1.04] motion-reduce:transition-none"
        placeholder={project.cover.lqip ? 'blur' : 'empty'}
        blurDataURL={project.cover.lqip}
      />
    );
  }
  const initial = project.title.trim().charAt(0);
  return (
    <div
      className="project-art absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out)] group-hover:scale-[1.04] motion-reduce:transition-none"
      style={{ '--tint': tintFor(project.slug) } as CSSProperties}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgb(255_255_255)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255)_1px,transparent_1px)] [background-size:56px_56px]" />
      <span className="text-gilded absolute -bottom-[0.18em] left-[6%] font-display text-[clamp(10rem,22vw,22rem)] font-light leading-none opacity-80">
        {initial}
      </span>
      <span className="absolute bottom-6 right-6 max-w-[70%] font-display text-2xl text-pearl/90 md:text-3xl">{project.title}</span>
    </div>
  );
}
