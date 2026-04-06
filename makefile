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

install-quizz:
	cd src/network/backend/quizz && npm install
	cd src/network/frontend/quizz && npm install
	@echo "OK: npm install (backend + frontend quizz)."

dev-quizz-backend:
	cd src/network/backend/quizz && npm run start:dev

dev-quizz-frontend:
	cd src/network/frontend/quizz && npm run dev

## Lance Nest (bg) puis Vite au premier plan ; Ctrl+C arrête les deux (trap).
dev-quizz:
	trap 'kill $$BACKEND_PID 2>/dev/null' EXIT INT TERM; \
	cd src/network/backend/quizz && npm run start:dev & \
	BACKEND_PID=$$!; \
	cd src/network/frontend/quizz && npm run dev

## Backend quizz (SQLite)

inject-quizz-db:
	cd src/network/backend/quizz && sqlite3 quizz.db < ddb/last.sql
	@echo "OK: schéma SQL injecté dans quizz.db (backend quizz)."

seed-quizz-db:
	cd src/network/backend/quizz && npx prisma generate && npx prisma db seed
	@echo "OK: données de seed Prisma insérées (backend quizz)."

reset-quizz-db:
	cd src/network/backend/quizz && rm -f quizz.db && sqlite3 quizz.db < ddb/last.sql && npx prisma generate && npx prisma db seed
	@echo "OK: quizz.db recréée et seed exécuté (backend quizz)."
