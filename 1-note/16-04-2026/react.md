# use-memo sert a quoi

En React (ou Preact, comme dans ton code), **`useMemo`** est un Hook qui permet de mettre en cache (**mémoïser**) le résultat d'un calcul coûteux.

Imagine que tu as une fonction qui prend beaucoup de temps à s'exécuter. Sans `useMemo`, React relancerait ce calcul à **chaque rendu** du composant, même si les données de base n'ont pas changé. `useMemo` dit à React : _"Garde ce résultat en mémoire et ne le recalcule que si l'une de ses dépendances change."_

---

## 1. Comment il est utilisé dans ton code

Dans ton fichier, tu as deux utilisations de `useMemo` :

### Exemple A : `buildPrompt`

```javascript
const buildPrompt = useMemo(
  () => (currentOptions: LlmImportOption[]) => {
    // ... calcul complexe pour générer un long texte de prompt ...
    return LLM_PROMPT_BASE + countBlock + nameBlock + subjectBlock + ...;
  },
  [targetCollectionNumeric, collections, importTargetModuleId, allModules]
);
```

- **Ce qu'il fait** : Il crée une fonction qui génère un "prompt" pour une IA.
- **Pourquoi l'utiliser ici ?** La construction de ce texte demande pas mal de manipulations de chaînes de caractères et de recherches dans des tableaux (`find`).
- **Dépendances** : La fonction ne sera recréée que si `targetCollectionNumeric`, `collections`, `importTargetModuleId` ou `allModules` changent. Si tu tapes du texte dans un autre champ qui n'a rien à voir, React ne s'embêtera pas à reconstruire cette logique.

### Exemple B : `llmImportWorkflow`

```javascript
const llmImportWorkflow = useMemo(
  () => ({
    buildPrompt,
    importFromJson: async (importText: string) => { ... }
  }),
  [buildPrompt, options, ... ]
);
```

- **Ce qu'il fait** : Il crée un objet regroupant la logique d'import.
- **Utilité** : Cet objet est passé en "prop" au composant enfant `<QuestionsLlmImportPanel />`. En utilisant `useMemo`, tu garantis que l'objet garde la **même référence mémoire** tant que les options ne changent pas. Cela évite que le composant enfant ne se ré-affiche inutilement (optimisation de performance).

---

## 2. La structure de `useMemo`

La syntaxe est toujours la suivante :

$$resultat = useMemo(() => fonctionQuiCalcule(), [dependances])$$

1.  **La fonction** : Elle doit être "pure" (elle calcule et retourne quelque chose).
2.  **Le tableau de dépendances** : C'est la liste des variables à surveiller.
    - Si les variables sont identiques au rendu précédent : React retourne la valeur stockée.
    - Si une variable a changé : React exécute la fonction et stocke le nouveau résultat.

---

## 3. `useMemo` vs `useEffect`

Il ne faut pas les confondre :

- **`useEffect`** : Sert à déclencher une **action** (un "effet secondaire") comme appeler une API, modifier le DOM, ou mettre à jour un état (`setState`). (Tu l'utilises d'ailleurs dans ton code pour synchroniser tes `options`).
- **`useMemo`** : Sert uniquement à retourner une **valeur** (un nombre, une chaîne, un objet, une fonction) pour l'utiliser pendant le rendu.

## En résumé

Dans ton projet, `useMemo` sert à **stabiliser** tes fonctions et objets complexes. Cela rend ton application plus fluide en évitant des calculs inutiles et en empêchant tes composants enfants de se rafraîchir pour rien à chaque fois que l'utilisateur tape une lettre dans un champ.
