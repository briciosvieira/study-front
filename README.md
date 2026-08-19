# Plataforma de Ensino (LMS) — Frontend (React)

Documento de arquitetura e especificação técnica do frontend. Complementa o
`README.md` do backend (NestJS) — leia aquele primeiro para entender os
contratos de API e as regras de negócio.

---

## Índice

1. [Visão geral](#1-visão-geral)
2. [Stack tecnológica](#2-stack-tecnológica)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Roteamento e guards por role](#4-roteamento-e-guards-por-role)
5. [Autenticação (fluxo completo)](#5-autenticação-fluxo-completo)
6. [Camada de dados (API client + React Query)](#6-camada-de-dados-api-client--react-query)
7. [Telas do Admin / Técnico](#7-telas-do-admin--técnico)
8. [Telas do Estudante](#8-telas-do-estudante)
9. [Componente: Visualizador de PDF](#9-componente-visualizador-de-pdf)
10. [Componente: Player de Vídeo](#10-componente-player-de-vídeo)
11. [Componente: Motor do Quiz (o mais complexo)](#11-componente-motor-do-quiz-o-mais-complexo)
12. [Upload direto pro storage (presigned URL)](#12-upload-direto-pro-storage-presigned-url)
13. [Design system e estilo](#13-design-system-e-estilo)
14. [Tratamento de erros e estados de loading](#14-tratamento-de-erros-e-estados-de-loading)
15. [Testes](#15-testes)
16. [Variáveis de ambiente](#16-variáveis-de-ambiente)
17. [Build e deploy](#17-build-e-deploy)
18. [Roadmap de desenvolvimento em fases](#18-roadmap-de-desenvolvimento-em-fases)

---

## 1. Visão geral

SPA em React que consome a API NestJS. Três áreas totalmente separadas por
rota e por permissão: `/admin`, `/tecnico`, `/aluno`. O mesmo app serve os
três perfis, mas cada um só enxerga e navega dentro da sua própria área —
o guard de rota redireciona automaticamente com base no `role` do token.

Peças centrais de UI que exigem mais cuidado:
- **Visualizador de PDF** com zoom e navegação, sem limite de tamanho de
  arquivo.
- **Player de vídeo** com ordenação customizada (`1`, `1.1`, `2`...).
- **Motor de Quiz**: perguntas sequenciais, sem voltar, timer de 3min25s por
  pergunta (validado no servidor), tela de resultado com gabarito em
  verde/vermelho, e "refazer" ilimitado.

---

## 2. Stack tecnológica

| Camada | Tecnologia | Motivo |
|---|---|---|
| Build tool | Vite | dev server rápido, HMR |
| Linguagem | TypeScript | segurança de tipos, contratos com a API |
| Roteamento | React Router v6 | rotas aninhadas + guards |
| Estado de servidor | TanStack Query (React Query) | cache, refetch, polling (import de Excel) |
| Estado de UI local | Zustand (ou Context+useReducer) | estado do quiz, sidebar, etc. |
| Formulários | React Hook Form + Zod | validação client-side espelhando os DTOs do Nest |
| Estilo | Tailwind CSS | consistente com o backend, produtividade |
| Componentes de UI | shadcn/ui (Radix + Tailwind) | acessibilidade de graça, customizável |
| PDF | `react-pdf` (pdf.js por baixo) | render + zoom + paginação |
| Vídeo | `video.js` ou `<video>` nativo + HLS.js (se streaming) | suporte a HLS do Cloudflare Stream/Mux |
| HTTP client | `axios` com interceptors | refresh token automático |
| Ícones | `lucide-react` | leve, consistente |
| Upload de Excel (preview local opcional) | `xlsx` (SheetJS) | validação rápida antes de enviar |
| Testes | Vitest + Testing Library + Playwright (e2e) | padrão Vite |

---

## 3. Estrutura de pastas

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── app/
│   │   ├── router.tsx                  # define todas as rotas
│   │   ├── RequireAuth.tsx             # guard: precisa estar logado
│   │   ├── RequireRole.tsx             # guard: precisa ter um dos roles
│   │   └── AppProviders.tsx            # QueryClientProvider, ThemeProvider etc.
│   │
│   ├── layouts/
│   │   ├── AdminLayout.tsx             # sidebar admin
│   │   ├── TecnicoLayout.tsx           # sidebar técnico
│   │   ├── AlunoLayout.tsx             # navbar aluno
│   │   └── AuthLayout.tsx              # tela de login
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── admin/
│   │   │   ├── UsuariosPage.tsx
│   │   │   ├── CursosPage.tsx
│   │   │   └── CursoDetalhePage.tsx    # abas: PDF | Vídeo | Perguntas | Alunos
│   │   ├── tecnico/
│   │   │   ├── CursosPage.tsx
│   │   │   └── CursoDetalhePage.tsx
│   │   └── aluno/
│   │       ├── MeusCursosPage.tsx
│   │       ├── CursoAlunoPage.tsx      # abas: PDF | Vídeo | Quiz
│   │       ├── PdfViewerPage.tsx
│   │       ├── VideoPlayerPage.tsx
│   │       ├── QuizPage.tsx
│   │       └── QuizResultadoPage.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api.ts                  # login, refresh, me
│   │   │   ├── useAuth.ts              # hook com user, token, logout
│   │   │   └── authStore.ts            # zustand: token em memória
│   │   │
│   │   ├── cursos/
│   │   │   ├── api.ts
│   │   │   ├── useCursos.ts
│   │   │   ├── CursoForm.tsx
│   │   │   ├── CursoCard.tsx           # exibe a capa
│   │   │   └── VisibilidadeAlunosModal.tsx
│   │   │
│   │   ├── modulos/
│   │   │   ├── api.ts
│   │   │   ├── useModulos.ts
│   │   │   ├── ModuloForm.tsx
│   │   │   └── ModuloCard.tsx
│   │   │
│   │   ├── pdf/
│   │   │   ├── api.ts
│   │   │   ├── usePdfItens.ts
│   │   │   ├── PdfUploadForm.tsx       # inclui campo de "ordem" (1, 1.1, 2)
│   │   │   ├── PdfLista.tsx
│   │   │   └── PdfViewer.tsx
│   │   │
│   │   ├── video/
│   │   │   ├── api.ts
│   │   │   ├── useVideoItens.ts
│   │   │   ├── VideoUploadForm.tsx
│   │   │   ├── VideoLista.tsx
│   │   │   └── VideoPlayer.tsx
│   │   │
│   │   ├── quiz/
│   │   │   ├── api.ts
│   │   │   ├── PerguntaForm.tsx        # CRUD manual de pergunta
│   │   │   ├── PerguntaLista.tsx
│   │   │   ├── ImportExcelModal.tsx    # upload + polling de status
│   │   │   ├── QuizRunner.tsx          # state machine da prova
│   │   │   ├── useQuizTimer.ts         # hook do countdown (3min25s)
│   │   │   ├── quizReducer.ts          # useReducer: estados da prova
│   │   │   └── QuizResultado.tsx       # gabarito verde/vermelho
│   │   │
│   │   └── usuarios/
│   │       ├── api.ts
│   │       ├── useUsuarios.ts
│   │       └── UsuarioForm.tsx
│   │
│   ├── shared/
│   │   ├── api/
│   │   │   ├── axiosClient.ts          # instância axios + interceptor refresh
│   │   │   └── queryClient.ts
│   │   ├── components/
│   │   │   ├── ui/                     # botão, input, modal, tabs (shadcn)
│   │   │   ├── ConfirmDialog.tsx       # "tem certeza que quer deletar?"
│   │   │   ├── OrdemBadge.tsx          # exibe "1.1" formatado
│   │   │   └── EmptyState.tsx
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   └── usePolling.ts
│   │   └── types/
│   │       └── api.types.ts            # espelha os DTOs do backend
│   │
│   └── styles/
│       └── globals.css
│
├── public/
├── .env.example
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Roteamento e guards por role

```tsx
// app/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    element: <RequireAuth />,           // precisa estar autenticado
    children: [
      {
        path: "/admin",
        element: <RequireRole roles={["ADMIN"]} />,
        children: [
          { element: <AdminLayout />, children: [
            { index: true, element: <Navigate to="cursos" /> },
            { path: "usuarios", element: <UsuariosPage /> },
            { path: "cursos", element: <CursosPage /> },
            { path: "cursos/:cursoId", element: <CursoDetalhePage /> },
          ]},
        ],
      },
      {
        path: "/tecnico",
        element: <RequireRole roles={["TECNICO"]} />,
        children: [
          { element: <TecnicoLayout />, children: [
            { index: true, element: <Navigate to="cursos" /> },
            { path: "cursos", element: <CursosPage /> },
            { path: "cursos/:cursoId", element: <CursoDetalhePage /> },
          ]},
        ],
      },
      {
        path: "/aluno",
        element: <RequireRole roles={["ESTUDANTE", "ADMIN", "TECNICO"]} />,
        // qualquer perfil pode acessar a área de aluno, já que
        // "cada usuário pode fazer o quiz, seja qual for o perfil"
        children: [
          { element: <AlunoLayout />, children: [
            { index: true, element: <MeusCursosPage /> },
            { path: "cursos/:cursoId", element: <CursoAlunoPage /> },
            { path: "cursos/:cursoId/pdf/:pdfId", element: <PdfViewerPage /> },
            { path: "cursos/:cursoId/video/:videoId", element: <VideoPlayerPage /> },
            { path: "cursos/:cursoId/quiz", element: <QuizPage /> },
            { path: "cursos/:cursoId/quiz/resultado", element: <QuizResultadoPage /> },
          ]},
        ],
      },
      { path: "/", element: <RedirectToHome /> }, // decide pra onde mandar com base no role
    ],
  },
]);
```

`RequireRole` lê o `role` do usuário autenticado (via `useAuth()`) e, se não
bater com nenhum dos `roles` permitidos, redireciona para a home
correspondente ao role real do usuário — nunca para uma tela de "acesso
negado" seca, evitando confundir o usuário.

> Nota: como qualquer perfil pode fazer o quiz ("cada usuário vai poder
> fazer isso seja lá qual for o perfil"), a área `/aluno` fica acessível
> também para Admin e Técnico — eles simplesmente veem os cursos onde têm
> visibilidade liberada, exatamente como um estudante veria.

---

## 5. Autenticação (fluxo completo)

- Login (`POST /auth/login`) retorna `accessToken` (guardado em memória, via
  Zustand — **nunca em localStorage**, para reduzir superfície de XSS) e seta
  um cookie `httpOnly` de refresh token (gerenciado pelo backend).
- Interceptor do axios: se uma requisição retornar `401`, tenta
  `POST /auth/refresh` uma vez, atualiza o `accessToken` em memória, e repete
  a requisição original. Se o refresh também falhar, desloga e manda pro
  `/login`.
- `useAuth()` expõe `{ user, isLoading, login, logout }` e é o hook único que
  qualquer guard/layout consulta para saber o `role` atual.

```tsx
// features/auth/authStore.ts
import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  user: { id: string; nome: string; role: "ADMIN" | "TECNICO" | "ESTUDANTE" } | null;
  setSession: (token: string, user: AuthState["user"]) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ accessToken, user }),
  clearSession: () => set({ accessToken: null, user: null }),
}));
```

---

## 6. Camada de dados (API client + React Query)

Cada `features/*/api.ts` exporta funções puras que chamam o axios client;
cada `features/*/useX.ts` envolve isso em hooks do React Query.

```tsx
// features/cursos/api.ts
import { api } from "@/shared/api/axiosClient";

export const cursosApi = {
  listar: () => api.get("/cursos").then((r) => r.data),
  meus: () => api.get("/cursos/meus").then((r) => r.data),
  criar: (payload: CreateCursoDto) => api.post("/cursos", payload).then((r) => r.data),
  deletar: (id: string) => api.delete(`/cursos/${id}`),
  setVisibilidade: (id: string, alunoIds: string[]) =>
    api.put(`/cursos/${id}/visibilidade`, { alunoIds }),
};

// features/cursos/useCursos.ts
export function useCursos() {
  return useQuery({ queryKey: ["cursos"], queryFn: cursosApi.listar });
}

export function useDeletarCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cursosApi.deletar,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cursos"] }),
  });
}
```

Convenção: **toda tela busca dados via hook do React Query, nunca com
`useEffect` + `fetch` manual.** Isso já resolve cache, revalidação e retry
sem código extra.

Para o import de Excel (processamento assíncrono), usa-se **polling**:

```tsx
// features/quiz/ImportExcelModal.tsx (trecho)
const { data: status } = useQuery({
  queryKey: ["import-status", jobId],
  queryFn: () => quizApi.statusImportacao(jobId!),
  enabled: !!jobId,
  refetchInterval: (query) =>
    query.state.data?.status === "concluido" ? false : 2000, // pára quando concluído
});
```

---

## 7. Telas do Admin / Técnico

**`CursosPage`**: grid de cards (`CursoCard`) mostrando capa, título, botão
"editar" e "deletar" (deletar só aparece se `user.role === "ADMIN"`).

**`CursoDetalhePage`**: abas (Tabs do shadcn) — **PDF**, **Vídeo**,
**Perguntas**, **Alunos**.
- Aba **Alunos**: lista todos os estudantes com um checkbox — marcado =
  curso visível para aquele aluno. Salva via
  `PUT /cursos/:id/visibilidade`.
- Aba **PDF/Vídeo**: formulário de upload com campo "ordem" (aceita `1`,
  `1.1`, `2`...) + lista ordenada (`PdfLista`/`VideoLista`) com botão
  reordenar/deletar (deletar só para Admin).
- Aba **Perguntas**: lista de perguntas (`PerguntaLista`) + botão "Nova
  pergunta" (`PerguntaForm`, com campos dinâmicos de opção A–F, marcando
  qual é a correta) + botão "Importar Excel" (`ImportExcelModal`).

Regra de UI importante: os botões de **deletar** (curso, módulo, PDF, vídeo,
pergunta, usuário) só renderizam se `user.role === "ADMIN"`. O Técnico vê os
mesmos formulários de criar/editar, mas nunca o botão de excluir — isso
replica no front a regra de RBAC do backend (que também bloqueia no
servidor, então é defesa em profundidade, não a única barreira).

---

## 8. Telas do Estudante

**`MeusCursosPage`**: grid dos cursos onde `CursoVisibilidade` inclui o
usuário logado (`GET /cursos/meus`).

**`CursoAlunoPage`**: abas **PDF**, **Vídeo**, **Quiz** (só mostra as abas
cujo módulo esteja `visivel = true`).

- Aba PDF → lista numerada (`1`, `1.1`, `2`...) → clique abre
  `PdfViewerPage`.
- Aba Vídeo → mesma lógica, abre `VideoPlayerPage`.
- Aba Quiz → botão "Iniciar" (ou "Refazer" se já existe tentativa
  finalizada) → `QuizPage`.

---

## 9. Componente: Visualizador de PDF

```tsx
// features/pdf/PdfViewer.tsx
import { Document, Page } from "react-pdf";
import { useState } from "react";

export function PdfViewer({ fileUrl, onVoltar }: { fileUrl: string; onVoltar: () => void }) {
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b">
        <button onClick={onVoltar}>← Voltar</button>
        <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}>-</button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale((s) => Math.min(3, s + 0.25))}>+</button>
      </div>

      <div className="flex-1 overflow-auto flex flex-col items-center gap-4 p-4">
        <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading="Carregando PDF...">
          {Array.from({ length: numPages }, (_, i) => (
            <Page key={i} pageNumber={i + 1} scale={scale} />
          ))}
        </Document>
      </div>
    </div>
  );
}
```

Pontos de atenção:
- Renderiza **todas as páginas** empilhadas (scroll contínuo) em vez de
  paginação clique-a-clique — mais natural para leitura longa, e cobre o
  requisito "pode ampliar o PDF todo".
- Como não há limite de tamanho de arquivo, considere lazy-loading de
  páginas (`react-pdf` já faz virtualização básica) para PDFs muito grandes
  (100+ páginas) não travarem o navegador — se necessário, evoluir para
  `react-window` renderizando só as páginas visíveis.
- Botão "Voltar" desmonta o viewer e retorna pra lista (`PdfLista`), como
  pedido: "pode voltar pra página pra poder clicar em outro pdf".

---

## 10. Componente: Player de Vídeo

```tsx
// features/video/VideoPlayer.tsx
export function VideoPlayer({ src, onVoltar }: { src: string; onVoltar: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <button onClick={onVoltar}>← Voltar</button>
      <video controls className="w-full flex-1" src={src} />
      {/* Se usar Cloudflare Stream/Mux (HLS), trocar <video> nativo por
          um player com hls.js, já que Safari suporta HLS nativo mas
          Chrome/Firefox precisam do polyfill. */}
    </div>
  );
}
```

Se optar por streaming adaptativo (recomendado para vídeos grandes),
substituir por `video.js` + `@videojs/http-streaming` ou o player embutido
do próprio Cloudflare Stream/Mux (ambos fornecem um `<iframe>` ou SDK
próprio).

---

## 11. Componente: Motor do Quiz (o mais complexo)

### Máquina de estados

```
IDLE → CARREGANDO_PERGUNTA → RESPONDENDO → ENVIANDO → 
  (se houver próxima) → CARREGANDO_PERGUNTA
  (se era a última)   → FINALIZADO
```

Não existe transição de volta — o reducer simplesmente não expõe uma action
`VOLTAR`.

```tsx
// features/quiz/quizReducer.ts
type QuizState =
  | { status: "carregando" }
  | { status: "respondendo"; pergunta: Pergunta; tempoRestante: number }
  | { status: "enviando" }
  | { status: "finalizado"; resultado: ResultadoQuiz };

type QuizAction =
  | { type: "PERGUNTA_CARREGADA"; pergunta: Pergunta }
  | { type: "TEMPO_TICK" }
  | { type: "TEMPO_ESGOTADO" }
  | { type: "ENVIAR_RESPOSTA" }
  | { type: "PROXIMA_PERGUNTA"; pergunta: Pergunta }
  | { type: "QUIZ_FINALIZADO"; resultado: ResultadoQuiz };

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "PERGUNTA_CARREGADA":
      return { status: "respondendo", pergunta: action.pergunta, tempoRestante: action.pergunta.tempoLimiteSeg };
    case "TEMPO_TICK":
      if (state.status !== "respondendo") return state;
      return { ...state, tempoRestante: Math.max(0, state.tempoRestante - 1) };
    case "TEMPO_ESGOTADO":
    case "ENVIAR_RESPOSTA":
      return { status: "enviando" };
    case "PROXIMA_PERGUNTA":
      return { status: "respondendo", pergunta: action.pergunta, tempoRestante: action.pergunta.tempoLimiteSeg };
    case "QUIZ_FINALIZADO":
      return { status: "finalizado", resultado: action.resultado };
  }
}
```

### Hook do timer

```tsx
// features/quiz/useQuizTimer.ts
import { useEffect, useRef } from "react";

export function useQuizTimer(ativo: boolean, onTick: () => void, onEsgotar: () => void, tempoRestante: number) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!ativo) return;
    if (tempoRestante <= 0) {
      onEsgotar();
      return;
    }
    const id = setTimeout(() => onTickRef.current(), 1000);
    return () => clearTimeout(id);
  }, [ativo, tempoRestante, onEsgotar]);
}
```

### Componente principal

```tsx
// features/quiz/QuizRunner.tsx
export function QuizRunner({ moduloId }: { moduloId: string }) {
  const [state, dispatch] = useReducer(quizReducer, { status: "carregando" });
  const tentativaIdRef = useRef<string | null>(null);

  const iniciarMutation = useMutation({
    mutationFn: () => quizApi.iniciar(moduloId),
    onSuccess: (data) => {
      tentativaIdRef.current = data.tentativaId;
      dispatch({ type: "PERGUNTA_CARREGADA", pergunta: data.pergunta });
    },
  });

  useEffect(() => { iniciarMutation.mutate(); }, [moduloId]);

  const responderMutation = useMutation({
    mutationFn: (opcaoEscolhida: string | null) =>
      quizApi.responder(tentativaIdRef.current!, {
        perguntaId: state.status === "respondendo" ? state.pergunta.id : "",
        opcaoEscolhida,
      }),
    onSuccess: (data) => {
      if (data.finalizado) {
        finalizarMutation.mutate();
      } else {
        dispatch({ type: "PROXIMA_PERGUNTA", pergunta: data.proximaPergunta });
      }
    },
  });

  const finalizarMutation = useMutation({
    mutationFn: () => quizApi.finalizar(tentativaIdRef.current!),
    onSuccess: (resultado) => dispatch({ type: "QUIZ_FINALIZADO", resultado }),
  });

  useQuizTimer(
    state.status === "respondendo",
    () => dispatch({ type: "TEMPO_TICK" }),
    () => { dispatch({ type: "TEMPO_ESGOTADO" }); responderMutation.mutate(null); },
    state.status === "respondendo" ? state.tempoRestante : 0,
  );

  if (state.status === "carregando" || state.status === "enviando") return <Spinner />;

  if (state.status === "finalizado") return <QuizResultado resultado={state.resultado} moduloId={moduloId} />;

  return (
    <div>
      <TimerBadge segundos={state.tempoRestante} />
      <h2>{state.pergunta.enunciado}</h2>
      <div className="flex flex-col gap-2">
        {state.pergunta.opcoes.map((opcao) => (
          <button
            key={opcao.letra}
            onClick={() => { dispatch({ type: "ENVIAR_RESPOSTA" }); responderMutation.mutate(opcao.letra); }}
          >
            {opcao.letra}) {opcao.texto}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Tela de resultado

```tsx
// features/quiz/QuizResultado.tsx
export function QuizResultado({ resultado, moduloId }: { resultado: ResultadoQuiz; moduloId: string }) {
  const refazerMutation = useMutation({
    mutationFn: () => quizApi.refazer(moduloId),
    onSuccess: () => window.location.reload(), // ou reset via router
  });

  return (
    <div>
      <h2>Resultado</h2>
      <p>Tempo total: {formatarSegundos(resultado.tempoTotalSeg)}</p>
      <p>Acertos: {resultado.totalAcertos} / {resultado.totalPerguntas}</p>
      <p>Erros: {resultado.totalErros}</p>

      <ul>
        {resultado.detalhes.map((d, i) => (
          <li key={i}>
            <p>{d.pergunta}</p>
            <p className={d.correta ? "text-green-600" : "text-red-600"}>
              Sua resposta: {d.opcaoEscolhida ?? "(tempo esgotado)"}
            </p>
            {!d.correta && <p className="text-green-600">Correta: {d.opcaoCorreta}</p>}
          </li>
        ))}
      </ul>

      <button onClick={() => refazerMutation.mutate()}>Refazer</button>
    </div>
  );
}
```

Notas importantes:
- O **backend** é a fonte de verdade do tempo — o front só mostra um
  countdown visual e dispara `TEMPO_ESGOTADO` localmente, mas o servidor
  recalcula e pode invalidar de qualquer forma. Isso evita manipulação via
  DevTools.
- "Refazer" chama `POST /quiz/refazer`, que arquiva a tentativa atual e
  cria uma nova — disponível para **qualquer perfil, quantas vezes quiser**,
  sem checagem de cooldown no front (nem no back).
- Sem botão de "pergunta anterior" em lugar nenhum da árvore de componentes.

---

## 12. Upload direto pro storage (presigned URL)

```tsx
// features/pdf/PdfUploadForm.tsx (fluxo resumido)
async function handleUpload(file: File, titulo: string, ordemLabel: string) {
  // 1. pede a URL assinada
  const { uploadUrl, key } = await pdfApi.presignUpload(moduloId, {
    nomeArquivo: file.name,
    contentType: file.type,
  });

  // 2. sobe o arquivo direto pro bucket (não passa pelo Nest)
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (evt) => setProgress(Math.round((evt.loaded / evt.total!) * 100)),
  });

  // 3. confirma a metadata no backend
  await pdfApi.confirmarUpload(moduloId, { titulo, key, ordemLabel });
}
```

Isso viabiliza "PDF sem limite de tamanho" sem estourar timeout de request
no Nest, e dá uma barra de progresso real pro usuário (`onUploadProgress`).

---

## 13. Design system e estilo

- Tailwind CSS com paleta neutra + uma cor de destaque configurável (tema da
  instituição/empresa).
- Componentes base via **shadcn/ui** (Button, Dialog, Tabs, Checkbox,
  Progress) — acessíveis por padrão (Radix), fácil de restilizar.
- Estados de sucesso/erro do quiz usam sempre `text-green-600` /
  `text-red-600` de forma consistente (gabarito, badges de acerto/erro).
- Capa de curso/módulo: `aspect-video` com `object-cover`, fallback com
  ícone genérico se `capaUrl` for nulo.

---

## 14. Tratamento de erros e estados de loading

- Toda mutation (`useMutation`) exibe toast de erro (`sonner` ou similar) com
  a mensagem vinda do backend (`error.response.data.message`).
- Toda query mostra um skeleton/spinner enquanto `isLoading`, e um
  `EmptyState` reutilizável quando a lista vier vazia (ex: "nenhum curso
  visível ainda").
- Erros de permissão (`403` vindo do backend, ex: técnico tentando deletar
  via chamada direta à API) mostram um toast claro — mas o ideal é que a UI
  nem exiba o botão nesse caso (defesa em profundidade: esconder no front +
  bloquear no back).

---

## 15. Testes

- **Unitários (Vitest + Testing Library):** `quizReducer` (todas as
  transições de estado), `useQuizTimer` (contagem regressiva, disparo de
  `onEsgotar`), formatação de `ordemLabel`/`ordemNum`.
- **Integração:** `QuizRunner` com mocks do React Query (`msw` para simular
  a API) cobrindo o fluxo completo: iniciar → responder 3 perguntas →
  finalizar → refazer.
- **E2E (Playwright):** login como cada um dos 3 perfis, confirmando que
  botões de deletar não aparecem para Técnico, que Estudante não acessa
  `/admin`, e que o fluxo de quiz completo funciona do início ao fim.

---

## 16. Variáveis de ambiente

```bash
# .env.example
VITE_API_URL=http://localhost:3100
VITE_STORAGE_PUBLIC_URL=https://cdn.suaplataforma.com  # base pra URLs de leitura de PDF/capa
```

---

## 17. Build e deploy

- `npm run build` gera estático em `dist/` (Vite).
- Deploy recomendado: **Vercel** ou **Cloudflare Pages** (build automático a
  partir do repositório, preview por PR).
- Configurar `VITE_API_URL` como variável de ambiente de build no provedor
  escolhido, apontando para a URL de produção da API NestJS.
- CORS no backend deve liberar exatamente o domínio de produção do
  frontend (evitar `*` em produção).

---

## 18. Roadmap de desenvolvimento em fases

**Fase 1 — Fundação**
- Setup Vite + Tailwind + shadcn, roteamento com guards, tela de login,
  `useAuth` + interceptor de refresh token.

**Fase 2 — Admin/Técnico: Cursos e módulos**
- CRUD de curso e módulo, upload de capa, modal de visibilidade por aluno.

**Fase 3 — Conteúdo (PDF/Vídeo)**
- Upload com presigned URL + barra de progresso, lista ordenada
  (`1`, `1.1`, `2`), `PdfViewer` e `VideoPlayer`.

**Fase 4 — Quiz (núcleo)**
- `PerguntaForm` (CRUD manual), `QuizRunner` com state machine e timer,
  `QuizResultado` com gabarito, botão "Refazer".

**Fase 5 — Importação em massa**
- `ImportExcelModal` com upload + polling de status + relatório de erros
  por linha.

**Fase 6 — Polimento**
- Testes e2e dos três perfis, toasts de erro padronizados, skeleton
  loaders, responsividade mobile (especialmente o `PdfViewer` e o
  `QuizRunner`, que são as telas mais usadas pelo aluno).

---

*Documento gerado como base de arquitetura do frontend — mantenha
sincronizado com o `README.md` do backend conforme os contratos de API
evoluírem.*
