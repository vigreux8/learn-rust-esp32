import { useState } from "preact/hooks";
import Router, { Route } from "preact-router";
import { DeviceAuthGate } from "./composant/molecules/DeviceAuthGate/DeviceAuthGate";
import { RoutePathContext } from "./lib/routePathContext";
import { CollectionsView } from "./composant/organismes/CollectionsView/CollectionsView";
import { DatabaseTransferView } from "./composant/organismes/DatabaseTransferView/DatabaseTransferView";
import { HomeView } from "./composant/organismes/HomeView/HomeView";
import { QuestionsView } from "./composant/organismes/QuestionsView/QuestionsView";
import { QuizResultsView } from "./composant/organismes/QuizResultsView/QuizResultsView";
import { QuizSessionView } from "./composant/organismes/QuizSessionView/QuizSessionView";
import { SessionDetailsView } from "./composant/organismes/SessionDetailsView/SessionDetailsView";
import { StatsDashboard } from "./composant/organismes/StatsDashboard/StatsDashboard";

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
