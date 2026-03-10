import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PACKS_INDEX = path.join(ROOT, "public", "packs", "index.json");
const COURSE_FILE = path.join(ROOT, "src", "curriculum", "fundamentos", "course.ts");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function safeTsString(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

function buildGeneratedModules(packsIndex) {
  const modules = [];
  for (const p of packsIndex.packs) {
    const manifestPath = path.join(ROOT, "public", "packs", p.path, "manifest.json");
    const manifest = readJson(manifestPath);

    // Keep existing Escola Zoe module ids ordering convention: FND-M01, FND-M02...
    const order = modules.length + 1;
    const moduleId = `FND-M${String(order).padStart(2, "0")}`;

    const lessons = manifest.lessons.map((l, i) => ({
      id: l.lessonId,
      title: l.title,
      order: i + 1,
      estimatedMinutes: l.estimatedStudyMinutes ?? 120,
      contentRef: {
        type: "package",
        packageKey: p.path, // e.g. fundamentos/revelacao-escritura
        file: l.file, // lessons/xxx.md
      },
    }));

    modules.push({
      id: moduleId,
      title: manifest.moduleTitle,
      icon: "📜",
      order,
      lessons,
    });
  }
  return modules;
}

function toTs(modules) {
  const lines = [];
  lines.push("const GENERATED_MODULES = [");
  for (const m of modules) {
    lines.push("  {");
    lines.push(`    id: "${safeTsString(m.id)}",`);
    lines.push(`    title: "${safeTsString(m.title)}",`);
    lines.push(`    icon: "${safeTsString(m.icon)}",`);
    lines.push(`    order: ${m.order},`);
    lines.push("    lessons: [");
    for (const l of m.lessons) {
      lines.push("      {");
      lines.push(`        id: "${safeTsString(l.id)}",`);
      lines.push(`        title: "${safeTsString(l.title)}",`);
      lines.push(`        order: ${l.order},`);
      lines.push(`        estimatedMinutes: ${l.estimatedMinutes},`);
      lines.push(
        `        contentRef: { type: "package", packageKey: "${safeTsString(l.contentRef.packageKey)}", file: "${safeTsString(l.contentRef.file)}" },`
      );
      lines.push("      },");
    }
    lines.push("    ],");
    lines.push("  },");
  }
  lines.push("] as const;");
  return lines.join("\n");
}

function main() {
  if (!fs.existsSync(PACKS_INDEX)) {
    console.error("Missing public/packs/index.json");
    process.exit(1);
  }
  if (!fs.existsSync(COURSE_FILE)) {
    console.error("Missing src/curriculum/fundamentos/course.ts");
    process.exit(1);
  }

  const idx = readJson(PACKS_INDEX);
  const generated = buildGeneratedModules(idx);

  const src = fs.readFileSync(COURSE_FILE, "utf8");

  const start = "// PACKS-AUTO-GEN:START";
  const end = "// PACKS-AUTO-GEN:END";

  const sIdx = src.indexOf(start);
  const eIdx = src.indexOf(end);
  if (sIdx === -1 || eIdx === -1 || eIdx < sIdx) {
    console.error("Markers not found in course.ts. Expected PACKS-AUTO-GEN markers.");
    process.exit(1);
  }

  const before = src.slice(0, sIdx + start.length);
  const after = src.slice(eIdx);

  const block = "\n" + toTs(generated) + "\n";

  const out = before + block + after;

  fs.writeFileSync(COURSE_FILE, out, "utf8");
  console.log(`✅ Generated ${generated.length} module(s) into fundamentos/course.ts`);
}

main();
