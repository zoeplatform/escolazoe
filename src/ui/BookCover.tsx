import type { BookManifest } from '../services/library/types';

const CATEGORY_ART: Record<string, JSX.Element> = {
  'vida-crista': (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <rect x="35" y="12" width="10" height="56" rx="3" fill="currentColor" />
      <rect x="18" y="35" width="44" height="10" rx="3" fill="currentColor" />
    </svg>
  ),
  teologia: (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <path d="M40 10 66 56H14L40 10Z" stroke="currentColor" strokeWidth="4" />
      <circle cx="40" cy="42" r="9" stroke="currentColor" strokeWidth="3" />
    </svg>
  ),
  biblica: (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <rect x="18" y="12" width="44" height="56" rx="4" stroke="currentColor" strokeWidth="4" />
      <line x1="18" y1="28" x2="62" y2="28" stroke="currentColor" strokeWidth="3" />
      <line x1="28" y1="42" x2="52" y2="42" stroke="currentColor" strokeWidth="3" />
      <line x1="28" y1="52" x2="50" y2="52" stroke="currentColor" strokeWidth="3" />
    </svg>
  ),
  historica: (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <path d="M40 12 62 24V62H18V24L40 12Z" stroke="currentColor" strokeWidth="4" />
      <line x1="28" y1="62" x2="28" y2="34" stroke="currentColor" strokeWidth="3" />
      <line x1="52" y1="62" x2="52" y2="34" stroke="currentColor" strokeWidth="3" />
      <line x1="18" y1="34" x2="62" y2="34" stroke="currentColor" strokeWidth="3" />
    </svg>
  ),
  apologetica: (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <path d="M40 10 62 20v22c0 14-8 22-22 28-14-6-22-14-22-28V20L40 10Z" stroke="currentColor" strokeWidth="4" />
      <line x1="40" y1="30" x2="40" y2="48" stroke="currentColor" strokeWidth="3" />
      <line x1="31" y1="39" x2="49" y2="39" stroke="currentColor" strokeWidth="3" />
    </svg>
  ),
  missoes: (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="25" stroke="currentColor" strokeWidth="4" />
      <ellipse cx="40" cy="40" rx="12" ry="25" stroke="currentColor" strokeWidth="3" />
      <line x1="15" y1="40" x2="65" y2="40" stroke="currentColor" strokeWidth="3" />
      <line x1="40" y1="15" x2="40" y2="65" stroke="currentColor" strokeWidth="3" />
    </svg>
  ),
};

export function BookCover({ manifest, size = 'card' }: { manifest: BookManifest; size?: 'card' | 'detail' }) {
  const coverImage = (manifest as any).meta.coverImage as string | undefined;
  const category = manifest.classification.category;
  const art = CATEGORY_ART[category] ?? CATEGORY_ART['vida-crista'];

  return (
    <div className={`zoe-cover zoe-cover--${size}`} data-category={category}>
      {coverImage ? (
        <img src={coverImage} alt={manifest.meta.title} className="zoe-cover__image" />
      ) : (
        <>
          <div className="zoe-cover__mesh" />
          <div className="zoe-cover__art">{art}</div>
          <div className="zoe-cover__content">
            <span className="zoe-cover__label">Escola Zoe</span>
            <h3 className="zoe-cover__title">{manifest.meta.title}</h3>
            <p className="zoe-cover__author">{manifest.meta.author.name}</p>
          </div>
        </>
      )}
    </div>
  );
}
