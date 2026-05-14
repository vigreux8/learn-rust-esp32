export type GraphSettingsPanelProps = {
  settings: { focusQuestionAfterCollectionMove: boolean };
  actions: { setFocusQuestionAfterCollectionMove: (value: boolean) => void };
};
