import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useBookManifest, useBookProgress, useChapter } from '../../hooks/useLibrary';
import { fetchLibraryIndex } from '../../services/library/libraryService';

function renderMarkdown(md: string): string {
  return md
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr />')
    .split(/\n{2,}/)
    .map((block) => {
      const value = block.trim();
      if (!value) return '';
      if (value.startsWith('<h') || value.startsWith('<blockquote') || value.startsWith('<hr')) return value;
      return `<p>${value.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');
}

export function ChapterReaderPage() {
  const params = useParams<{ bookId: string; chapterId: string }>();
  const { bookId, chapterId } = params;
  const [, navigate] = useLocation();
  const [bookPath, setBookPath] = useState<string | undefined>();

  useEffect(() => {
    if (!bookId) return;
    fetchLibraryIndex().then((index) => {
      const entry = index.books.find((item) => item.bookId === bookId);
      if (entry) setBookPath(entry.path);
    });
  }, [bookId]);

  const { manifest, loading: manifestLoading } = useBookManifest(bookPath);
  const { progress, markRead } = useBookProgress(bookId);
  const chapterMeta = manifest?.chapters.find((item) => item.chapterId === chapterId);
  const { chapter, loading: chapterLoading } = useChapter(bookPath, chapterMeta?.file);

  const bottomRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef(false);

  useEffect(() => {
    markedRef.current = false;
  }, [chapterId]);

  useEffect(() => {
    if (!bottomRef.current || !chapterId || !bookId) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !markedRef.current) {
          markedRef.current = true;
          markRead(chapterId);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [bookId, chapterId, markRead]);

  const loading = manifestLoading || chapterLoading || !bookPath;

  if (loading) {
    return (
      <div className="lib-state lib-state--full">
        <div className="lib-spinner" />
        <p>Carregando leitura…</p>
      </div>
    );
  }

  if (!manifest || !chapterMeta || !chapter) {
    return (
      <div className="lib-state lib-state--error lib-state--full">
        <p>Capítulo não encontrado.</p>
        <button className="lib-btn-ghost" onClick={() => navigate(`/library/${bookId}`)}>Voltar ao livro</button>
      </div>
    );
  }

  const currentIndex = manifest.chapters.findIndex((item) => item.chapterId === chapterId);
  const prevChapter = currentIndex > 0 ? manifest.chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < manifest.chapters.length - 1 ? manifest.chapters[currentIndex + 1] : null;
  const isRead = progress?.readChapters.includes(chapterId) ?? false;
  const html = renderMarkdown(chapter.markdown);

  return (
    <div className="zoe-reader">
      <header className="zoe-reader__topbar">
        <button className="zoe-back-link" onClick={() => navigate(`/library/${bookId}`)}>
          ← {manifest.meta.title}
        </button>
        <div className="zoe-reader__topbar-info">
          <span>Capítulo {chapterMeta.order} de {manifest.readingInfo.totalChapters}</span>
          {isRead && <span className="zoe-reader__read-badge">Lido</span>}
        </div>
      </header>

      <div className="zoe-reader__layout">
        <aside className="zoe-reader__rail">
          <div className="zoe-panel">
            <span className="zoe-kicker">Navegação</span>
            <h3>Sumário</h3>
            <div className="zoe-reader__chapter-nav">
              {manifest.chapters.map((item) => (
                <button
                  key={item.chapterId}
                  className={`zoe-reader__chapter-link${item.chapterId === chapterId ? ' zoe-reader__chapter-link--active' : ''}`}
                  onClick={() => navigate(`/library/${bookId}/chapter/${item.chapterId}`)}
                >
                  <span>{item.order}</span>
                  <strong>{item.title}</strong>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="zoe-reader__main">
          <article className="zoe-reader__article">
            <header className="zoe-reader__article-header">
              <span className="zoe-kicker">{manifest.meta.author.name}</span>
              <h1>{chapterMeta.title}</h1>
              <p>{chapterMeta.estimatedMinutes} min de leitura</p>
            </header>

            <div className="zoe-reader__content" dangerouslySetInnerHTML={{ __html: html }} />
            <div ref={bottomRef} />
          </article>

          <nav className="zoe-reader__footer-nav">
            {prevChapter ? (
              <button className="zoe-secondary-btn" onClick={() => navigate(`/library/${bookId}/chapter/${prevChapter.chapterId}`)}>
                ← {prevChapter.title}
              </button>
            ) : <div />}

            {nextChapter ? (
              <button className="zoe-primary-btn" onClick={() => navigate(`/library/${bookId}/chapter/${nextChapter.chapterId}`)}>
                {nextChapter.title} →
              </button>
            ) : (
              <button className="zoe-primary-btn" onClick={() => navigate(`/library/${bookId}`)}>
                Concluir leitura
              </button>
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}
