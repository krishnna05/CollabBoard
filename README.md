# CollabBoard

**Real-Time Collaborative Whiteboard | WebSockets • React • Node.js**

**CollabBoard** is a high-performance, real-time collaborative whiteboard built to demonstrate production-grade WebSocket engineering, low-latency event synchronization, and clean frontend–backend separation.
It enables multiple users to draw, brainstorm, and collaborate simultaneously with near-instant updates across all connected clients.

This project is intentionally **not a CRUD app**—it focuses on **real-time systems, state synchronization, and performance-critical UI rendering**, making it a strong demonstration of modern full-stack engineering skills.

---

## ✨ Key Highlights 

* ⚡ **Low-Latency Real-Time Collaboration** using WebSockets (Socket.io)
* 🧠 **Optimistic UI Rendering** for zero-lag drawing experience
* 🧩 **Modular Backend Architecture** with clean socket handler separation
* 🎨 **Canvas-Based Rendering Engine** with undo/redo state management
* 🖥️ **Modern, Responsive UI** with glassmorphism design principles
* 🏗️ Designed with **scalability and extensibility** in mind

---

## 🚀 Core Features

### Real-Time Collaboration

* Live synchronization of drawing strokes across all connected clients
* Efficient room-based broadcasting to avoid redundant re-renders
* Event-driven architecture optimized for frequent updates

### Live User Presence

* Real-time cursor movement tracking
* Visible participant identity and active drawing color
* Ephemeral state handling (non-persistent, high-frequency data)

### Drawing Toolkit

* Freehand drawing with dynamic color selection
* Eraser tool
* Client-side **Undo / Redo** stack for instant responsiveness
* One-click canvas reset

### Responsive Canvas System

* Infinite-feel canvas experience
* Automatically adapts to screen resizing and mobile viewports
* Optimized redraw logic for smooth performance

### UI & Experience

* Glassmorphism-inspired interface
* Tailwind CSS v4 for consistent design tokens
* Lucide iconography for clean visuals

---

## 🛠️ Technology Stack

### Frontend

* **React 19** (Functional Components, Hooks)
* **Vite** (Fast build & HMR)
* **Tailwind CSS v4**
* **React Router DOM v7**
* **HTML5 Canvas API**
* **socket.io-client**
* Custom Hooks (`useDraw`) for canvas + socket abstraction

### Backend

* **Node.js**
* **Express.js**
* **Socket.io** (WebSocket transport)
* **MongoDB + Mongoose** (for future persistence support)
* Modular socket handler pattern:

  * `drawHandler`
  * `cursorHandler`
  * `roomHandler`

---

## 🏗️ Architecture & Engineering Decisions

### 1️⃣ Optimistic Rendering Strategy

To eliminate perceptible input lag:

* Drawing is rendered **locally first** on the Canvas
* Socket events are emitted asynchronously
* Server broadcasts updates only to *other users in the room*

---

### 2️⃣ Clean Socket Event Architecture

Instead of a monolithic server:

* Socket logic is divided by responsibility
* Improves maintainability and debugging
* Enables easy extension of features without breaking core flows

**Handlers**

* `cursorHandler.js` → High-frequency ephemeral cursor data
* `drawHandler.js` → Stroke events and canvas actions
* `roomHandler.js` → Room lifecycle and user presence

---

### 3️⃣ Shared Event Contracts

A centralized `events.js` file defines all socket event names, ensuring:

* No magic strings
* Strong client–server contract
* Safer refactoring and scalability

---

## 💻 Local Development Setup

### Prerequisites

* Node.js **v18+**
* MongoDB (Local or Atlas)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CollabBoard.git
cd CollabBoard
```

---

### 2. Backend Setup

```bash
cd Backend
npm install

# Create environment variables
PORT=5000
MONGO_URI=mongodb://localhost:27017/collabboard
CLIENT_URL=http://localhost:5173

# Start backend
npm run dev
```

---

### 3. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

### 4. Run the App

Visit: **[http://localhost:5173](http://localhost:5173)**
Open multiple tabs or devices to test real-time collaboration.

---

## 📁 Project Structure

```text
CollabBoard/
├── Backend/
│   ├── config/          # Database & environment setup
│   ├── handlers/        # Socket.io event handlers
│   ├── models/          # Mongoose schemas (Stroke.js)
│   ├── src/             # Server entry point
│   └── utils/           # Shared socket event constants
│
└── Frontend/
    ├── public/          # Static assets
    ├── src/
    │   ├── components/  # Canvas, UI components
    │   ├── hooks/       # Custom hooks (useDraw)
    │   ├── services/    # Socket configuration
    │   └── App.jsx      # Application root
```

---

## 🔮 Planned Enhancements

* Board persistence & session recovery (MongoDB)
* Canvas export (PNG / PDF)
* Shape tools (Rectangles, Circles, Arrows)
* Optional authentication (JWT / OAuth)
* Performance profiling for large rooms

---

## 📄 License

ISC License

---
