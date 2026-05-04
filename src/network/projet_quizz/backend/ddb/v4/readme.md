# modification majeure

- gestion des collection (cette modification permet d'avoir n collection enfant par rapport a l'ancien ou j'avais une tabler sous-collection qui finalement dupliqué une table qui existé déjat qui était collections)

- quand une personalité et crée un il est crée un quizz_collection qui lui est assignié par défauds cette collection associé ne peut pas avoir d'enfant n'is parent n'is d'autre personalité associé grace a la table personalité_collection

- les categorie question devient ref_p_categorie il peuve avoir des enfant mais aussi e n'avoir aucun pour le voire on a la talbe **relation_categorie**

- les categorie parent :
  - histoire : le contexte de quand sa a était crée, pourquoi et par qui ?
  - pratique : question ou l'on a des situation l'on doit choisir la bonne solution
  - connaissance : a quoi sa sert et comment l'utiliser a quoi sert les variable qui constitue une formules ?

- les catégorie enfant et leur parent
  - histoire
    - contexte
    - date

  - pratique :
    - choix
  - connaissance :

- nouvelle table nous avont question_reflexion qui permet de crée des question qui on une suite précise
