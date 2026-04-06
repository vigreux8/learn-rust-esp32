import Router, { Route } from "preact-router";
import { AdminPanel } from "./composant/organismes/AdminPanel";
import { HomeView } from "./composant/organismes/HomeView";
import { QuizResultsView } from "./composant/organismes/QuizResultsView";
import { QuizSessionView } from "./composant/organismes/QuizSessionView";
import { SessionDetailsView } from "./composant/organismes/SessionDetailsView";
import { StatsDashboard } from "./composant/organismes/StatsDashboard";

export function App() {
  return (
    <Router>
      <Route path="/" component={HomeView} />
      <Route path="/play/:collectionId" component={QuizSessionView} />
      <Route path="/results" component={QuizResultsView} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/stats" component={StatsDashboard} />
      <Route path="/stats/session/:sessionId" component={SessionDetailsView} />
    </Router>
  );
}
