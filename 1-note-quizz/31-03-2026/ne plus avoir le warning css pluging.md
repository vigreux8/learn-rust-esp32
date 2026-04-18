# 1. Pourquoi `@plugin` au lieu de `@import` dans le css ?

> **TL;DR** : Si tu utilises Tailwind CSS v4, utilise `@plugin`.
>
> - **Tailwind v3 et avant :** Les plugins étaient gérés dans le fichier `tailwind.config.js`.
> - **Tailwind v4 :** Maintenant, tu déclares les plugins directement dans ton fichier CSS avec la directive `@plugin` (ex : `@plugin "daisyui";`).
>
> 👉 **Le warning s’affiche simplement parce que VS Code considère que tu écris du CSS standard — or, pour du CSS classique, `@plugin` n’existe pas.** Ce n’est pas une vraie erreur, juste un souci de reconnaissance du langage par l’éditeur.

---

# Comment corriger le warning dans VS Code ?

## Option A — Changer le mode de langage du fichier (Recommandé)

1. **En bas à droite** de VS Code, clique sur le mot `CSS` (ou le nom du langage affiché).
2. Dans le menu qui s’ouvre en haut, tape `Tailwind CSS` et sélectionne-le.
3. Le warning sur `@plugin` devrait disparaître (l’extension Tailwind comprend cette directive).

---

## Option A.bis — Par la palette de commandes

1. Fais le raccourci :
   - **Windows/Linux** : `Ctrl + Shift + P`
   - **Mac** : `Cmd + Shift + P`
2. Tape : **Language Mode**
3. Sélectionne **Change Language Mode**.
4. Cherche et sélectionne **Tailwind CSS** dans la liste.

---

📝 **Résumé** :  
Le warning ne signifie pas que ton CSS est invalide. Il indique juste que VS Code lit ton fichier en "CSS pur" alors que tu utilises des features spécifiques à Tailwind v4. Pense à activer le mode Tailwind CSS pour un meilleur confort !
