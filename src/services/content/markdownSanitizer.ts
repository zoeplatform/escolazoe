
/**
 * Markdown Sanitizer (Block B)
 * Goal: hide internal/instructional notes from students while preserving the lesson content.
 *
 * Supported internal markers:
 * - YAML frontmatter (top of file)
 * - HTML comments: <!-- ... -->
 * - Comment-style lines: [//]: # (...)
 * - Admonition fences:
 *     :::internal ... :::
 *     :::leader ... :::
 *     :::admin ... :::
 *     :::instrucoes ... :::
 * - Explicit comment markers:
 *     <!-- leader:start --> ... <!-- leader:end -->
 *     <!-- internal:start --> ... <!-- internal:end -->
 *
 * NOTE: We intentionally keep normal code fences by default.
 * We only strip code fences when they look like packaging/config (manifest, pack keys, etc).
 */

const INTERNAL_BLOCK_NAMES = ["internal", "leader", "admin", "instrucoes", "instrucao", "instructions", "system"];

/** remove YAML frontmatter only if it appears at the very top */
function stripFrontmatter(md: string) {
  return md.replace(/^---\n[\s\S]*?\n---\n?/m, "");
}

/** remove blocks between paired HTML comment markers, e.g. <!-- leader:start --> ... <!-- leader:end --> */
function stripMarkedHtmlBlocks(md: string) {
  for (const name of INTERNAL_BLOCK_NAMES) {
    const reBlock = new RegExp(
      `<!--\\s*${name}\\s*:\\s*start\\s*-->[\\s\\S]*?<!--\\s*${name}\\s*:\\s*end\\s*-->`,
      "gi"
    );
    md = md.replace(reBlock, "");
  }
  return md;
}

/** remove any remaining HTML comments */
function stripAllHtmlComments(md: string) {
  return md.replace(/<!--[\s\S]*?-->/g, "");
}

/** remove markdown comment lines like: [//]: # (comment) */
function stripMdCommentLines(md: string) {
  return md.replace(/^\[\/\/\]:\s*#\s*\(.+?\)\s*$/gim, "");
}

/** remove :::internal ... ::: style blocks */
function stripAdmonitionBlocks(md: string) {
  // generic fence: :::name ... :::
  // we only remove if name matches INTERNAL_BLOCK_NAMES (case-insensitive)
  const reFence = /^:::\s*([A-Za-z0-9_-]+)\s*\n([\s\S]*?)\n:::\s*$/gim;

  return md.replace(reFence, (full, name) => {
    const n = String(name || "").toLowerCase();
    if (INTERNAL_BLOCK_NAMES.includes(n)) return "";
    return full;
  });
}

/** strip "instruction sections" that commonly appear in AI outputs */
function stripInstructionHeadings(md: string) {
  // Remove headings like "## Instruções", "### Instructions for AI", etc. up to next heading of same or higher level.
  const re = /^(#{2,4})\s*(instru(ç|c)ões|instructions?|notas internas|internal notes|para a ia|for ai)\b[\s\S]*?(?=^\#{1,4}\s|\Z)/gim;
  return md.replace(re, "");
}

function looksLikePackagingOrConfig(code: string): boolean {
  const needles = [
    "packId",
    "moduleId",
    "courseId",
    "manifest.json",
    "assessmentFile",
    "passingScore",
    "updatedAt",
    "\"lessons\"",
    "\"assets\"",
    "storageBucket",
    "firebaseConfig",
  ];
  const c = code.toLowerCase();
  return needles.some((n) => c.includes(n.toLowerCase()));
}

/** remove only code fences that look like packaging/config */
function stripPackagingCodeFences(md: string) {
  // Capture ```lang\n...\n```
  const re = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)\n```/g;

  return md.replace(re, (full, lang, body) => {
    const l = String(lang || "").toLowerCase().trim();
    const isConfigLang = ["json", "yaml", "yml", "toml", "ini", "ts", "tsx", "js", "jsx"].includes(l);
    if (isConfigLang && looksLikePackagingOrConfig(body)) return "";
    // Also strip unlabeled fences that clearly contain packaging keys
    if (!l && looksLikePackagingOrConfig(body)) return "";
    return full;
  });
}

/** remove a seção ## Avaliação que é interna — o card de avaliação fica no módulo */
function stripAssessmentSection(md: string) {
  return md.replace(/^## Avalia[çc][aã]o\b[\s\S]*?(?=^## |\Z)/gim, "");
}

export type MarkdownViewMode = "student" | "leader";

/** sanitize for students; leaders can view raw */
export function sanitizeMarkdown(input: string, mode: MarkdownViewMode = "student"): string {
  let md = input ?? "";
  if (mode === "leader") return md;

  md = stripFrontmatter(md);
  md = stripAssessmentSection(md);
  md = stripMarkedHtmlBlocks(md);
  md = stripAdmonitionBlocks(md);
  md = stripInstructionHeadings(md);
  md = stripMdCommentLines(md);
  md = stripAllHtmlComments(md);
  md = stripPackagingCodeFences(md);

  // collapse excessive blank lines
  md = md.replace(/\n{4,}/g, "\n\n\n").trim();

  return md;
}
