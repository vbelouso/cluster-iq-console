VERSION := $(shell cat VERSION)
IMAGE_TAG := $(shell git rev-parse --short=7 HEAD)
CONTAINER_ENGINE ?= $(shell which pod >/dev/null 2>&1 && echo pod || echo docker)
K8S_CLI ?= $(shell which oc >/dev/null 2>&1 && echo oc || echo kubectl)
REGISTRY ?= quay.io
PROJECT_NAME ?= cluster-iq
REGISTRY_REPO ?= ecosystem-appeng
CONSOLE_IMG_NAME ?= $(PROJECT_NAME)-console
CONSOLE_IMAGE ?= $(REGISTRY)/$(REGISTRY_REPO)/${CONSOLE_IMG_NAME}

# Help message
define HELP_MSG
Makefile Rules:
	clean: Removes local container images
	compile: Builds the Console on local
	build: Builds the Console on a Container image
	push: Pushes every container image into remote repo
	start-dev: Starts a local environment using 'docker/$(CONTAINER_ENGINE)-compose'
	test: Runs test
	checks: Runs linters and format
	help: Displays this message
endef
export HELP_MSG

clean:
	@echo "### [Cleanning building] ###"
	@npm run clean

compile:
	@echo "### [Building project] ###"
	@npm run build

build:
	@echo "### [Building project's docker image] ###"
	@$(CONTAINER_ENGINE) build -t $(CONSOLE_IMAGE):latest -f ./Dockerfile --build-arg="VERSION=${VERSION}" .
	@$(CONTAINER_ENGINE) tag $(CONSOLE_IMAGE):latest $(CONSOLE_IMAGE):${VERSION}
	@$(CONTAINER_ENGINE) tag $(CONSOLE_IMAGE):latest $(CONSOLE_IMAGE):${IMAGE_TAG}
	@echo "Build Successful"

build-local:
	@echo "### [Building project in local] ###"
	@npm install --save && npm run build --legacy-peer-deps
	@echo "Build Successful"

push:
	@$(CONTAINER_ENGINE) push $(CONSOLE_IMAGE):latest
	@$(CONTAINER_ENGINE) push $(CONSOLE_IMAGE):${VERSION}
	@$(CONTAINER_ENGINE) push $(CONSOLE_IMAGE):${IMAGE_TAG}


start-dev: export REACT_APP_CIQ_API_URL = http://localhost:8081
start-dev:
	@echo "### [Starting project DEV MODE] ###"
	@echo "### [API-URL: $$REACT_APP_CIQ_API_URL] ###"
	@npm run start

test: checks
	@echo "### [Running tests] ###"
	@npm run test:coverage

checks: lint format

lint:
	@npm run lint

format:
	@npm run format

.DEFAULT_GOAL := help
help:
	echo "$$HELP_MSG"
