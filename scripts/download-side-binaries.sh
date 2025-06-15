#!/bin/bash

# Download required side binaries for development
# Uses the same versions as CI workflows

set -euo pipefail

ARCH="${ARCH:-x86_64-unknown-linux-gnu}"
OLLAMA_VERSION="${OLLAMA_VERSION:-v0.7.1}"
SHINKAI_NODE_VERSION="${SHINKAI_NODE_VERSION:-v1.0.11}"

npx ts-node ./ci-scripts/download-side-binaries.ts

