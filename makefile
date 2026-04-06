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
	cd src/network/frontend/quizz/frontend && npm run build
	@echo "OK: build frontend quizz termine."

build-bouton:
	cd src/network/frontend/reglage_bouton && npm run build
	@echo "OK: build frontend reglage_bouton termine."

preview-servo:
	cd src/network/frontend/pilotage_servo_moteur && npm run preview

preview-quizz:
	cd src/network/frontend/quizz/frontend && npm run preview

preview-bouton:
	cd src/network/frontend/reglage_bouton && npm run preview

## Backend quizz (SQLite)

inject-quizz-db:
	cd src/network/backend/quizz && sqlite3 quizz.db < ddb/v1.sql
	@echo "OK: schéma SQL injecté dans quizz.db (backend quizz)."
