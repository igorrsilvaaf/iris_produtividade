import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

type IncomingMessage = { role: "user" | "assistant"; content: string };

let cachedProjectContext = "";
let cachedProjectContextAt = 0;

const uiGuide = [
  "Fluxos de UI do Íris (pt-BR)",
  "- Criar tarefa:",
  "  1. Nas páginas 'Caixa de Entrada', 'Hoje' ou 'Próximos', clique no botão 'Adicionar Tarefa' no topo",
  "  2. Preencha 'Título' e, se quiser, 'Prioridade' (P1–P4)",
  "  3. Confirme em 'Adicionar'",
  "- Editar tarefa:",
  "  1. Clique no título da tarefa para abrir os detalhes",
  "  2. Clique em 'Editar'",
  "  3. Ajuste campos como 'Título', 'Descrição', 'Data de Vencimento', 'Prioridade', 'Pontos' e 'Projetos'",
  "  4. Seção 'Anexos' para adicionar 'Link', 'Imagem' ou 'Arquivo'",
  "  5. Clique em 'Salvar'",
  "- Concluir tarefa:",
  "  1. Na lista de tarefas, marque o checkbox à esquerda do título",
  "- Criar projeto:",
  "  1. Abra a barra lateral (no mobile, toque no botão de menu no topo para abrir a sidebar)",
  "  2. Seção 'Projetos'",
  "  3. Clique em 'Adicionar Projeto'",
  "  4. Preencha 'Nome' e 'Cor'",
  "  5. Confirme em 'Criar Projeto'",
  "- Criar etiqueta:",
  "  1. Abra a barra lateral",
  "  2. Seção 'Etiquetas'",
  "  3. Clique em 'Adicionar Etiqueta'",
  "  4. Preencha 'Nome' e 'Cor'",
  "  5. Confirme em 'Criar Etiqueta'",
  "- Kanban:",
  "  1. Vá em 'Kanban' (rota /app/kanban)",
  "  2. Arraste cartões entre colunas ('Backlog', 'Planejamento', 'Em Progresso', 'Validação', 'Concluídos')",
  "  3. Para ver/editar um cartão, clique no título",
  "- Calendário:",
  "  1. Vá em 'Calendário' (rota /app/calendar)",
  "  2. Use os botões de mês para navegar e o botão 'Hoje' para voltar",
  "  3. Clique no dia e use o botão '+' para adicionar uma tarefa naquele dia",
  "- Busca de tarefas:",
  "  1. Use o campo de busca no topo (atalho ⌘K/CTRL+K)",
  "  2. Digite ao menos 2 caracteres e selecione um resultado para abrir os detalhes",
  "- Pomodoro:",
  "  1. Vá em 'Pomodoro' (rota /app/pomodoro)",
  "  2. Selecione uma tarefa no seletor e clique em 'Iniciar Pomodoro'",
  "  3. Ajuste tempos em 'Configurações' > 'Cronômetro Pomodoro' se necessário",
  "- Abrir 'Configurações':",
  "  1. Na barra superior, clique no ícone de engrenagem 'Configurações' (ou menu do usuário > 'Configurações')",
  "  2. Alternativamente, acesse /app/settings",
  "- Integrações: GitHub (conectar via token pessoal):",
  "  1. Em 'Configurações', abra a aba 'Integrações'",
  "  2. No campo 'GitHub Personal Access Token', cole seu token (formato 'ghp_...')",
  "  3. Clique em 'Salvar Tokens'",
  "  4. Pronto: os recursos que usam GitHub ficam habilitados para sua conta",
  "- Vincular uma issue/PR do GitHub a uma tarefa (via anexo):",
  "  1. Abra a tarefa (clique no título para abrir os detalhes)",
  "  2. Clique em 'Editar'",
  "  3. Seção 'Anexos' > 'Adicionar anexo'",
  "  4. Selecione 'Link', cole a URL da issue/PR do GitHub e confirme em 'Adicionar'",
  "  5. Dica: ao criar a tarefa com título contendo 'Issue #123' ou 'PR #45', o Íris tenta vincular automaticamente",
  "- Integrações: Jira/Asana (tokens):",
  "  1. Em 'Configurações' > aba 'Integrações'",
  "  2. Preencha 'Jira API Token' e, se necessário, 'Jira Domain'; e/ou 'Asana Personal Access Token'",
  "  3. Clique em 'Salvar Tokens'",
  "- Notificações:",
  "  1. Em 'Configurações' > aba 'Notificações'",
  "  2. Ative 'Notificações Sonoras' e escolha o som",
  "  3. Ative 'Notificações de Desktop' (aceite a permissão do navegador)",
  "  4. Configure 'Dias de Notificação' para lembretes de tarefas",
  "- Backup e Restauração:",
  "  1. Vá em 'Armazenamento & Backup' (rota /app/storage)",
  "  2. 'Exportar Dados' para baixar um backup .json",
  "  3. 'Importar Dados' para restaurar a partir de um arquivo .json",
  "- Relatórios:",
  "  1. Vá em 'Relatórios' (rota /app/reports)",
  "  2. Selecione 'Tipo', 'Período' e filtros (Projetos/Etiquetas/Prioridades)",
  "  3. Escolha 'Formato' (Web, PDF, Excel) e clique em 'Gerar Relatório'",
  "- Perfil e Avatar:",
  "  1. Vá em 'Perfil'",
  "  2. Use 'Upload Photo' para enviar uma imagem de avatar",
].join("\n");

