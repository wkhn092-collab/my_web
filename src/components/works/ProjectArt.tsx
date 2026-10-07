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
      className="project-art absolute inset-0 [container-type:size] transition-transform duration-[1200ms] ease-[var(--ease-out)] group-hover:scale-[1.04] motion-reduce:transition-none"
      style={{ '--tint': tintFor(project.slug) } as CSSProperties}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgb(255_255_255)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255)_1px,transparent_1px)] [background-size:56px_56px]" />
      {/* Sized to the tile itself, so the letter is always whole and centred, on every card size. */}
      <span className="absolute inset-0 flex items-center justify-center pb-[12cqh]">
        <span className="project-initial text-gilded font-display font-light leading-none opacity-85 [font-size:min(52cqh,46cqw)]">{initial}</span>
      </span>
      <span className="absolute inset-x-6 bottom-5 text-center font-display text-[clamp(1.25rem,7cqw,1.9rem)] leading-tight text-pearl/90">{project.title}</span>
    </div>
  );
}
