# Emotropy — The Physics of Feeling

> **Transform raw emotion into emergent particle simulations.**

Emotropy V2 is a minimalist, browser-native creative coding project that archetypes human emotion through real-time physics. Using a custom NLP engine and a high-performance particle system, it translates your words into fluid, kinetic art.

---

## ✨ New in V2

- **15 Emotional States**: Deep vocabulary expansion covering Joy, Calm, Anger, Fear, Anxiety, Sadness, Shame, Gratitude, Courage, Hopeful, Disconnected, Stress, Powerless, Unsettled, and Tender.
- **Somatic Mapping**: After every feeling, the app suggests likely body sensations (e.g., *Expanded*, *Tight*, *Vibrant*) based on the emotional blend.
- **Performance Optimized**: Rebuilt rendering pipeline with radial gradients, additive glow compositing, and color caching for buttery-smooth 60fps performance even with hundreds of particles.
- **Interactive Forces**: Left-click to place **Attractors** (pull) or Right-click for **Repellers** (push) to manipulate the simulation live.
- **Ultra-Modern Design**: A premium, minimalist aesthetic featuring the *Outfit* typeface, floating animations, and advanced glassmorphism.

---

## 🧠 The Engine

### Emotion Detection
A custom weighted keyword-scoring engine that processes your input across all 15 categories.
- **Intensifier Boosting**: "Deeply", "so", "really" multiply the intensity of the signal.
- **Negation Handling**: Properly parses "not happy" to avoid false positives.
- **Multi-Emotion Blending**: Surfaces compound feelings (e.g. *Joy + Gratitude*) when signals overlap.

### Particle Physics (The Archetypes)
| Emotion | Visual Archetype | Movement Signature |
| :--- | :--- | :--- |
| **Joy** | ✨ Gold | Radiant outward drift with long trails |
| **Anxiety** | ⚡ Purple | High-frequency jitter + sine oscillation |
| **Sadness** | 💧 Deep Blue | Heavy downward gravity + inward contraction |
| **Stress** | 🔥 Orange | Rapid, chaotic direction bursts |
| **Courage** | 🌊 Cyan | Expansive upward arcs |
| **Disconnected**| 🌫 Grey | Listless drift with rapid fade-out |

---

## 🚀 How to Run

Emotropy is built with zero dependencies. It runs directly in the browser using ES Modules.

1. **Clone** this repository.
2. **Serve** the folder (required for ES Modules):
   ```bash
   npx serve .
   # or
   python3 -m http.server
   ```
3. **Open** `http://localhost:3000` in any modern browser.

---

## 🛠 Project Structure

```text
Emotropy/
├── index.html          # Semantic HTML shell
├── styles.css          # Modern "Design System" & animations
├── main.js             # Simulation loop & UI orchestration
├── particles/
│   └── Particle.js     # Physics engine & rendering logic
└── utils/
    ├── emotionDetector.js   # NLP Engine & Vocabulary
    ├── emotionConfig.js     # Visual archetypes & metadata
    └── bodySensationMapper.js  # Somatic mapping logic
```

---

## ⚡ Performance Features
- **Zero shadowBlur**: Replaced expensive shadows with fast radial gradients and additive composition.
- **Color Caching**: Static caching of RGBA strings to minimize string parsing overhead.
- **Input Locking**: Intelligent UI locking prevents spamming until the previous simulation has cleared for maximum focus.

---

## 📜 License
MIT — Go ahead and remix it.
