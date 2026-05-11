import { useState } from "preact/hooks";
import Router, { Route } from "preact-router";
import { DeviceAuthGate } from "./composant/ui/molecules/DeviceAuthGate/DeviceAuthGate";
import { RoutePathContext } from "./lib/routePathContext";
import { CollectionsView } from "./composant/ui/organismes/CollectionsView/CollectionsView";
import { QuestionReflexionView } from "./composant/ui/organismes/QuestionReflexionView";
import { SousCollectionsView } from "./composant/ui/organismes/SousCollectionsView";
import { DatabaseTransferView } from "./composant/ui/organismes/DatabaseTransferView/DatabaseTransferView";
import { HomeView } from "./composant/ui/organismes/HomeView/HomeView";
import { QuestionsView } from "./composant/ui/organismes/QuestionsView/QuestionsView";
import { QuizResultsView } from "./composant/ui/organismes/QuizResultsView/QuizResultsView";
import { QuizSessionView } from "./composant/ui/organismes/QuizSessionView/QuizSessionView";
import { SessionDetailsView } from "./composant/ui/organismes/SessionDetailsView/SessionDetailsView";
import { StatsDashboard } from "./composant/ui/organismes/StatsDashboard/StatsDashboard";

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
            setPath(readPathWithSearch());
          }}
        >
          <Route path="/" component={HomeView} />
          <Route path="/collections/:collectionId/sous-collections" component={SousCollectionsView} />
          <Route path="/collections/:collectionId/reflexion" component={QuestionReflexionView} />
          <Route path="/collections" component={CollectionsView} />
          <Route path="/database" component={DatabaseTransferView} />
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