async function readTextFileIfExists(filePath: string) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return data;
  } catch {
    return "";
  }
}

async function listFilesRecursive(baseDir: string) {
  const result: string[] = [];
  const queue: string[] = [baseDir];
  while (queue.length > 0) {
    const current = queue.pop() as string;
    let entries: any[] = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      entries = [];
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
      } else {
        result.push(fullPath);
      }
    }
  }
  return result;
}

function formatPathForApiRoute(fullPath: string, rootApiDir: string) {
  const relative = fullPath.replace(rootApiDir, "");
  const parts = relative.split(path.sep).filter(Boolean);
  const withoutRoute = parts.filter(
    (p) => p !== "route.ts" && p !== "route.js"
  );
  const mapped = withoutRoute
    .map((p) =>
      p.startsWith("[") && p.endsWith("]") ? `:${p.slice(1, -1)}` : p
    )
    .join("/");
  return "/api/" + mapped;
}

function mapRouteToFriendlyName(routePath: string) {
  const lower = routePath.toLowerCase();
  if (lower === "/app" || lower === "/app/") return "Início";
  if (lower.includes("/app/inbox")) return "Caixa de Entrada";
  if (lower.includes("/app/today")) return "Hoje";
  if (lower.includes("/app/upcoming")) return "Próximos";
  if (lower.includes("/app/completed")) return "Concluídos";
  if (lower.includes("/app/kanban")) return "Kanban";
  if (lower.includes("/app/calendar")) return "Calendário";
  if (lower.includes("/app/labels/")) return "Etiqueta";
  if (lower.includes("/app/labels")) return "Etiquetas";
  if (lower.includes("/app/projects/")) return "Projeto";
  if (lower.includes("/app/projects")) return "Projetos";
  if (lower.includes("/app/notifications")) return "Notificações";
  if (lower.includes("/app/reports")) return "Relatórios";
  if (lower.includes("/app/profile")) return "Perfil";
  if (lower.includes("/app/settings")) return "Configurações";
  if (lower.includes("/app/pomodoro")) return "Pomodoro";
  if (lower.includes("/app/snippets")) return "Snippets";
  if (lower.includes("/app/storage")) return "Armazenamento";
  return routePath;
}

async function detectHttpMethods(filePath: string) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const methods = new Set<string>();
    const regex =
      /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)|export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\s*=|export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(content))) {
      const method = (m[1] || m[2] || m[3] || "").toUpperCase();
      if (method) methods.add(method);
    }
    return Array.from(methods).sort();
  } catch {
    return [] as string[];
  }
}

