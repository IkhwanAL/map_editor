APP_NAME = map_editor
PKG = ./...

ifeq ($(OS),Windows_NT)
	BIN_NAME = $(APP_NAME).exe
else
	BIN_NAME = $(APP_NAME)
endif

run:
	@echo "🏃 Running $(APP_NAME) with race detection..."
	templ generate
	go run -race main.go

generate:
	@echo "🧩 Generating templ + tailwind..."
	templ generate

tests:
	@echo "🧪 Running tests with race detection..."
	go test -race -v $(PKG)

lint:
	@echo "🔍 Linting with staticcheck..."
	staticcheck $(PKG)

fmt:
	go fmt $(PKG)

build:
	@echo "Im Building A Go Binary"
	templ generate
	go build -race -o bin/$(BIN_NAME) main.go
