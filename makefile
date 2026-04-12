## Build targets

.PHONY: all $(MAKECMDGOALS)


build-rust:
	cargo build --release
	@echo "OK: build Rust termine (mode release)."

send-esp32:
	cargo run --release
	@echo "OK: flash + monitor vers ESP32 termine."

build-servo:
	cd src/network/frontend/pilotage_servo_moteur && npm run build
	@echo "OK: build frontend pilotage_servo_moteur termine."

build-quizz:
	cd src/network/frontend/quizz && npm run build
	@echo "OK: build frontend quizz termine."

build-quizz-backend:
	cd src/network/backend/quizz && npm run build
	@echo "OK: build backend Nest quizz termine."

build-bouton:
	cd src/network/frontend/reglage_bouton && npm run build
	@echo "OK: build frontend reglage_bouton termine."

preview-servo:
	cd src/network/frontend/pilotage_servo_moteur && npm run preview

preview-quizz:
	cd src/network/frontend/quizz && npm run preview

preview-bouton:
	cd src/network/frontend/reglage_bouton && npm run preview

## Quizz — dépendances, dev (API + Vite), prod
# Port d’écoute Nest (aligné sur src/network/backend/quizz/src/main.ts). Ex. : QUIZZ_BACKEND_PORT=4000 make run-quizz-backend
QUIZZ_BACKEND_PORT ?= 3001

install-quizz:
	cd src/network/backend/quizz && npm install
	cd src/network/frontend/quizz && npm install
	@echo "OK: npm install (backend + frontend quizz)."

run-quizz-backend:
	cd src/network/backend/quizz && PORT=$(QUIZZ_BACKEND_PORT) npm run start:dev

run-quizz-frontend:
	cd src/network/frontend/quizz && npm run dev

## Lance Nest (bg) puis Vite au premier plan ; Ctrl+C arrête les deux (trap).
dev-quizz:
	trap 'kill $$BACKEND_PID 2>/dev/null' EXIT INT TERM; \
	cd src/network/backend/quizz && PORT=$(QUIZZ_BACKEND_PORT) npm run start:dev & \
	BACKEND_PID=$$!; \
	cd src/network/frontend/quizz && npm run dev

## Backend quizz (SQLite)
# Chemins relatifs à la racine
# --- Variables de configuration ---
QUIZZ_DIR   = src/network/backend/quizz
DB_NAME     = quizz.db
SQL_INJECT  = ddb/inject.sql
SCHEMA_PATH = prisma/schema.prisma

# --- Commandes ---

inject-quizz-db:
	@echo "--- 1. Reset physique de la DB ---"
	# Suppression et recréation de la base SQLite
	cd $(QUIZZ_DIR) && rm -f $(DB_NAME)
	cd $(QUIZZ_DIR) && sqlite3 $(DB_NAME) < $(SQL_INJECT)
	
	@echo "--- 2. Nettoyage du schéma (Header 7 lignes) ---"
	# On vide les anciens modèles pour éviter les erreurs de doublons (P1012)
	cd $(QUIZZ_DIR) && head -n 7 $(SCHEMA_PATH) > $(SCHEMA_PATH).tmp && mv $(SCHEMA_PATH).tmp $(SCHEMA_PATH)
	
	@echo "--- 3. Synchronisation Prisma (Pull & Generate) ---"
	# Introspection de la nouvelle DB et mise à jour du client
	cd $(QUIZZ_DIR) && npx prisma db pull --schema=$(SCHEMA_PATH)
	cd $(QUIZZ_DIR) && npx prisma generate --schema=$(SCHEMA_PATH)
	
	@echo "--- 4. Données démo (MAC simulée + questions) ---"
	cd $(QUIZZ_DIR) && npx prisma db seed
	
	@echo "✅ Terminé : La base est prête, le schéma synchronisé, le seed démo exécuté."

	
seed-quizz-db:
	cd src/network/backend/quizz && npx prisma generate && npx prisma db seed
	@echo "OK: données de seed Prisma insérées (backend quizz)."

reset-quizz-db:
	cd src/network/backend/quizz && rm -f quizz.db && sqlite3 quizz.db < ddb/inject.sql && npx prisma generate && npx prisma db seed
	@echo "OK: quizz.db recréée et seed exécuté (backend quizz)."
