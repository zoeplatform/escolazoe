// ─── Library Types ────────────────────────────────────────────────────────────

export type BookStatus = 'draft' | 'review' | 'published' | 'archived';
export type Difficulty = 'introductory' | 'intermediate' | 'advanced';
export type Relevance = 'high' | 'medium' | 'low';
export type Category =
  | 'vida-crista'
  | 'teologia'
  | 'biblica'
  | 'historica'
  | 'apologetica'
  | 'missoes';

export interface BookAuthor {
  name: string;
  born: number;
  died: number;
  bio: string;
}

export interface BookTranslation {
  type: 'escola-zoe-original';
  translatedBy: string;
  translationYear: number;
  note: string;
}

export interface BookMeta {
  title: string;
  subtitle?: string;
  originalTitle: string;
  author: BookAuthor;
  originalPublishedYear: number;
  domainPublicConfirmed: boolean;
  domainPublicNote: string;
  translation: BookTranslation;
}

export interface BookClassification {
  category: Category;
  subcategory: string;
  tags: string[];
  difficulty: Difficulty;
  audience: string[];
  readingLevel: string;
}

export interface CurriculumLink {
  courseId: string;
  moduleId: string;
  lessonId: string;
  relevance: Relevance;
  note: string;
}

export interface ReadingInfo {
  totalChapters: number;
  totalEstimatedMinutes: number;
  recommendedPace: string;
}

export interface ChapterSummary {
  chapterId: string;
  order: number;
  title: string;
  file: string;
  estimatedMinutes: number;
  summary: string;
}

export interface FeaturedQuote {
  text: string;
  chapterId: string;
}

export interface BookManifest {
  bookId: string;
  type: 'library-book';
  version: string;
  updatedAt: string;
  status: BookStatus;
  meta: BookMeta;
  classification: BookClassification;
  curriculumLinks: CurriculumLink[];
  readingInfo: ReadingInfo;
  chapters: ChapterSummary[];
  featuredQuote: FeaturedQuote;
}

export interface LibraryIndexEntry {
  bookId: string;
  path: string;
  status: BookStatus;
}

export interface LibraryIndex {
  version: string;
  updatedAt: string;
  featuredBookId?: string;
  books: LibraryIndexEntry[];
}

// Chapter frontmatter parsed from MD
export interface ChapterFrontmatter {
  chapterId: string;
  bookId: string;
  order: number;
  title: string;
  estimatedMinutes: number;
  tags: string[];
}

export interface ChapterContent {
  frontmatter: ChapterFrontmatter;
  markdown: string;
}

// Reading progress persisted per user in Firestore
export interface BookProgress {
  bookId: string;
  readChapters: string[]; // chapterIds
  lastReadChapterId?: string;
  startedAt: string;
  lastReadAt: string;
}
