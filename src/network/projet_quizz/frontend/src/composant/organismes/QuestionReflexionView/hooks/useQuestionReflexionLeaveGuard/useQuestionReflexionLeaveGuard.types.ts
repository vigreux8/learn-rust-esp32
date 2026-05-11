export type UseQuestionReflexionLeaveGuardProps = {
  chain: {
    chainDirtyRef: { current: boolean };
    saveChainDraft: () => Promise<boolean>;
    loadChainFor: (cid: number, gid: number | null) => Promise<void>;
    chainBusy: boolean;
  };
  routing: {
    collectionIdNum: number | null;
    selectedGroupeIdRef: { current: number | null };
  };
};
