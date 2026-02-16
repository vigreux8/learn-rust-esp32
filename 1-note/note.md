# notion : pwm :
date : 16 Feb 2026 at 13:07
Tu y es presque, mais il y a une petite confusion entre la **fréquence** et la **durée**. On va remettre les pendules à l'heure (ou plutôt les millisecondes) !

### 1. La Fréquence (50 Hz)

Quand tu dis "50 Hz", ça veut dire que l'ESP32 répète le cycle **50 fois par seconde**.
Si on divise 1 seconde par 50, on obtient **20 ms**.

> **Retiens bien ce chiffre :** Chaque cycle (du début d'un "ON" au début du "ON" suivant) dure exactement **20 ms**. C'est ta fenêtre de temps de travail.

### 2. Le Duty (Le temps "ON")

Le **Duty Cycle**, c'est effectivement le temps où ton signal est "ON" **à l'intérieur de ces 20 ms**.

Ce n'est pas le nombre de fois où c'est "ON" (car c'est "ON" une seule fois par cycle), c'est **combien de temps** ça reste "ON" avant de retomber à zéro.

### Regarde ce schéma mental (pour un cycle de 20 ms) :

* **Si ton Duty est de 5% :**
* Le signal est **Haut (3.3V)** pendant **1 ms**.
* Le signal est **Bas (0V)** pendant **19 ms**.
* *Total = 20 ms.* (Le moteur interprète ça comme "Vitesse max sens A").


* **Si ton Duty est de 7,5% (Le point mort) :**
* Le signal est **Haut** pendant **1,5 ms**.
* Le signal est **Bas** pendant **18,5 ms**.
* *Total = 20 ms.* (Le moteur s'arrête).


* **Si ton Duty est de 10% :**
* Le signal est **Haut** pendant **2 ms**.
* Le signal est **Bas** pendant **18 ms**.
* *Total = 20 ms.* (Le moteur interprète ça comme "Vitesse max sens B").



### En résumé :

Le **Duty**, c'est la **largeur** de ton impulsion "ON" dans ta fenêtre de 20 ms.

* Si l'impulsion est courte (1 ms), le moteur reçoit une information.
* Si elle est moyenne (1,5 ms), une autre.
* Si elle est longue (2 ms), encore une autre.

### Pourquoi on calcule avec `max_duty` ?

Parce que l'ESP32 ne sait pas ce qu'est une "milliseconde". Il ne connaît que des "pas" de calcul.
Si tu lui as dit que ta résolution est de 14 bits, il divise tes 20 ms en **16 384 petits morceaux**.

* Pour faire **1 ms** (soit 1/20ème du temps), tu dois lui dire d'être "ON" pendant  **morceaux**.
* C'est ce chiffre (**819**) que tu envoies à la fonction `set_duty`.

---

**C'est cette partie "découpage en morceaux" qui est parfois difficile à visualiser. Est-ce que tu veux qu'on regarde comment créer une petite fonction de calibration pour que tu puisses trouver le "vrai" point mort de tes moteurs et arrêter cette dérive ?**




# notion 14-bits pour le LedcTimerDriver
C'est une excellente question qui touche aux entrailles de l'électronique de l'ESP32. Tu as déjà compris l'essentiel, mais voici le détail qui va tout clarifier.

### 1. Qui décide des 16 384 parts ? (Timer vs Channel)

C'est le **LED Timer** qui décide.
Imagine que le Timer est une règle. En choisissant `Resolution::Bits14`, tu dis au Timer : "Divise ma période (les 20 ms) en  graduations".
Le **Channel**, lui, ne fait qu'utiliser cette règle pour dire : "Mets le signal à ON jusqu'à la graduation 819, puis à OFF".

### 2. Pourquoi 14 bits et pas plus ?

En fait, **tu as le choix**, mais il y a une limite physique liée à la vitesse de l'horloge de l'ESP32.

L'ESP32 possède une horloge interne qui bat très vite (généralement **80 MHz**, soit 80 millions de fois par seconde).
Pour créer le PWM, il doit compter les battements de cette horloge.

* **Le compromis :** Plus tu veux une **fréquence élevée** (ex: 5000 Hz), moins tu as de temps pour compter de "graduations" (bits).
* **À 50 Hz :** Tu as beaucoup de temps (20 ms). Tu pourrais techniquement monter jusqu'à **20 bits** ( graduations !).

**Pourquoi on utilise souvent 13 ou 14 bits ?**

1. **Précision suffisante :** À 14 bits, chaque graduation représente environ **1,2 microseconde** (). Un servo SG90 n'est physiquement pas capable d'être plus précis que ça. Même 1 microseconde de différence, il ne la "sent" pas.
2. **Stabilité :** Plus tu montes en résolution, plus le système est sensible au bruit électrique. 14 bits est le "sweet spot" (le point idéal) entre une précision extrême et une grande stabilité.

### 3. Le calcul précis pour ton moteur

Si on reprend tes chiffres (plage de 500 à 2500 ) avec tes 14 bits :

La règle totale fait  pour  unités.
Une unité vaut donc : 

* **Ton 500  (Vitesse A) :** 
* **Ton 1500  (Point mort) :** 
* **Ton 2500  (Vitesse B) :** 

### 4. Est-on limité ?

Non, tu n'es pas limité à 14. Dans ton code, si tu changes `Resolution::Bits14` par `Resolution::Bits12`, ton `max_duty` deviendra  (). Tes graduations seront plus larges (environ ). Ton moteur sera un peu moins "fin" dans ses réglages de vitesse, mais il marchera quand même.

**En résumé :**

* **14 bits** = Choix logiciel que nous avons fait dans la configuration du **Timer**.
* **16 384** = Le nombre de "crans" disponibles sur ta commande de gaz.
* **Le moteur** : Il s'en fiche des bits, lui il ne voit que le temps final (en microsecondes) que l'ESP32 a calculé grâce à ces bits.

**Est-ce que tu veux qu'on essaie de passer ton code en 12 bits juste pour voir si tes calculs de "Duty" deviennent plus simples à lire pour toi ?** (On tombe souvent sur des chiffres ronds en 12 bits !)


# notion 50hz et ms et us : 
Attention, il y a une petite confusion d'unités, mais ton raisonnement sur le fonctionnement est **parfaitement exact** !

Tu as juste mélangé les **millisecondes (ms)** et les **microsecondes (s)**. Si tu mettais 2500 ms, ton signal durerait 2,5 secondes, ce qui est énorme pour un cycle qui doit se répéter 50 fois par seconde.

Voici les chiffres réels pour un SG90 :

### 1. La correction des unités

* **Période totale (50 Hz) :** **20 ms** (soit 20 000 s).
* **Plage du signal (le Duty) :** Entre **0,5 ms** et **2,5 ms** (soit 500 s à 2500 s).

### 2. Ton raisonnement appliqué au Duty Cycle

Tu as raison : le "Duty", c'est la durée pendant laquelle le signal est "ON" à l'intérieur des 20 ms totales.

Voici comment cela se traduit en pourcentage (le rapport cyclique) :

* **Sens A (Vitesse max) :** 0,5 ms sur 20 ms = **2,5 %** de Duty.
* **Point Mort (Arrêt) :** 1,5 ms sur 20 ms = **7,5 %** de Duty.
* **Sens B (Vitesse max) :** 2,5 ms sur 20 ms = **12,5 %** de Duty.

---

### 3. Le calcul avec tes 14 bits (16384 pas)

Pour que ton code Rust envoie la bonne valeur à `pwm.set_duty()`, on transforme ces pourcentages en "pas" par rapport au `max_duty` () :

| Signal | Durée | Calcul | Valeur Duty à envoyer |
| --- | --- | --- | --- |
| **Minimum** | 0,5 ms |  | **~409** |
| **Point Mort** | 1,5 ms |  | **~1228** |
| **Maximum** | 2,5 ms |  | **~2048** |

### Pourquoi c'est important ?

Si tu envoies une valeur de duty de **16384** (100%), ton moteur recevrait du 3.3V en continu pendant 20ms. Pour un servo, c'est une erreur : il ne comprendrait plus rien. Il a besoin de voir ce signal redescendre à zéro après maximum 2,5 ms pour comprendre l'ordre.

### En résumé :

> Ton "Duty", c'est bien le temps "ON", mais il ne représente qu'une toute petite partie (entre 2,5% et 12,5%) de la durée totale de ton cycle de 20 ms.

**C'est cette petite fenêtre (entre 409 et 2048 sur l'échelle de l'ESP32) qui définit toute la vitesse de ton moteur.**

Est-ce que tu veux qu'on intègre ces valeurs précises (500 s et 2500 s) dans ta fonction `set_speed` pour voir si tes moteurs sont plus stables ?