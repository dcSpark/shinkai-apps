<h1 align="center">
  <img width="36" height="36" src="assets/icon.png"/><br/>
  Shinkai Apps
</h1>

<p align="center">
  <a href="https://github.com/dcSpark/shinkai-apps/stargazers"><img src="https://img.shields.io/github/stars/dcSpark/shinkai-apps?style=social" alt="GitHub stars"></a>
  <a href="https://discord.gg/EuA45U3sEu"><img src="https://img.shields.io/discord/1303749220842340412?color=7289DA&label=Discord&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/ShinkaiProtocol"><img src="https://img.shields.io/twitter/follow/ShinkaiProtocol?style=social" alt="Twitter Follow"></a>
</p>

<p align="center">
  Shinkai is a two-click install AI manager (local and remote) that lets you spin up
  AI agents in minutes through a friendly UI. Agents and tools are all exposed via an
  MCP server.
  <br/>
  <br/>
  A companion repository, <a href="https://github.com/dcSpark/shinkai-node">Shinkai Node</a>,
  provides the core services for agent management, job processing and secure communications.
</p>

## Key Features

- **Rapid Agent Setup** – create and configure agents in under five minutes with a guided UI.
- **Local or Remote** – run everything on your machine or connect to a remote Shinkai Node.
- **MCP Server Integration** – expose agents and tools over an MCP server for easy automation.

## Demo

https://github.com/user-attachments/assets/bc5bb7da-7ca5-477d-838a-8239951b6c01

## Documentation

General Documentation: [https://docs.shinkai.com](https://docs.shinkai.com)

## Repository Structure

### Apps

- **shinkai-desktop** – cross-platform desktop UI (can also run in the browser).

### Libs

- **shinkai-message-ts** – message definitions and network helpers for talking to Shinkai Node.
- **shinkai-node-state** – React Query based state management for node data.
- **shinkai-ui** – reusable React components used across the apps.
- **shinkai-artifacts** – styled UI primitives built on top of Radix and Tailwind.
- **shinkai-i18n** – translation utilities powered by i18next.

## Getting started

To get started first clone this repo:

```
$ git clone https://github.com/dcSpark/shinkai-apps
```

### Download side binaries:

#### Macos

```
ARCH="aarch64-apple-darwin" \
SHINKAI_NODE_VERSION="v1.0.10" \
OLLAMA_VERSION="v0.7.1" \
npx ts-node ./ci-scripts/download-side-binaries.ts
```

#### Linux

```
ARCH="x86_64-unknown-linux-gnu" \
OLLAMA_VERSION="v0.7.1" \
SHINKAI_NODE_VERSION="v1.0.10" \
npx ts-node ./ci-scripts/download-side-binaries.ts
```

#### Windows

```
$ENV:OLLAMA_VERSION="v0.7.1";
$ENV:SHINKAI_NODE_VERSION="v1.0.10";
$ENV:ARCH="x86_64-pc-windows-msvc";
npx ts-node ./ci-scripts/download-side-binaries.ts
```

### Run one of the projects

Once you have done that simply use `npm` to compile/serve it yourself:

```
cd shinkai-apps
nvm use
npm ci
npx nx serve {project-name} # IE: npx nx serve shinkai-desktop
```

### Project specific configurations

- **shinkai-desktop** – for development and building purposes
  - Run as a Desktop App using Vite:
    Run `npx nx serve:tauri shinkai-desktop` and it will automatically launch the Shinkai Desktop application.
  - Run as a Web App:
    Run `npx nx serve shinkai-desktop` and open a browser and navigate to `http://localhost:1420`.

### Useful Commands

Every command, if it's needed, build projects and it's dependencies according to the project dependency tree inferred from imports between them.

- Run a single task

  Command: `npx nx [target] [project-name]`

  Params:

  - target: build | serve | lint | test | e2e

  IE:

  - `npx nx build shinkai-desktop`
  - `npx nx lint shinkai-message-ts`
  - `npx nx test shinkai-ui`
  - `npx nx serve shinkai-desktop`

- Run many tasks

  Command: `npx nx run-many --target=[target]`

  Params:

  - target: build | serve | lint | test | e2e

  IE:

  - `npx nx run-many --target=build`
  - `npx nx run-many --target=lint`
  - `npx nx run-many --target=test`
  - `npx nx run-many --target=e2e`
  - `npx nx run-many --target=serve`

- Run on affected projects

  Command: `npx nx affected --target=[target]`

  Params:

  - target: build | serve | lint | test | e2e

  IE:

  - `npx nx affected --target=build`

> When you build a project, NX builds a cache (to make it faster), if you want to skip it just add the parameter `--skip-nx-cache` to the previous commands.

- Create a dev build

  - `NODE_OPTIONS="--max_old_space_size=8192" npx nx build shinkai-desktop --config="./src-tauri/tauri.conf.development.json"`

- Update ollama models repository
  - `npx ts-node ./ci-scripts/generate-ollama-models-repository.ts`

- Update composio apps repository
  - `deno run -A ./ci-scripts/composio-repository/main.ts`
## Dev conventions

### Monorepo

To orchestrate all the tasks, dependencies and hierarchy between different projects, this repository uses [NX](https://nx.dev/) as a monorepo tooling.

### Third party dependencies

All projects share the same base of dependencies defined `./package.json` file found in the root of the repository. Nested package json files are used just to override or extends base attributes.

### UI Libraries

To build the UI there are 3 core libraries:

- [radix](https://www.radix-ui.com/) to have base unstyled components.
- [shadcn](https://ui.shadcn.com/) to obtain ready to use components.
- [tailwindcss](https://tailwindui.com/) to implement css customizations, structures, layouts and helpers.

### State management

To implement state management there are two different libraries:

- [zustand](https://docs.pmnd.rs/zustand/getting-started/introduction): To implement UI State
- [react-query](https://tanstack.com/query/v4): To implement data state
