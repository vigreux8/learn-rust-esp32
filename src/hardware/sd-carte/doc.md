Ce module est un **lecteur de carte Micro SD** pour microcontrôleurs (comme Arduino, ESP32 ou Raspberry Pi). Il communique via le protocole **SPI** (_Serial Peripheral Interface_).

Voici le rôle de chaque pin, de haut en bas selon ton image :

---

### 1. CS (Chip Select / Selection du composant)

- **Couleur du fil :** Bleu
- **Rôle :** C'est la broche d'activation. Comme le bus SPI peut gérer plusieurs appareils en même temps, le microcontrôleur met cette pin à l'état **BAS (0V)** pour dire à ce module précis : "C'est à toi que je parle".

### 2. SCK (Serial Clock / Horloge)

- **Couleur du fil :** Jaune
- **Rôle :** C'est le chef d'orchestre. Cette pin reçoit les impulsions d'horloge envoyées par le microcontrôleur pour synchroniser la transmission des données. Sans elle, les bits se mélangeraient.

### 3. MOSI (Master Out Slave In)

- **Couleur du fil :** Vert
- **Rôle :** C'est la voie d'entrée des données pour la carte SD. Les informations vont **du microcontrôleur vers la carte SD** (par exemple, pour écrire un fichier ou envoyer une commande).

### 4. MISO (Master In Slave Out)

- **Couleur du fil :** Orange
- **Rôle :** C'est la voie de sortie des données. Les informations vont **de la carte SD vers le microcontrôleur** (par exemple, pour lire le contenu d'un fichier texte).

## Tableau de correspondance des pins

| Pin Lecteur SD | Couleur (sur l'image) | GPIO ESP32 | Justification du choix                                                                                                                                                              |
| -------------- | --------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CS**         | Bleu                  | GPIO 5     | C'est la pin hardware par défaut pour le "Chip Select" du bus VSPI. Utiliser la pin standard évite des erreurs de configuration dans les bibliothèques.                             |
| **SCK**        | Jaune                 | GPIO 18    | C'est la pin d'horloge matérielle (Clock) du VSPI. Directement reliée au moteur haute vitesse de l'ESP32 pour une synchronisation parfaite.                                         |
| **MOSI**       | Vert                  | GPIO 23    | C'est la pin de sortie de données matérielle. Indispensable pour envoyer les commandes d'écriture à la carte SD à la vitesse maximale.                                              |
| **MISO**       | Orange                | GPIO 19    | C'est la pin d'entrée de données matérielle. Utilisée pour lire les fichiers. Comme les GPIO 18, 19 et 23 sont groupées, le signal est plus propre et moins sujet aux parasites.    |
| **VCC**        | Rouge                 | 5V / VIN   | Ton module possède un régulateur 3.3V intégré (le petit composant noir). Il est préférable de l'alimenter en 5V pour que le régulateur fournisse un 3.3V bien stable à la carte SD. |
| **GND**        | Noir                  | GND        | La référence commune. Sans une connexion solide à la masse (GND), les signaux SPI seraient illisibles à cause du bruit électrique.                                                  |
