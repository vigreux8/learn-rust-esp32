## 1. Pourquoi est-ce "mieux" qu’un ORM ici ?

- **Empreinte mémoire**  
  Un ORM (comme SeaORM) va générer énormément de code générique pour gérer tous les cas possibles. `rusqlite` ne compile que ce dont tu as besoin. Sur une ESP32, chaque ko de RAM compte.

- **Contrôle total**  
  Avec 5 tables, tu vas souvent faire des jointures (ex : lier un `User` à une `ServoConfig`). En écrivant le SQL toi-même, tu es sûr que la requête est optimisée pour la vitesse de ta carte SD.

- **Débogage facile**  
  Si une requête échoue sur l’ESP32, le message d’erreur de SQLite est direct.  
  Avec un ORM, il faut parfois fouiller dans les logs pour comprendre quel SQL il a généré en secret.

---

## 2. Comment organiser proprement le code (sans ORM)

Pour ne pas avoir de code "sale", utilise le pattern Repository. Crée un fichier par table :

```rust
// src/hardware/database/servo_repo.rs

pub struct ServoRepository<'a> {
    conn: &'a Connection,
}

impl<'a> ServoRepository<'a> {
    pub fn save_angle(&self, id: i32, angle: i32) -> Result<()> {
        self.conn.execute(
            "UPDATE servos SET angle = ?1 WHERE id = ?2",
            params![angle, id],
        )?;
        Ok(())
    }

    pub fn get_all(&self) -> Result<Vec<Servo>> {
        // ... ta requête SELECT ici
    }
}
```
