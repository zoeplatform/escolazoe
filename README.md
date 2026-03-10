# 🎓 Escola Zoe (v1.4) — Plataforma de Educação Cristã

Uma plataforma moderna e acessível para ensino cristão com:

- **Estrutura de Cursos → Módulos → Aulas** com conteúdo robusto
- **Reader mobile-first** com Sidebar e navegação fluida
- **Renderização de Markdown** com suporte completo
- **Modo Offline** (localStorage/Capacitor) para Android
- **Design Moderno** com Azul Royal `#4A5FD9`
- **Tema Dark/Light/Reading** para melhor experiência
- **Build Android nativo** com Capacitor

---

## 🚀 Quick Start (Local)

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build
pnpm preview
```

---

## ☁️ Deploy — GitHub Pages

### 1. Criar o repositório no GitHub

Crie um repositório público (ex: `escola-zoe`).

### 2. Subir o código

```bash
git init
git add .
git commit -m "chore: initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/escola-zoe.git
git push -u origin main
```

### 3. Ativar GitHub Pages via Actions

> **Settings → Pages → Source → GitHub Actions**

A cada push na `main`, o CI faz o build e publica automaticamente.

URL do site: `https://SEU_USUARIO.github.io/escola-zoe/`

---

### 🌐 Domínio Customizado (Opcional)

1. Crie `public/CNAME` com seu domínio (ex: `escolazoe.com`)
2. Em `public/404.html`, altere `pathSegmentsToKeep` para `0`
3. Configure o DNS conforme a [documentação do GitHub](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

## 🔗 Stack

React 18 · TypeScript · Vite · Wouter · Firebase · Capacitor

**Escola Zoe** — Educação que transforma ✨
