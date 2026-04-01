# techno :

1. Axum et Rocket : Les "Gros" Serveurs
   Axum et Rocket sont les frameworks web les plus populaires en Rust... mais pour les ordinateurs (serveurs Cloud, PC).

Axum : Très moderne, rapide, utilisé par les pros.

Rocket : Très facile à utiliser, mais un peu "lourd".

Pour ton ESP32 : Oublie-les. Ils sont trop gourmands en ressources. Reste sur esp-idf-svc. C'est le serveur natif d'Espressif (le fabricant de l'ESP32). Il est léger et fait exactement ce qu'il faut pour un microcontrôleur.

# todo :

- voire leur date de création créateur et qui la crée et pourquoi pour (pour faire l'histoire et savoir qui est moderne ou non)
