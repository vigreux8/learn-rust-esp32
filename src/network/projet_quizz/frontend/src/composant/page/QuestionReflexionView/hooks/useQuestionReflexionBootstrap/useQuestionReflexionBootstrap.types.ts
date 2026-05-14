export type QuestionReflexionBootstrapRoute = {
  collectionId?: string;
  /** Pré-sélection (`?groupeId=`) depuis la barre latérale ou un lien profond. */
  groupeId?: number | null;
};

export type UseQuestionReflexionBootstrapProps = {
  route: QuestionReflexionBootstrapRoute;
  chainFlush: { current: ((cid: number, gid: number | null) => Promise<void>) | null };
};