async function buildProjectContext() {
  const now = Date.now();
  if (cachedProjectContext && now - cachedProjectContextAt < 5 * 60 * 1000) {
    return cachedProjectContext;
  }
  const cwd = process.cwd();
  const readme = await readTextFileIfExists(path.join(cwd, "README.md"));
  const prismaSchema = await readTextFileIfExists(
    path.join(cwd, "prisma", "schema.prisma")
  );
  const swagger = await readTextFileIfExists(
    path.join(cwd, "public", "swagger.yaml")
  );
  const i18nFile = await readTextFileIfExists(path.join(cwd, "lib", "i18n.ts"));
  const testsDir = path.join(cwd, "__tests__");

  const apiDir = path.join(cwd, "app", "api");
  const appDir = path.join(cwd, "app", "app");
  const libDir = path.join(cwd, "lib");

  let apiRoutes: string[] = [];
  let appPages: string[] = [];
  let libModules: string[] = [];
  let testTitles: string[] = [];

  try {
    const apiFiles = await listFilesRecursive(apiDir);
    const routeFiles = apiFiles.filter(
      (f) => f.endsWith("route.ts") || f.endsWith("route.js")
    );
    const withMethods = await Promise.all(
      routeFiles.map(async (f) => {
        const url = formatPathForApiRoute(f, apiDir);
        const methods = await detectHttpMethods(f);
        return methods.length > 0 ? `${url} [${methods.join(", ")}]` : url;
      })
    );
    apiRoutes = withMethods.sort();
  } catch {}

  try {
    const appFiles = await listFilesRecursive(appDir);
    appPages = appFiles
      .filter((f) => f.endsWith("page.tsx") || f.endsWith("page.jsx"))
      .map((f) => f.replace(cwd, ""))
      .sort();
  } catch {}

  try {
    const libFiles = await listFilesRecursive(libDir);
    libModules = libFiles
      .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
      .map((f) => f.replace(cwd, ""))
      .sort();
  } catch {}

  try {
    const testFiles = await listFilesRecursive(testsDir);
    const codeFiles = testFiles.filter((f) =>
      /\.test\.(ts|tsx|js|jsx)$/.test(f)
    );
    const seen = new Set<string>();
    for (const file of codeFiles.slice(0, 100)) {
      const content = await readTextFileIfExists(file);
      const describeRegex = /\bdescribe\(\s*["'`]([^"'`]+)["'`]/g;
      const itRegex = /\b(it|test)\(\s*["'`]([^"'`]+)["'`]/g;
      let m: RegExpExecArray | null;
      while ((m = describeRegex.exec(content))) {
        const t = m[1].trim();
        if (t && !seen.has(t)) {
          seen.add(t);
          testTitles.push(`Describe: ${t}`);
        }
        if (testTitles.length > 400) break;
      }
      while ((m = itRegex.exec(content))) {
        const t = m[2].trim();
        if (t && !seen.has(t)) {
          seen.add(t);
          testTitles.push(`Test: ${t}`);
        }
        if (testTitles.length > 800) break;
      }
      if (testTitles.length > 800) break;
    }
  } catch {}

  const readmeTrim = readme.slice(0, 120000);
  const prismaTrim = prismaSchema.slice(0, 60000);
  const swaggerTrim = swagger.slice(0, 40000);

  const prismaModels = prismaSchema
    .split(/\n/)
    .filter((l) => /^model\s+\w+\s+\{/.test(l.trim()))
    .map((l) => l.trim().split(/\s+/)[1]);

  const uiLabels: string[] = [];
  try {
    const labelRegex =
      /(\n|^)\s*([A-Za-z0-9_.\-\s\{\}:'\"]+)\s*:\s*\{\s*\n\s*en:\s*\"([^\"]+)\",\s*\n\s*pt:\s*\"([^\"]+)\"\s*\},?/g;
    const interesting = (k: string) =>
      /task|tarefa|project|projeto|label|etiqueta|add|adicionar|create|criar|save|salvar|edit|editar|delete|excluir|update|atualizar|inbox|hoje|upcoming|próximos|calendar|calendário|kanban|pomodoro|notifications|notificações|search|buscar|login|entrar/i.test(
        k
      );
    let m: RegExpExecArray | null;
    const seen = new Set<string>();
    while ((m = labelRegex.exec(i18nFile))) {
      const key = (m[2] || "").trim().replace(/\s+/g, " ");
      const pt = (m[4] || "").trim();
      if (key && pt && interesting(key) && !seen.has(key)) {
        seen.add(key);
        uiLabels.push(`${key} = ${pt}`);
        if (uiLabels.length > 350) break;
      }
    }
  } catch {}
  const apiList = apiRoutes.slice(0, 1000).join("\n");
  const pagesMapped = appPages
    .slice(0, 1000)
    .map((p) => {
      const route = p
        .replace(/\\/g, "/")
        .replace(/\/app\/app\//, "/app/")
        .replace(/\/page\.(tsx|jsx)$/i, "");
      const friendly = mapRouteToFriendlyName(route);
      return `${friendly}: ${route}`;
    })
    .filter((line) => !/\/app\/roadmap(\b|\/|\?|$)/i.test(line))
    .join("\n");
  const libList = libModules.slice(0, 1000).join("\n");
  const testsList = testTitles.slice(0, 800).join("\n");

  const context = [
    "Projeto: Íris produtividade",
    "Resumo do README:",
    readmeTrim,
    "Schema Prisma:",
    prismaTrim,
    prismaModels.length ? `Modelos Prisma: ${prismaModels.join(", ")}` : "",
    "Rotas de API:",
    apiList,
    swaggerTrim ? "Swagger (trecho):" : "",
    swaggerTrim,
    uiLabels.length ? "Rótulos de UI (pt-BR):" : "",
    uiLabels.join("\n"),
    "Telas do App e rotas:",
    pagesMapped,
    "Módulos Lib:",
    libList,
    testsList ? "Cenários de testes (resumo):" : "",
    testsList,
  ].join("\n\n");

  cachedProjectContext = context;
  cachedProjectContextAt = now;
  return context;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const incoming: IncomingMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];
    const question =
      incoming.length > 0 ? incoming[incoming.length - 1].content : "";
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY on server" },
        { status: 500 }
      );
    }

    const projectContext = await buildProjectContext();
    const recent = incoming.slice(-10);
    const makeContents = (ctx: string) => [
      {
        role: "user" as const,
        parts: [
          {
            text: "Você é a assistente do Íris, em pt-BR. Responda em linguagem natural, clara e direta, usando os textos reais da interface em português. Seja amigável e prática. Para fluxos como criar/editar/organizar itens, responda com passos exatos da UI (ex.: barra lateral > seção 'Projetos'/'Etiquetas' > 'Adicionar Projeto'/'Adicionar Etiqueta' > campos 'Nome' e 'Cor'). Evite instruções genéricas como 'procure um botão +'. Quando útil, referencie telas e rotas do app, mas não revele nomes de arquivos nem componentes internos. Se algo não estiver no contexto, responda apenas: 'não está no contexto'.",
          },
          { text: "Contexto do projeto:" },
          { text: ctx },
          { text: "Guia de navegação da UI do Íris:" },
          { text: uiGuide },
        ],
      },
      ...recent.map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content }],
      })),
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    async function callModel(ctx: string) {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: makeContents(ctx),
          generationConfig: { temperature: 0.6, topP: 0.9 },
        }),
      });
      return r;
    }

    let resp = await callModel(projectContext);

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      const shouldRetry =
        resp.status === 400 ||
        resp.status === 413 ||
        /exceed|too\s*large|max(imum)?\s*(input|content|tokens)|request\s*payload/i.test(
          text
        );

      if (shouldRetry) {
        const reduced = projectContext.slice(0, 20000);
        resp = await callModel(reduced);
      }

      if (!resp.ok) {
        const text2 = await resp.text().catch(() => "");
        return NextResponse.json(
          {
            error: `Upstream error: ${resp.status} ${
              text2 || text || resp.statusText
            }`,
          },
          { status: 502 }
        );
      }
    }

    const data = await resp.json();
    const reply: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ||
      "";

    if (!reply) {
      return NextResponse.json(
        { error: "Empty response from model" },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
