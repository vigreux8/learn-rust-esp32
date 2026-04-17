# bonne pratique ddb :

le nommage dans une base de données est crucial car il définit la clarté de ton code pour les mois à venir.

Le préfixe `ref_` est généralement utilisé pour des **tables de référence statiques** (ex: `ref_pays`, `ref_statut`), c'est-à-dire des données que l'utilisateur ne modifie pas. Ici, comme l'utilisateur peut créer, modifier et que cela structure ses questions, le terme "Collection" est bon, mais peut être affiné.

## prisma et changer de db : 
### 1. Ce qui ne change pas

Ton code actuel continuera de fonctionner pour toutes les tables dont tu n'as pas changé le nom (ex: `user`, `device`, `quizz_question`). Prisma mettra simplement à jour les types en arrière-plan.

### 2. Ce qui va casser (et c'est normal)

Si tu as renommé `ref_collection` en `quizz_module`, ton code qui faisait `prisma.ref_collection...` affichera une erreur de compilation (en TypeScript) ou une erreur à l'exécution.

- **C'est une sécurité :** Cela t'oblige à mettre à jour ton code pour qu'il corresponde à ta nouvelle nomenclature "V2".
    
- **Astuce :** Utilise la fonction "Find and Replace" (Chercher et Remplacer) de VS Code pour passer de l'ancien nom au nouveau dans tout ton dossier `src`.






# modifie programe a creuser : 
- la gestion des erreur 
## Diagnostic

Les logs Nest montrent que l’API tourne bien. En revanche, l’écran « Connexion au serveur » s’affichait pour toute erreur sur le `fetch` du lookup, y compris une réponse HTTP non OK (502 du proxy Vite, 500 Prisma, etc.), pas seulement pour un vrai problème réseau.

En dev, les appels passaient par une URL relative `/api/...` → proxy Vite vers `localhost:3001`. Selon l’environnement (résolution `localhost` / IPv6, timing au redémarrage, etc.), ce proxy peut parfois échouer alors que l’API répond si on teste en `curl` sur `127.0.0.1`.

## Changements

1. `config.ts` — En mode `vite dev`, sans `VITE_API_URL`, les requêtes vont directement sur `http://127.0.0.1:3001` (CORS est déjà ouvert sur Nest). Plus de dépendance au proxy pour le dev.
    
    - Surcharge possible : `VITE_DEV_API_ORIGIN` (ex. autre port).
    - En build prod, comportement inchangé : URLs relatives `/api/...`.
2. `vite.config.ts` — Proxy ciblant `127.0.0.1:3001` + même config sous `preview` pour `npm run preview`.
    
3. `main.ts` — Écoute sur `0.0.0.0` et log explicite : `API prête : http://...` (tu verras l’URL exacte au démarrage).
    
4. `api.ts` + `DeviceAuthGate` — Distinction réseau (`TypeError`, ex. « Failed to fetch ») vs message serveur (`HTTP 502: …`, `HTTP 500: …`, etc.).
    

Redémarre le backend et `npm run dev` du front, puis recharge la page : le lookup devrait passer. Si tu changes le port Nest, définis par exemple `VITE_DEV_API_ORIGIN=http://127.0.0.1:4000` dans un `.env.local` du frontend (ou `VITE_API_URL` pour forcer une base complète).