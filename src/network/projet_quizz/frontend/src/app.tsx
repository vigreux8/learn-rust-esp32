import { useState } from "preact/hooks";
import Router, { Route } from "preact-router";
import { DeviceAuthGate } from "./composant/ui/molecules/DeviceAuthGate/DeviceAuthGate";
import { RoutePathContext } from "./lib/routePathContext";
import { CollectionsView } from "./composant/page/CollectionsView/CollectionsView";
import { QuestionReflexionView } from "./composant/page/QuestionReflexionView";
import { SousCollectionsView } from "./composant/page/SousCollectionsView";
import { DatabaseTransferView } from "./composant/page/DatabaseTransferView/DatabaseTransferView";
import { HomeView } from "./composant/page/HomeView/HomeView";
import { QuestionsView } from "./composant/page/QuestionsView/QuestionsView";
import { QuizResultsView } from "./composant/page/QuizResultsView/QuizResultsView";
import { QuizSessionView } from "./composant/page/QuizSessionView/QuizSessionView";
import { SessionDetailsView } from "./composant/page/SessionDetailsView/SessionDetailsView";
import { StatsDashboard } from "./composant/page/StatsDashboard/StatsDashboard";
import { NodeView } from "./composant/page/NodeView";

function readPathWithSearch() {
  if (typeof window === "undefined") return "/";
  const p = window.location.pathname || "/";
  const s = window.location.search || "";
  return `${p}${s}`;
}

export function App() {
  const [path, setPath] = useState(readPathWithSearch);

  return (
    <DeviceAuthGate>
      <RoutePathContext.Provider value={path}>
        <Router
          onChange={() => {
            queueMicrotask(() => {
              setPath(readPathWithSearch());
            });
          }}
        >
          <Route path="/" component={HomeView} />
          <Route path="/collections/:collectionId/sous-collections" component={SousCollectionsView} />
          <Route path="/collections/:collectionId/reflexion" component={QuestionReflexionView} />
          <Route path="/collections" component={CollectionsView} />
          <Route path="/database" component={DatabaseTransferView} />
          <Route path="/node" component={NodeView} />
          <Route path="/questions/:collectionId" component={QuestionsView} />
          <Route path="/questions" component={QuestionsView} />
          <Route path="/dashboard/session/:sessionId" component={SessionDetailsView} />
          <Route path="/dashboard" component={StatsDashboard} />
          <Route path="/play/:collectionId" component={QuizSessionView} />
          <Route path="/results" component={QuizResultsView} />
        </Router>
      </RoutePathContext.Provider>
    </DeviceAuthGate>
  );
}
