.Phony: install format check all
all: build preview

install: package.json
		@echo "Installation started." && \
		cd antora-ui-camel && \
		yarn install && cd .. && \
		yarn install

format: package.json
		@echo "Formatting has started" && \
		cd antora-ui-camel && \
		yarn format

check: package.json
		yarn checks

build: package.json
		@echo "Building of Antora UI Theme." && \
		cd antora-ui-camel && \
		yarn build && \
		cd .. && echo "Building of Website." && \
		yarn build

preview: package.json
		@echo "Preview has started" && \
		yarn preview
