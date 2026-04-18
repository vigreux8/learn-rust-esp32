# 1. `esp-idf-hal` : **Le matériel (Hardware)**

- **Signification** : _HAL_ = _Hardware Abstraction Layer_.
- **Rôle** : Dialogue directement avec les registres de la puce ESP32 pour gérer les signaux électriques — c’est la couche qui interagit le plus près possible du matériel.
- **Utilisation dans ce projet** :
  - Située dans `src/hardware/`
  - Sert à configurer le PWM (LEDC), manipuler les GPIO, gérer les Timers des servomoteurs.
- **"Bare Metal" ?**
  - Pas totalement "nu" : repose sur les drivers d’Espressif, mais il s’agit de la couche la plus basse possible avant l’électricité.

---

# 2. `esp-idf-svc` : **Les services (Services)**

- **Signification** : _SVC_ = _Services_.
- **Rôle** : Prend en charge des fonctionnalités de haut niveau, requérant souvent un système d’exploitation (ex : FreeRTOS).
- **Utilisation dans ce projet** :
  - Se trouve dans `src/network/`
  - Gère le Wi-Fi, le serveur HTTP, le DNS mDNS, et les WebSockets.
- **Mission** : Orchestration de tâches complexes qui tournent en arrière-plan pendant l’exécution du code principal.

---
