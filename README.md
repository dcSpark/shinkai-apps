# 🚀 Shinkai Local AI Agents

> **Create Powerful AI Agents using local or remote AIs**

<p align="center">
  <img width="200" src="assets/icon.png" alt="Shinkai logo"/>
</p>

## ✨ What is Shinkai?

Shinkai lets anyone build and run collaborative AI agents that live on your machine or connect to remote models. Whether you want a trading bot, workflow orchestrator, or research assistant, Shinkai gives you the tools to create it.

- **🚀 No-Code Agent Creation** – Build specialized agents in minutes through a friendly UI
- **🤝 Multi-Agent Collaboration** – Agents share information and coordinate complex tasks automatically
- **💰 Crypto-Native** – Built-in support for decentralized payments and transactions
- **🔗 Universal Compatibility** – Works with Model Context Protocol (MCP) so your agents are accessible from Claude, Cursor, and other platforms
- **⚡ Flexible Deployment** – Run locally for privacy, connect to cloud models for power, or mix both approaches
- **🔐 Local-First Security** – Your crypto keys and sensitive computations stay on your device

## 🎬 Demo

[Demo Video](https://github.com/user-attachments/assets/bc5bb7da-7ca5-477d-838a-8239951b6c01)

## 🚀 Quick Start

### 💻 Desktop App (Recommended)
1. Download the latest release for your platform
2. Run the installer and launch Shinkai
3. Start creating agents through the guided UI

### 🔨 Development Setup

#### Prerequisites
- **Node.js** v18+
- **Rust** (for Tauri development)
- **Git**

#### Get Started
```bash
# Clone the repository
git clone https://github.com/dcSpark/shinkai-apps
cd shinkai-apps

# Install dependencies
npm ci

# Start the desktop app in development mode
npx nx serve shinkai-desktop
```

#### Available Commands
```bash
# 🖥️ Desktop App Development
npx nx serve:tauri shinkai-desktop     # Run as desktop app using Vite
npx nx serve shinkai-desktop           # Run as web app at http://localhost:1420

# 🧪 Testing & Quality
npx nx run-many --target=test          # Run all tests
```

## 🏗️ Architecture

```
📦 shinkai-local-ai-agents/
├── 🖥️ apps/shinkai-desktop/       # Cross-platform desktop UI
└── 📚 libs/
    ├── shinkai-artifacts/        # Styled UI primitives
    ├── shinkai-message-ts/       # Message definitions and helpers
    ├── shinkai-node-state/       # State management utilities
    ├── shinkai-ui/               # Reusable React components
    └── shinkai-i18n/             # Translation utilities
```

## 🤝 Contributing

We love contributions! Feel free to open issues, suggest features, or submit pull requests to make Shinkai better.

## 📖 Learn More

- 📚 [Shinkai Documentation](https://docs.shinkai.com)
- 💬 [Community Discord](https://discord.gg/EuA45U3sEu)
- 🐛 [Report Issues](https://github.com/dcSpark/shinkai-apps/issues)

## 📄 License

Shinkai is released under the [Apache 2.0 License](LICENSE).

<div align="center">

**⭐ Star this repo if Shinkai helps you build amazing AI agents!**

</div>
