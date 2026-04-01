## Build targets

.PHONY: all $(MAKECMDGOALS)


build-rust:
	cargo build --release
	@echo "OK: build Rust termine (mode release)."

build-servo:
	cd src/network/frontend-servo && npm run build
	@echo "OK: build frontend-servo termine."

build-quizz:
	cd src/network/frontend-quizz && npm run build
	@echo "OK: build frontend-quizz termine."

preview-servo:
	cd src/network/frontend-servo && npm run preview

preview-quizz:
	cd src/network/frontend-quizz && npm run preview
