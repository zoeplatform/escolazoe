import { Course } from "../../domain/types";

/**
 * Fundamentos da Fé Cristã (Nível 1)
 * Modelo institucional quinzenal: 24 encontros / ano.
 *
 * IMPORTANTE:
 * - Os módulos gerados a partir de /public/packs são auto-gerados via:
 *   pnpm gen:curriculum
 * - PLACEHOLDER_MODULES mantém a grade completa, mesmo antes dos packs existirem.
 */

// PACKS-AUTO-GEN:START
import type { Module } from "../../domain/types";

const GENERATED_MODULES: Module[] = [
  {
    id: "FND-M01",
    title: "Revelação & Escritura",
    icon: "📜",
    order: 1,
    lessons: [
      {
        id: "FND-RE-01",
        title: "Autoridade das Escrituras",
        order: 1,
        estimatedMinutes: 120,
        contentRef: { type: "package", packageKey: "fundamentos/revelacao-escritura", file: "lessons/FND-RE-01.md" },
      },
      {
        id: "FND-RE-02",
        title: "Inspiração e Formação do Cânon",
        order: 2,
        estimatedMinutes: 120,
        contentRef: { type: "package", packageKey: "fundamentos/revelacao-escritura", file: "lessons/FND-RE-02.md" },
      },
      {
        id: "FND-RE-03",
        title: "Confiabilidade, Inerrância e Interpretação",
        order: 3,
        estimatedMinutes: 120,
        contentRef: { type: "package", packageKey: "fundamentos/revelacao-escritura", file: "lessons/FND-RE-03.md" },
      },
      {
        id: "FND-RE-04",
        title: "Suficiência e Centralidade da Escritura",
        order: 4,
        estimatedMinutes: 120,
        contentRef: { type: "package", packageKey: "fundamentos/revelacao-escritura", file: "lessons/FND-RE-04.md" },
      },
    ],
  },
  {
    id: "FND-M02",
    title: "Doutrina de Deus",
    icon: "✨",
    order: 2,
    lessons: [
      {
        id: "FND-DG-01",
        title: "Existência e Revelação de Deus",
        order: 1,
        estimatedMinutes: 120,
        contentRef: { type: "package", packageKey: "fundamentos/doutrina-de-deus", file: "lessons/FND-DG-01.md" },
      },
      {
        id: "FND-DG-02",
        title: "Atributos de Deus",
        order: 2,
        estimatedMinutes: 120,
        contentRef: { type: "package", packageKey: "fundamentos/doutrina-de-deus", file: "lessons/FND-DG-02.md" },
      },
      {
        id: "FND-DG-03",
        title: "A Trindade",
        order: 3,
        estimatedMinutes: 120,
        contentRef: { type: "package", packageKey: "fundamentos/doutrina-de-deus", file: "lessons/FND-DG-03.md" },
      },
    ],
  },
];
// PACKS-AUTO-GEN:END

const PLACEHOLDER_MODULES: Module[] = [
{
      id: "FND-M03",
      title: "Antropologia e Pecado",
      icon: "🧍",
      order: 3,
      lessons: [
        {
          id: "FND-07",
          title: "Criação e Imago Dei",
          order: 7,
          estimatedMinutes: 35,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-08",
          title: "Queda e Depravação",
          order: 8,
          estimatedMinutes: 40,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-09",
          title: "Pecado: natureza, efeitos e responsabilidade",
          order: 9,
          estimatedMinutes: 45,
          contentRef: { type: "placeholder" },
        },
      ],
    },{
      id: "FND-M04",
      title: "Cristologia",
      icon: "✝️",
      order: 4,
      lessons: [
        {
          id: "FND-10",
          title: "Pessoa de Cristo",
          order: 10,
          estimatedMinutes: 45,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-11",
          title: "Obra de Cristo",
          order: 11,
          estimatedMinutes: 45,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-12",
          title: "Ressurreição, Ascensão e Exaltação",
          order: 12,
          estimatedMinutes: 40,
          contentRef: { type: "placeholder" },
        },
      ],
    },{
      id: "FND-M05",
      title: "Soteriologia",
      icon: "🕊️",
      order: 5,
      lessons: [
        {
          id: "FND-13",
          title: "Graça, Chamado e Eleição (comparativo)",
          order: 13,
          estimatedMinutes: 55,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-14",
          title: "Conversão: arrependimento e fé",
          order: 14,
          estimatedMinutes: 40,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-15",
          title: "Justificação, Regeneração e Adoção",
          order: 15,
          estimatedMinutes: 55,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-16",
          title: "Santificação e Perseverança",
          order: 16,
          estimatedMinutes: 55,
          contentRef: { type: "placeholder" },
        },
      ],
    },{
      id: "FND-M06",
      title: "Pneumatologia e Dons",
      icon: "🔥",
      order: 6,
      lessons: [
        {
          id: "FND-17",
          title: "Pessoa e Obra do Espírito Santo",
          order: 17,
          estimatedMinutes: 45,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-18",
          title: "Dons: sobriedade, propósito e prática",
          order: 18,
          estimatedMinutes: 55,
          contentRef: { type: "placeholder" },
        },
      ],
    },{
      id: "FND-M07",
      title: "Igreja e Ordenanças",
      icon: "⛪",
      order: 7,
      lessons: [
        {
          id: "FND-19",
          title: "Natureza e missão da Igreja",
          order: 19,
          estimatedMinutes: 45,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-20",
          title: "Governo, ministérios e disciplina",
          order: 20,
          estimatedMinutes: 55,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-21",
          title: "Batismo e Ceia (ordenanças)",
          order: 21,
          estimatedMinutes: 45,
          contentRef: { type: "placeholder" },
        },
      ],
    },{
      id: "FND-M08",
      title: "Escatologia e Vida Aplicada",
      icon: "🌅",
      order: 8,
      lessons: [
        {
          id: "FND-22",
          title: "Panorama histórico das visões escatológicas",
          order: 22,
          estimatedMinutes: 60,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-23",
          title: "Volta de Cristo, juízo e esperança",
          order: 23,
          estimatedMinutes: 55,
          contentRef: { type: "placeholder" },
        },
        {
          id: "FND-24",
          title: "Vida cristã: santidade, vocação e missão",
          order: 24,
          estimatedMinutes: 55,
          contentRef: { type: "placeholder" },
        },
      ],
    }
];

export const fundamentosCourse: Course = {
  id: "fundamentos",
  title: "Fundamentos da Fé Cristã",
  description: "Estude as doutrinas essenciais do cristianismo no seu ritmo, com conteúdo sólido e acessível.",
  totalLessons: 24,
  modules: [...GENERATED_MODULES, ...PLACEHOLDER_MODULES],
};