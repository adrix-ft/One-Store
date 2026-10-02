<div align="center">
  <img src="https://api.iconify.design/lucide/gamepad-2.svg?color=%2318181b" alt="Only Store Logo" width="80" height="80" />
  
  <h1>Only Store</h1>
  
  <p>
    <strong>Ultra-minimalist SaaS storefront for independent game key sellers.</strong>
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

<hr />

## 🎮 About The Project

**Only Store** is a modern, highly optimized platform tailored for independent game key sellers to host their own custom storefronts. It provides all the essential tools to manage inventory, process orders, and run a streamlined e-commerce operation without the bloat.

## ✨ Features

- 🏪 **Custom Storefronts**: Create and manage your own game key store with a unique storefront URL (`/:store_slug`).
- 📦 **Inventory Management**: Add, update, and manage game keys effortlessly from your dashboard.
- 🛍️ **Order Processing**: Track orders and handle checkouts seamlessly.
- 💳 **P2P UPI Payments**: Support for peer-to-peer UPI payment flow.
- 🛠️ **Admin Dashboard**: A comprehensive dashboard for store owners to monitor sales and manage sellers.

## 💻 Tech Stack

<details>
  <summary>Click to expand</summary>
  <ul>
    <li><strong>Frontend:</strong> React 19, React Router v7, Tailwind CSS v4, Motion</li>
    <li><strong>Backend/API:</strong> Express.js</li>
    <li><strong>Database & Auth:</strong> Supabase</li>
    <li><strong>AI Integration:</strong> Google Gemini API (<code>@google/genai</code>)</li>
    <li><strong>Build Tools:</strong> Vite, TypeScript, ESBuild</li>
  </ul>
</details>

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites

Ensure you have <strong>Node.js</strong> installed on your machine.

### 2. Installation

Clone the repository and install the required dependencies:

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and configure the necessary keys. See `.env.example` for reference.

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Development Server

Start the local development server:

```bash
npm run dev
```

Your application should now be running.
