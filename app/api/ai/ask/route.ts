import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

type IncomingMessage = { role: "user" | "assistant"; content: string };

let cachedProjectContext = "";
let cachedProjectContextAt = 0;

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

  const apiDir = path.join(cwd, "app", "api");
  const appDir = path.join(cwd, "app", "app");
  const libDir = path.join(cwd, "lib");

  let apiRoutes: string[] = [];
  let appPages: string[] = [];
  let libModules: string[] = [];

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
        if (uiLabels.length > 200) break;
      }
    }
  } catch {}
  const apiList = apiRoutes.slice(0, 1000).join("\n");
  const pagesList = appPages.slice(0, 1000).join("\n");
  const libList = libModules.slice(0, 1000).join("\n");

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
    "Páginas do App:",
    pagesList,
    "Módulos Lib:",
    libList,
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
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: "Contexto do projeto Íris. Responda somente com base neste contexto. Use nomes visíveis na interface (botões, menus, páginas) em pt-BR a partir de 'Rótulos de UI', nunca nomes de componentes internos.",
          },
          {
            text: projectContext,
          },
          {
            text: "Você é a assistente do Íris (pt-BR). Responda de forma objetiva e curta, citando telas, rotas e modelos quando útil. Se faltar contexto, diga 'não está no contexto'.",
          },
        ],
      },
      ...incoming.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.6, topP: 0.9 },
        }),
      }
    );

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: `Upstream error: ${resp.status} ${text || resp.statusText}` },
        { status: 502 }
      );
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
