## Build targets

.PHONY: all $(MAKECMDGOALS)


build-rust:
	cargo build --release
	@echo "OK: build Rust termine (mode release)."

send-esp32:
	cargo run --release
	@echo "OK: flash + monitor vers ESP32 termine."

build-servo:
	cd src/network/frontend-servo && npm run build
	@echo "OK: build frontend-servo termine."

build-quizz:
	cd src/network/frontend-quizz && npm run build
	@echo "OK: build frontend-quizz termine."

build-bouton:
	cd src/network/frontend-bouton && npm run build
	@echo "OK: build frontend-bouton termine."

preview-servo:
	cd src/network/frontend-servo && npm run preview

preview-quizz:
	cd src/network/frontend-quizz && npm run preview

preview-bouton:
	cd src/network/frontend-bouton && npm run preview
