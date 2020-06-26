.Phony: install format check all
all: build preview

install: package.json
		@echo "Installation started." && \
		yarn --cwd antora-ui-camel/ install && \
		yarn install

format: package.json
		@echo "Formatting has started" && \
		yarn --cwd antora-ui-camel/ format

check: package.json
		yarn checks

build: package.json
		@echo "Building of Antora UI Theme." && \
		yarn --cwd antora-ui-camel/ build && \
		echo "Building of Website." && \
		yarn build

preview: package.json
		@echo "Preview has started" && \
		yarn preview
