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