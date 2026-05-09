export type QuestionReflexionBootstrapRoute = {
  collectionId?: string;
};

export type UseQuestionReflexionBootstrapProps = {
  route: QuestionReflexionBootstrapRoute;
  chainFlush: { current: ((cid: number, gid: number | null) => Promise<void>) | null };
};
