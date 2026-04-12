import { useState } from "preact/hooks";
import Router, { Route } from "preact-router";
import { DeviceAuthGate } from "./composant/organismes/DeviceAuthGate";
import { RoutePathContext } from "./lib/routePathContext";
import { CollectionsView } from "./composant/organismes/CollectionsView";
import { HomeView } from "./composant/organismes/HomeView";
import { QuestionsView } from "./composant/organismes/QuestionsView";
import { QuizResultsView } from "./composant/organismes/QuizResultsView";
import { QuizSessionView } from "./composant/organismes/QuizSessionView";
import { SessionDetailsView } from "./composant/organismes/SessionDetailsView";
import { StatsDashboard } from "./composant/organismes/StatsDashboard";

function readPathname() {
  if (typeof window === "undefined") return "/";
  return window.location.pathname || "/";
}

export function App() {
  const [path, setPath] = useState(readPathname);

  return (
    <DeviceAuthGate>
      <RoutePathContext.Provider value={path}>
        <Router
          onChange={() => {
            setPath(readPathname());
          }}
        >
          <Route path="/" component={HomeView} />
          <Route path="/collections" component={CollectionsView} />
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
