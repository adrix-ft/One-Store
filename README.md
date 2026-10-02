<div align="center">

  <img src="https://api.iconify.design/lucide/gamepad-2.svg?color=%2318181b" alt="Only Store Logo" width="100" height="100" />

  <h1 align="center">Only Store</h1>

  <p align="center">
    <strong>Ultra-minimalist SaaS storefront for independent game key sellers.</strong>
    <br />
    Effortlessly sell game keys, manage inventory, and process P2P UPI payments.
  </p>

  <p align="center">
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" /></a>
  </p>
  
  <h3>
    <a href="#-about-the-project">About</a>
    <span> · </span>
    <a href="#-key-features">Features</a>
    <span> · </span>
    <a href="#-tech-stack">Tech Stack</a>
    <span> · </span>
    <a href="#-getting-started">Quick Start</a>
  </h3>
</div>

<hr />

## 📖 About The Project

**Only Store** is a modern, ultra-minimalist platform tailored specifically for independent game key sellers. It empowers creators and sellers to host their own fully-functional, beautifully designed custom storefronts in seconds. 

Whether you're selling Steam keys, console codes, or gift cards, **Only Store** provides you with all the essential e-commerce tools—from inventory tracking to seamless peer-to-peer (P2P) UPI payments—without any of the traditional platform bloat or heavy fees. It is built to be fast, beautiful, and highly converting.

---

## ✨ Key Features

### 🏪 Branded Custom Storefronts
Get your own dedicated storefront URL (e.g., `/:store_slug`) featuring a minimalist, high-conversion design tailored for gamers.

### 💳 Zero-Fee P2P UPI Payments
Keep 100% of your earnings. We integrate direct Peer-to-Peer (P2P) UPI payments with dynamic QR code generation, so funds go straight into your bank account.

### 📦 Effortless Inventory & Orders
Manage your entire game catalog, adjust stock levels, and track live orders seamlessly through an intuitive and powerful **Seller Dashboard**. 

### 🤖 AI-Powered Integrations
Integrated with **Google Gemini AI** (`@google/genai`) to help automate store descriptions, marketing copy, and enhance customer interactions.

### 🛡️ Admin & Seller Management
A comprehensive built-in admin panel allows platform owners to manage sellers, oversee subscriptions, and ensure compliance.

---

## 💻 Tech Stack

Our tech stack is built for **speed, scale, and smooth user experiences**:

* **Frontend:** React 19, React Router v7, Tailwind CSS v4, Motion (for smooth micro-animations).
* **Backend:** Express.js running on Node.
* **Database & Auth:** Supabase (PostgreSQL + Auth).
* **AI:** Google Gemini API for intelligent storefront features.
* **Tooling:** Vite for lightning-fast builds, TypeScript for rock-solid type safety, and ESBuild.

---

## 🚀 Getting Started

Want to run this project locally? Follow these simple steps:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/adrix-ft/One-Store.git
cd One-Store
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the project (you can copy from `.env.example`) and fill in your keys:
```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_key_here

# Supabase configuration (if applicable)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
Start the application locally:
```bash
npm run dev
```
Your app will now be running! Open your browser to `http://localhost:5173/` (or the port specified in your terminal).

---

## 📸 Sneak Peek

*(You can replace these placeholder images with actual screenshots of your app!)*

<div align="center">
  <img src="https://placehold.co/800x400/18181b/ffffff?text=Storefront+Preview" alt="Storefront Preview" style="border-radius: 8px; margin-bottom: 20px; width: 100%; max-width: 800px;" />
  <img src="https://placehold.co/800x400/18181b/ffffff?text=Seller+Dashboard" alt="Seller Dashboard" style="border-radius: 8px; width: 100%; max-width: 800px;" />
</div>

<br />

<div align="center">
  <p>Built with ❤️ for independent creators.</p>
</div>
