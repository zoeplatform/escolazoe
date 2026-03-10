import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useLibraryBooks } from '../../hooks/useLibrary';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../../services/library/libraryService';
import { getBookProgressPercent, useLibraryProgressSnapshot } from '../../services/library/libraryProgressService';
import type { BookManifest, Category } from '../../services/library/types';
import { BookCover } from '../../ui/BookCover';

const FILTERS: Array<{ value: Category | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'vida-crista', label: 'Vida Cristã' },
  { value: 'teologia', label: 'Teologia' },
  { value: 'biblica', label: 'Bíblica' },
  { value: 'historica', label: 'Histórica' },
  { value: 'apologetica', label: 'Apologética' },
  { value: 'missoes', label: 'Missões' },
];

function getProgress(manifest: BookManifest) {
  return getBookProgressPercent(manifest.bookId, manifest.readingInfo.totalChapters);
}

function BookCard({ manifest, onOpen }: { manifest: BookManifest; onOpen: () => void }) {
  const progress = getProgress(manifest);
  const isStarted = progress > 0;

  return (
    <button className="zoe-book-card" onClick={onOpen} aria-label={`Abrir ${manifest.meta.title}`}>
      <div className="zoe-book-card__visual">
        <BookCover manifest={manifest} size="card" />
      </div>

      <div className="zoe-book-card__body">
        <div className="zoe-book-card__meta-row">
          <span className="zoe-pill zoe-pill--soft">{CATEGORY_LABELS[manifest.classification.category]}</span>
          <span className="zoe-book-card__difficulty">{DIFFICULTY_LABELS[manifest.classification.difficulty]}</span>
        </div>

        <h3 className="zoe-book-card__title">{manifest.meta.title}</h3>
        <p className="zoe-book-card__author">{manifest.meta.author.name}</p>

        <div className="zoe-book-card__stats">
          <span>{manifest.readingInfo.totalChapters} capítulos</span>
          <span>{manifest.readingInfo.totalEstimatedMinutes} min</span>
        </div>

        <div className="zoe-book-card__footer">
          <span className="zoe-book-card__cta">{isStarted ? 'Continuar' : 'Ver livro'}</span>
          {isStarted ? <span className="zoe-book-card__progress">{progress}%</span> : <span className="zoe-book-card__progress">Novo</span>}
        </div>

        <div className="zoe-progress">
          <span style={{ width: `${isStarted ? progress : 6}%` }} />
        </div>
      </div>
    </button>
  );
}

export function LibraryPage() {
  useLibraryProgressSnapshot();
  const { books, loading, error } = useLibraryBooks();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return books.filter((book) => {
      const matchesFilter = activeFilter === 'all' || book.classification.category === activeFilter;
      const matchesSearch =
        !query ||
        book.meta.title.toLowerCase().includes(query) ||
        book.meta.author.name.toLowerCase().includes(query) ||
        book.classification.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [books, search, activeFilter]);

  const featuredBook = filtered[0] ?? books[0] ?? null;
  const totalMinutes = filtered.reduce((sum, book) => sum + book.readingInfo.totalEstimatedMinutes, 0);

  return (
    <div className="zoe-library">
      <section className="zoe-library__hero">
        <div className="zoe-library__hero-copy">
          <span className="zoe-kicker">Escola Zoe</span>
          <h1 className="zoe-library__title">Biblioteca Zoe</h1>
          <p className="zoe-library__subtitle">
            Livros e artigos para apoiar sua jornada de aprendizado e formação cristã.
          </p>

          <div className="zoe-library__actions">
            <label className="zoe-search" aria-label="Buscar na biblioteca">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
                <path d="M20 20l-4.2-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por obra, autor ou tema"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Limpar busca">
                  ×
                </button>
              )}
            </label>
          </div>

          <div className="zoe-library__stats">
            <div className="zoe-stat-card">
              <strong>{books.length}</strong>
              <span>obras disponíveis</span>
            </div>
            <div className="zoe-stat-card">
              <strong>{totalMinutes}</strong>
              <span>minutos em curadoria</span>
            </div>
            <div className="zoe-stat-card">
              <strong>{FILTERS.length - 1}</strong>
              <span>áreas temáticas</span>
            </div>
          </div>
        </div>

        {featuredBook && (
          <div className="zoe-library__hero-panel">
            <div className="zoe-shelf-card">
              <div className="zoe-shelf-card__top">
                <span className="zoe-kicker">Leitura em destaque</span>
                <span className="zoe-shelf-card__badge">Seleção da semana</span>
              </div>
              <div className="zoe-shelf-card__body">
                <BookCover manifest={featuredBook} size="detail" />
                <div className="zoe-shelf-card__content">
                  <h2>{featuredBook.meta.title}</h2>
                  <p>{featuredBook.meta.author.bio}</p>
                  <button className="zoe-primary-btn" onClick={() => navigate(`/library/${featuredBook.bookId}`)}>
                    Ver livro
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="zoe-filters-panel">
        <div className="zoe-filters-panel__header">
          <div>
            <span className="zoe-kicker">Navegação</span>
            <h2>Explore por tema</h2>
          </div>
          <span className="zoe-filters-panel__count">{filtered.length} resultados</span>
        </div>

        <div className="zoe-filter-row" role="tablist" aria-label="Categorias da biblioteca">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              role="tab"
              aria-selected={activeFilter === filter.value}
              className={`zoe-filter-chip${activeFilter === filter.value ? ' zoe-filter-chip--active' : ''}`}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="lib-state">
          <div className="lib-spinner" />
          <p>Carregando biblioteca…</p>
        </div>
      )}

      {error && (
        <div className="lib-state lib-state--error">
          <p>Não foi possível carregar a biblioteca.</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="lib-state">
          <p>Nenhuma obra encontrada para essa busca.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <section className="zoe-shelf">
          <div className="zoe-shelf__header">
            <div>
              <span className="zoe-kicker">Acervo</span>
              <h2>Nossa estante</h2>
            </div>
            <p>Uma seleção organizada para você encontrar a próxima leitura com clareza, ritmo e boa experiência visual.</p>
          </div>

          <div className="zoe-book-grid">
            {filtered.map((book) => (
              <BookCard key={book.bookId} manifest={book} onOpen={() => navigate(`/library/${book.bookId}`)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
