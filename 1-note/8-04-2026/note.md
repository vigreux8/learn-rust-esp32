La syntaxe de base
Contrairement aux commentaires classiques (// ou /\* \*/), la JSDoc commence toujours par /\*\* (deux astérisques).

TypeScript
/\*\*

- Voici une description globale de ce que fait la fonction.
- - @param param1 - Description du premier paramètre
- @returns Description de ce que la fonction renvoie
- @throws {Error} Description des cas d'erreur
  \*/
  function maFonction(param1: string) { ... }
