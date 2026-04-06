import { useState } from "preact/hooks";
import { route } from "preact-router";
import { ArrowLeft, FileJson, FolderKanban, ListChecks } from "lucide-preact";
import {
  listCollectionsUi,
  mockQuestions,
  mockRefCollections,
  mockQuestionCollection,
} from "../../mocks";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { Button } from "../atomes/Button";
import { Card } from "../atomes/Card";
import { Badge } from "../atomes/Badge";

type AdminTab = "questions" | "collections" | "import";

export function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>("questions");
  const collections = listCollectionsUi();

  const llmPrompt = `Génère un JSON d'import FlowLearn avec ce schéma (tables: ref_collection, quizz_question, quizz_reponse, question_collection, quizz_question_reponse). Une entrée = une question avec 4 réponses et un seul "bonne_reponse": 1.`;

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div class="mb-6 flex items-center gap-2">
          <Button variant="ghost" class="btn-sm gap-1 px-2" onClick={() => route("/")}>
            <ArrowLeft class="h-4 w-4" aria-hidden />
            Accueil
          </Button>
        </div>
        <h1 class="mb-2 text-2xl font-bold tracking-tight text-base-content">Administration</h1>
        <p class="mb-6 text-sm text-base-content/60">Maquettes — branchement API à venir.</p>

        <div role="tablist" class="tabs tabs-boxed mb-6 bg-base-200/60 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "questions"}
            class={tab === "questions" ? "tab tab-active bg-flow text-white" : "tab"}
            onClick={() => setTab("questions")}
          >
            <span class="inline-flex items-center gap-1.5">
              <ListChecks class="h-4 w-4" aria-hidden />
              Questions
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "collections"}
            class={tab === "collections" ? "tab tab-active bg-flow text-white" : "tab"}
            onClick={() => setTab("collections")}
          >
            <span class="inline-flex items-center gap-1.5">
              <FolderKanban class="h-4 w-4" aria-hidden />
              Collections
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "import"}
            class={tab === "import" ? "tab tab-active bg-flow text-white" : "tab"}
            onClick={() => setTab("import")}
          >
            <span class="inline-flex items-center gap-1.5">
              <FileJson class="h-4 w-4" aria-hidden />
              Import LLM
            </span>
          </button>
        </div>

        {tab === "questions" ? (
          <Card>
            <p class="mb-4 text-sm text-base-content/65">
              Liste mock ({mockQuestions.length} lignes <code class="text-xs">quizz_question</code>).
            </p>
            <ul class="space-y-3">
              {mockQuestions.map((q) => (
                <li
                  key={q.id}
                  class="flex flex-col gap-2 rounded-[var(--radius-field)] border border-base-content/10 bg-base-200/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="min-w-0">
                    <Badge tone="neutral" class="mb-2">
                      id {q.id}
                    </Badge>
                    <p class="text-sm font-medium text-base-content">{q.question}</p>
                  </div>
                  <div class="flex gap-2 shrink-0">
                    <Button variant="outline" class="btn-xs" disabled>
                      Modifier
                    </Button>
                    <Button variant="learn" class="btn-xs opacity-70" disabled>
                      Supprimer
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {tab === "collections" ? (
          <Card>
            <p class="mb-4 text-sm text-base-content/65">
              Collections <code class="text-xs">ref_collection</code> et liaisons{" "}
              <code class="text-xs">question_collection</code>.
            </p>
            <ul class="space-y-4">
              {collections.map((c) => {
                const links = mockQuestionCollection.filter((qc) => qc.collection_id === c.id);
                return (
                  <li
                    key={c.id}
                    class="rounded-[var(--radius-field)] border border-base-content/10 bg-base-200/30 p-4"
                  >
                    <div class="mb-2 flex flex-wrap items-center gap-2">
                      <span class="font-semibold text-base-content">{c.nom}</span>
                      <Badge tone="flow">ref #{c.id}</Badge>
                    </div>
                    <p class="text-xs text-base-content/55">
                      {links.length} lien(s) question_collection · ids questions :{" "}
                      {links.map((l) => l.question_id).join(", ")}
                    </p>
                  </li>
                );
              })}
            </ul>
            <p class="mt-4 text-xs text-base-content/45">
              Données statiques : {mockRefCollections.length} collections en mock.
            </p>
          </Card>
        ) : null}

        {tab === "import" ? (
          <Card>
            <p class="mb-3 text-sm font-medium text-base-content">Prompt modèle (copier)</p>
            <textarea
              class="textarea textarea-bordered w-full min-h-32 border-base-content/15 bg-base-200/40 text-sm"
              readOnly
              value={llmPrompt}
            />
            <p class="mt-4 text-sm text-base-content/65">
              Colle ensuite le JSON dans une zone d’import (mock) — même principe que la user story import LLM.
            </p>
            <textarea
              class="textarea textarea-bordered mt-2 w-full min-h-28 border-dashed border-learn/30 bg-learn/5 text-sm"
              placeholder='Ex. { "collections": [...] }'
              disabled
            />
            <Button variant="flow" class="mt-4 w-full sm:w-auto" disabled>
              Importer (bientôt)
            </Button>
          </Card>
        ) : null}
      </main>
      <AppFooter />
    </div>
  );
}
