import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useBookManifest, useBookProgress } from '../../hooks/useLibrary';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, fetchLibraryIndex } from '../../services/library/libraryService';
import type { ChapterSummary } from '../../services/library/types';
import { BookCover } from '../../ui/BookCover';

export function BookPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const [, navigate] = useLocation();
  const [bookPath, setBookPath] = useState<string | undefined>();

  useEffect(() => {
    if (!bookId) return;

    fetchLibraryIndex().then((index) => {
      const entry = index.books.find((item) => item.bookId === bookId);
      if (entry) setBookPath(entry.path);
    });
  }, [bookId]);

  const { manifest, loading, error } = useBookManifest(bookPath);
  const { progress } = useBookProgress(bookId);

  const readChapters = progress?.readChapters ?? [];
  const totalChapters = manifest?.readingInfo.totalChapters ?? manifest?.chapters.length ?? 0;
  const progressPercent = totalChapters > 0 ? Math.round((readChapters.length / totalChapters) * 100) : 0;

  const nextChapter = useMemo(() => {
    if (!manifest?.chapters?.length) return undefined;
    return manifest.chapters.find((chapter) => !readChapters.includes(chapter.chapterId)) ?? manifest.chapters[0];
  }, [manifest, readChapters]);

  const translationLabel = manifest?.meta.translation?.translatedBy?.trim() || 'Escola Zoe';
  const authorBio = manifest?.meta.author.bio?.trim() || 'Leitura selecionada para apoiar sua formação cristã.';
  const featuredQuoteText = manifest?.featuredQuote?.text?.trim() || manifest?.meta.subtitle?.trim() || authorBio;
  const tags = manifest?.classification.tags ?? [];

  function openChapter(chapter: ChapterSummary) {
    navigate(`/library/${bookId}/chapter/${chapter.chapterId}`);
  }

  if (loading || !bookPath) {
    return (
      <div className="lib-state lib-state--full">
        <div className="lib-spinner" />
        <p>Carregando obra…</p>
      </div>
    );
  }

  if (error || !manifest) {
    return (
      <div className="lib-state lib-state--error lib-state--full">
        <p>Não foi possível abrir esta obra.</p>
        <button className="lib-btn-ghost" onClick={() => navigate('/library')}>Voltar para a biblioteca</button>
      </div>
    );
  }

  return (
    <div className="zoe-book-page">
      <section className="zoe-book-hero">
        <button className="zoe-back-link" onClick={() => navigate('/library')}>
          ← Voltar para a biblioteca
        </button>

        <div className="zoe-book-hero__grid">
          <div className="zoe-book-hero__cover">
            <BookCover manifest={manifest} size="detail" />
          </div>

          <div className="zoe-book-hero__content">
            <div className="zoe-book-hero__tags">
              <span className="zoe-pill">{CATEGORY_LABELS[manifest.classification.category]}</span>
              <span className="zoe-pill">{DIFFICULTY_LABELS[manifest.classification.difficulty]}</span>
            </div>

            <h1>{manifest.meta.title}</h1>
            {manifest.meta.subtitle && <p className="zoe-book-hero__subtitle">{manifest.meta.subtitle}</p>}
            <p className="zoe-book-hero__author">{manifest.meta.author.name} · edição curada pela Escola Zoe</p>
            <p className="zoe-book-hero__description">{authorBio}</p>

            <div className="zoe-book-hero__metrics">
              <div><strong>{totalChapters}</strong><span>capítulos</span></div>
              <div><strong>{manifest.readingInfo.totalEstimatedMinutes}</strong><span>min de leitura</span></div>
              <div><strong>{progressPercent}%</strong><span>progresso</span></div>
            </div>

            <div className="zoe-book-hero__actions">
              <button className="zoe-primary-btn" onClick={() => nextChapter && openChapter(nextChapter)}>
                {progressPercent > 0 ? 'Continuar leitura' : 'Começar leitura'}
              </button>
              <button className="zoe-secondary-btn" onClick={() => navigate('/library')}>
                Ver outras obras
              </button>
            </div>

            <div className="zoe-progress zoe-progress--wide">
              <span style={{ width: `${progressPercent || 4}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="zoe-book-layout">
        <aside className="zoe-book-sidebar">
          <div className="zoe-panel">
            <span className="zoe-kicker">Edição</span>
            <h3>Detalhes da obra</h3>
            <ul className="zoe-meta-list">
              <li><span>Título original</span><strong>{manifest.meta.originalTitle}</strong></li>
              <li><span>Publicação</span><strong>{manifest.meta.originalPublishedYear}</strong></li>
              <li><span>Ritmo sugerido</span><strong>{manifest.readingInfo.recommendedPace}</strong></li>
              <li><span>Tradução</span><strong>{translationLabel}</strong></li>
            </ul>
          </div>

          <div className="zoe-panel">
            <span className="zoe-kicker">Citação</span>
            <blockquote className="zoe-quote-card">
              <p>“{featuredQuoteText}”</p>
              <cite>{manifest.meta.author.name}</cite>
            </blockquote>
          </div>
        </aside>

        <main className="zoe-book-main">
          <div className="zoe-panel">
            <div className="zoe-panel__header">
              <div>
                <span className="zoe-kicker">Leitura</span>
                <h2>Capítulos</h2>
              </div>
              <span className="zoe-panel__badge">{manifest.chapters.length} capítulos</span>
            </div>

            <div className="zoe-chapter-list">
              {manifest.chapters.map((chapter) => {
                const isRead = readChapters.includes(chapter.chapterId);
                const isLast = progress?.lastReadChapterId === chapter.chapterId;
                return (
                  <button
                    key={chapter.chapterId}
                    className={`zoe-chapter-card${isRead ? ' zoe-chapter-card--read' : ''}${isLast ? ' zoe-chapter-card--current' : ''}`}
                    onClick={() => openChapter(chapter)}
                  >
                    <div className="zoe-chapter-card__number">{isRead ? '✓' : chapter.order}</div>
                    <div className="zoe-chapter-card__content">
                      <strong>{chapter.title}</strong>
                      <p>{chapter.summary}</p>
                    </div>
                    <div className="zoe-chapter-card__meta">
                      <span>{chapter.estimatedMinutes} min</span>
                      <span>›</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="zoe-panel">
              <span className="zoe-kicker">Temas</span>
              <div className="zoe-tag-cloud">
                {tags.map((tag) => (
                  <span key={tag} className="zoe-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
