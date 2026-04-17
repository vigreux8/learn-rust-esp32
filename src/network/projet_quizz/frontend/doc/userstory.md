# User Stories - Frontend Quizz

Ce document répertorie les fonctionnalités attendues pour l'application de quizz, organisées par thématiques.

---

## 🎮 Expérience de Jeu (Quizz)

### Répondre à un Quizz

**En tant que :** utilisateur
**Je veux :**

- Sélectionner une collection de questions pour commencer une session.
- Voir une question s'afficher avec ses différentes propositions de réponses (`quizz_reponse`).
- Sélectionner une réponse et savoir immédiatement si elle est correcte ou non (basé sur `bonne_reponse`).
- Passer à la question suivante de la collection.

### Éviter la redondance

**En tant que :** utilisateur
**Je veux :**

- Ne pas revoir les questions auxquelles j'ai déjà répondu correctement pendant un certain temps pour favoriser l'apprentissage de nouveaux concepts.

### Mode "Sans Connexion" (Invité)

**En tant que :** nouvel utilisateur
**Je veux :**

- Pouvoir répondre aux questions existantes sans avoir besoin de créer un compte, afin de tester l'application immédiatement.

---

## 🛠️ Gestion du Contenu

### Création de Questions/Réponses

**En tant que :** utilisateur
**Je veux :**

- Accéder à un formulaire pour rédiger une nouvelle question (`quizz_question`).
- Associer au moins deux réponses à ma question, en indiquant laquelle est la bonne (`quizz_reponse` via `quizz_question_reponse`).
- Modifier ou supprimer l'intitulé d'une question ou d'une réponse existante.

### Gestion des Collections (Groupes)

**En tant que :** utilisateur
**Je veux :**

- Voir la liste des collections disponibles (`ref_collection`).
- Créer une nouvelle collection en lui donnant un nom.
- Ajouter ou retirer des questions d'une collection (`question_collection`).

### Import massif via LLM

**En tant que :** utilisateur
**Je veux :**

- Copier un "template" ou prompt structuré pour demander à une IA de générer des questions au format JSON.
- Coller ce JSON dans l'interface pour importer massivement des questions et leurs réponses dans la base de données.

---

## 📊 Statistiques et Progression

### Suivi des Performances (KPI)

**En tant que :** utilisateur
**Je veux :**

- Voir le temps que j'ai mis pour répondre à chaque question (`duree_session` dans `user_kpi`).
- Consulter mon historique de réponses pour une session donnée.
- Voir mon ratio de bonnes réponses par collection.

### Comparaison et Classement

**En tant que :** utilisateur
**Je veux :**

- Comparer mon score par rapport aux autres utilisateurs.
- Avoir un suivi visuel du nombre de questions répondues par jour et de mon ratio de réussite global.

---

## 🍬 Interactions Hardware

### Distributeur de M&Ms

**En tant que :** utilisateur
**Je veux :**

- Pouvoir configurer un pourcentage de chance pour qu'une bonne réponse déclenche une action physique (appel API à l'ESP32 pour actionner le moteur du distributeur).

---

## 👤 Gestion du Profil (Futur)

### Première connexion

**En tant que :** utilisateur
**Je veux :**

- Créer un pseudonyme et l'associer automatiquement à l'adresse MAC de mon appareil pour une reconnaissance simplifiée.

### Gestion des pseudos

**En tant que :** utilisateur
**Je veux :**

- pouvoir associé plusieur appareille (adresse-MAC) a un même pseudots
