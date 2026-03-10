import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sanitizeMarkdown, type MarkdownViewMode } from "../services/content/markdownSanitizer";

// ─── Tipos de seção ────────────────────────────────────────────────────────
type SectionKind =
  | "verseBase"
  | "objectives"
  | "exposition"
  | "controversy"
  | "application"
  | "reflection"
  | "devotional"
  | "generic";

interface Section {
  kind: SectionKind;
  heading: string;
  body: string;
}

function classifySection(heading: string): SectionKind {
  const h = heading.toLowerCase();
  if (h.includes("texto base") || h.includes("base")) return "verseBase";
  if (h.includes("objetivo")) return "objectives";
  if (h.includes("exposi") || h.includes("teológ") || h.includes("teolog")) return "exposition";
  if (h.includes("controv") || h.includes("desvio")) return "controversy";
  if (h.includes("aplica")) return "application";
  if (h.includes("reflex") || h.includes("discuss") || h.includes("pergunta")) return "reflection";
  if (h.includes("devocional")) return "devotional";
  return "generic";
}

function splitIntoSections(md: string): Section[] {
  const lines = md.split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;
  let bodyLines: string[] = [];

  for (const line of lines) {
    const h2 = line.match(/^## (.+)/);
    if (h2) {
      if (current) { current.body = bodyLines.join("\n").trim(); sections.push(current); }
      current = { kind: classifySection(h2[1]), heading: h2[1], body: "" };
      bodyLines = [];
    } else {
      bodyLines.push(line);
    }
  }
  if (current) { current.body = bodyLines.join("\n").trim(); sections.push(current); }
  return sections;
}

// ─── Visual por tipo ───────────────────────────────────────────────────────
const SECTION_META: Record<SectionKind, { icon: string; accentColor: string }> = {
  verseBase:   { icon: "📖", accentColor: "#c9a227" },
  objectives:  { icon: "🎯", accentColor: "var(--accent)" },
  exposition:  { icon: "📚", accentColor: "var(--text)" },
  controversy: { icon: "⚡", accentColor: "#f59e0b" },
  application: { icon: "✅", accentColor: "var(--success)" },
  reflection:  { icon: "💬", accentColor: "#60a5fa" },
  devotional:  { icon: "🕊️", accentColor: "var(--accent)" },
  generic:     { icon: "·",  accentColor: "var(--muted)" },
};

// ─── Índice de navegação ───────────────────────────────────────────────────
function LessonIndex({ sections }: { sections: Section[] }) {
  if (sections.length < 3) return null;

  function scrollTo(idx: number) {
    const els = document.querySelectorAll<HTMLElement>(".lessonSection");
    const el = els[idx];
    if (!el) return;
    // Offset pelo header fixo
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div className="lessonIndex">
      <div className="lessonIndexTitle">Nesta aula</div>
      <div className="lessonIndexList">
        {sections.map((s, i) => (
          <button
            key={i}
            className="lessonIndexItem"
            type="button"
            onClick={() => scrollTo(i)}
          >
            <span className="lessonIndexIcon">{SECTION_META[s.kind].icon}</span>
            <span className="lessonIndexLabel">{s.heading}</span>
            <span className="lessonIndexArrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Card de seção ─────────────────────────────────────────────────────────
function SectionCard({ section, index }: { section: Section; index: number }) {
  const meta = SECTION_META[section.kind];

  return (
    <div
      className={`lessonSection lessonSection--${section.kind}`}
      data-kind={section.kind}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className="lessonSectionHeader">
        <span className="lessonSectionIcon">{meta.icon}</span>
        <h2
          className="lessonSectionTitle"
          style={{ color: meta.accentColor }}
        >
          {section.heading}
        </h2>
      </div>

      <div className="prose lessonSectionBody">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {section.body}
        </ReactMarkdown>
      </div>
    </div>
  );
}

// ─── Exportado ─────────────────────────────────────────────────────────────
export function MarkdownRenderer({
  markdown,
  mode = "student",
}: {
  markdown: string;
  mode?: MarkdownViewMode;
}) {
  const safe = sanitizeMarkdown(markdown, mode);
  // Remove h1 do topo (já exibido no header da página)
  const withoutH1 = safe.replace(/^# .+\n?/, "").trim();
  const sections = splitIntoSections(withoutH1);

  if (sections.length === 0) {
    return (
      <div className="prose" style={{ padding: "4px 0" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{withoutH1}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="lessonContent">
      <LessonIndex sections={sections} />
      {sections.map((s, i) => (
        <SectionCard key={i} section={s} index={i} />
      ))}
    </div>
  );
}
