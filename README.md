# 🍋 LemonadeWrapper

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![.NET](https://img.shields.io/badge/.NET-10.0-purple?logo=dotnet)](https://dotnet.microsoft.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**LemonadeWrapper** is a high-performance, dark-themed web wrapper and user interface for OpenAI-compatible local AI servers (such as Lemonade Server, vLLM, Ollama, LM Studio, or LocalAI). 

It features real-time Server-Sent Events (SSE) token streaming, automatic model discovery, persistent conversation histories powered by SQLite, and a flexible connection manager.

---

## ✨ Features

- ⚡ **Real-Time Token Streaming**: Streams responses seamlessly token-by-token using Server-Sent Events (SSE).
- 🔍 **Dynamic Model Discovery**: Queries your server's `/v1/models` endpoint to automatically detect and populate available AI models.
- 🛑 **Cancellable Connection Test**: Easily abort long-running or hanging server connections with a single click (**✕** button), update the target URL/API key, and retry.
- 💾 **Persistent Chat History**: Saves user sessions and full message history using an embedded SQLite database via Entity Framework Core.
- ⚙️ **Dual-Layer Settings Storage**: Remembers your server URL, API keys, and active model locally in browser storage and server-side disk config for seamless cross-session persistence.
- 🎨 **Modern Aesthetics**: Built with Material UI, styled with custom dark-mode glassmorphic aesthetics, glowing indicators, and micro-animations.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────┐        ┌─────────────────────────────────┐        ┌────────────────────────┐
│      React Client (Vite)        │        │     ASP.NET Core Web API        │        │   OpenAI-Compatible    │
│  - React 19 + TypeScript        │ ─────► │  - EF Core + SQLite Database   │ ─────► │       AI Server        │
│  - Material UI Components       │  HTTP  │  - SSE Proxy Streamer           │  HTTP  │ (vLLM / Lemonade / etc)│
│  - Settings & Chat State        │        │  - Model Discovery Proxy        │        │   /v1/chat/completions │
└─────────────────────────────────┘        └─────────────────────────────────┘        └────────────────────────┘
```

---

## 📋 Prerequisites

Before running the application, make sure you have installed:

- **[.NET 10 SDK](https://dotnet.microsoft.com/download)** (or .NET 9 SDK)
- **[Node.js](https://nodejs.org/)** (v18.0 or higher) & **npm**
- An operational OpenAI-compatible AI server URL (e.g. `http://172.16.0.16:13305` or `http://localhost:11434`)

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally in development mode:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/LemonadeWrapper.git
cd LemonadeWrapper
```

### 2. Start the ASP.NET Core Backend Server

Navigate to the backend server directory and launch the server using `dotnet watch`:

```bash
cd LemonadeWrapper.Server
dotnet watch run --launch-profile https
```

> **Note:** The server automatically initializes the SQLite database file on first run.

### 3. Start the Frontend React Client

Open a second terminal window, navigate to the client directory, install dependencies (first time only), and start Vite dev server:

```bash
cd lemonadewrapper.client
npm install
npm run dev
```

The application will be accessible in your web browser (typically at `http://localhost:5173` or the port shown in your Vite terminal).

---

## 📖 How to Use

1. **Open Server Settings**:
   - Click the Settings (⚙️) icon in the navigation bar.
2. **Configure your AI Endpoint**:
   - Enter your **AI Server URL** (e.g., `http://172.16.0.16:13305`) and optional **API Key**.
3. **Connect & Select Model**:
   - Click **Connect & Fetch Models**.
   - If the server is slow or hanging, click the red **✕ (Cancel)** button to cancel the connection test, edit the URL, and click **Connect & Fetch Models** again.
   - Select your desired AI model from the populated model chips and click **Save**.
4. **Start Chatting**:
   - Create new chat sessions, switch between existing conversations, and enjoy real-time streaming AI responses!

---

## 📁 Project Structure

```text
LemonadeWrapper/
├── LemonadeWrapper.slnx         # Solution file
├── LemonadeWrapper.Server/       # ASP.NET Core Web API
│   ├── Controllers/             # API Endpoints (Chat, Models, Sessions, Settings)
│   ├── Context/                 # Entity Framework Core SQLite DbContext
│   ├── Services/                # Session, Message, and Settings Services
│   ├── Models/                  # Data Models & Request DTOs
│   └── Program.cs               # Application Startup & DI Configuration
└── lemonadewrapper.client/      # Vite + React Frontend
    ├── src/
    │   ├── components/          # UI Components (SettingsModal, ChatWindow, Sidebar)
    │   ├── hooks/               # Custom React Hooks (useSettings, etc.)
    │   ├── services/            # API Client Functions & SSE Streamer
    │   └── types/               # TypeScript Type Definitions
    └── package.json             # Frontend Dependencies & Scripts
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
