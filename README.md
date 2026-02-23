# Emotropy — The Physics of Feeling

> **Transform raw emotion into emergent particle simulations.**

Emotropy is a minimalist, browser-native creative coding project that archetypes human emotion through real-time physics. Using a custom NLP engine and a high-performance particle system, it translates your words and journals into fluid, kinetic art.

---

## ✨ New in the "Diary & Context" Update

- **Diary Mode (Long-form Journaling)**: Support for passages up to **5,000 characters**. The input box auto-grows as you write, turning into a focused writing area.
- **Context-Aware Sentiment Engine**: 
    - **Sentential Analysis**: Analyzes text sentence-by-sentence for a more nuanced emotional profile.
    - **Recency Bias**: Weights the end of your passage more heavily (the "resolution") while maintaining overall context.
    - **Transition Detection**: Identifies shifts like *"but"* and *"however"* to prioritize evolving feelings.
- **Interactive Somatics**: Body sensation tags (e.g., *Electric*, *Heavy*) are now interactive. Click them to trigger a dedicated particle burst that describes that specific sensation.
- **Clarification System**: Intelligent handling for nonsense or neutral text. The system admits when it doesn't understand and invites you to go deeper.
- **Analyzing State**: Sophisticated loading phase with pulsing "Analyzing..." indicators and scanning confidence bars.
- **Adaptive Mobile UI**: Completely refined for every screen size, featuring a compact, tactile layout with a separate interaction layer.

---

## 🧠 The Engine

### Emotion Detection (V2.5)
A custom weighted keyword-scoring engine that processes your input across all 15 categories.
- **Intensifier Boosting**: "Very", "extremely", "deeply" multiply the signal.
- **Negation Handling**: Properly parses "not happy" to flip signals to opponent categories.
- **Blended Profiles**: Surfaces compound feelings (e.g. *Stress + Gratitude*) when signals overlap.
- **Recency Logic**: In long passages, the final sentiment is weighted up to 2x more heavily.

### Particle Physics (The Archetypes)
| Emotion | Visual Archetype | Movement Signature |
| :--- | :--- | :--- |
| **Joy** | ✨ Gold | Radiant outward spirals with long trails |
| **Anxiety** | ⚡ Purple | High-frequency jitter + sine oscillation |
| **Sadness** | 💧 Deep Blue | Heavy downward gravity + inward pull |
| **Stress** | 🔥 Orange | Chaotic direction bursts that change rapidly |
| **Courage** | 🌊 Cyan | Expansive upward arcs like confidence |
| **Calm** | 🟢 Teal | Nearly still, dust-mote floating drift |
| **Gratitude**| 💛 Champagne| Soft radial expanding halo |

---

## 🚀 How to Run

Emotropy is built with zero dependencies. It runs directly in the browser using ES Modules.

1. **Clone** this repository.
2. **Serve** the folder (required for ES Modules):
   ```bash
   # Using Python
   python3 -m http.server
   
   # Or using Node
   npx serve .
   ```
3. **Open** the local URL in any modern browser.

---

## 🛠 Project Structure

```text
Emotropy/
├── index.html               # Semantic HTML shell
├── styles.css               # Design System, animations & mobile layers
├── main.js                  # Simulation loop & UI orchestration
├── particles/
│   └── Particle.js          # Physics engine & rendering logic
└── utils/
    ├── emotionDetector.js   # NLP Engine (V2.5 Context Engine)
    ├── emotionConfig.js     # Visual archetypes & metadata
    ├── bodySensationMapper.js    # Somatic mapping logic
    └── sensationPhysicsMapper.js # Sensation-to-particle physics
```

---

## ⚡ Performance Features
- **Adaptive Frame Skipping**: Manages particle count to maintain silky 60fps.
- **Color Caching**: Static caching of RGBA strings to minimize string parsing overhead.
- **Input Locking**: Prevents UI spamming while one simulation is peaking for maximum focus.
- **Modern Web APIs**: Uses `100dvh` and `clamp()` for perfect layout stability across mobile/desktop.

---

## 📜 License
MIT — Go ahead and remix it.
