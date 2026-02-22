# Emotropy

> **Type your feeling. Watch it become physics.**

Emotropy is a creative coding experiment that translates raw text into emergent particle simulations. The emotional content of what you write — joy, anger, sadness, anxiety — directly determines how hundreds of particles move, collide, and die on screen.

---

## Concept

*Language is energy. Emotropy makes that energy visible.*

When you submit text, a lightweight keyword-scoring engine classifies the dominant emotion and maps it to a unique particle physics profile:

| Emotion  | Behaviour                                   | Colour  |
|----------|---------------------------------------------|---------|
| **Joy**  | Outward radial drift, long trails, low drag | 🟡 Gold |
| **Anger**| Explosive burst, inter-particle repulsion  | 🔴 Red  |
| **Sadness** | Gravitational downward pull + inward drift | 🔵 Blue |
| **Anxiety** | Jitter + sine-wave oscillation             | 🟣 Purple |

---

## Technical Highlights

- **Modular ES Modules** — no bundler needed; runs directly in modern browsers via `type="module"`
- **Particle class** with per-frame force injection, velocity/friction physics, and age-based lifecycle
- **Emotion detector** using weighted keyword lexicons with negation handling (e.g. *"not happy"* → mild sadness signal)
- **Motion-blur trail** rendered via semi-transparent canvas overlay rather than `clearRect`, giving each particle a comet tail automatically
- **Radial gradient glow** on each particle for a premium neon feel
- **O(n) repulsion sampling** for anger particles — avoids O(n²) neighbour checks

---

## How to Run

> **No build step required.**

1. Clone or download this folder.
2. Start a local file server (required for ES Module imports):

```bash
# Option A — Node.js
npx serve .

# Option B — Python
python3 -m http.server 8080
```

3. Open `http://localhost:3000` (or whichever port) in a modern browser.
4. Type something emotional and press **Enter** or click **Feel It**.

---

## Folder Structure

```
Emotropy/
├── index.html                  # HTML shell (canvas + input UI)
├── styles.css                  # Dark glassmorphism design
├── main.js                     # Animation loop + event orchestration
├── particles/
│   └── Particle.js             # Physics entity: position, velocity, forces, draw
└── utils/
    ├── emotionDetector.js      # Keyword lexicon + negation classifier
    └── emotionConfig.js        # Emotion → physics profile mapping
```

---

## Optional Visual Enhancements

### 1. Full Motion Blur (post-process)
Replace the current `rgba(8,8,20, 0.22)` overlay with a dynamic value driven by particle speed for per-particle blur intensity. Alternatively, use a CSS `filter: blur()` on a secondary canvas composited with `globalCompositeOperation: 'lighter'`.

### 2. Additive Glow Compositing
Set `ctx.globalCompositeOperation = 'lighter'` before drawing particles so overlapping glow regions *add* their brightness — creates a plasma/nebula feel with no extra computation.

### 3. Particle Attractors
Add click-to-place attractor points that pull specific emotion-types. Joy particles orbit them; anxiety particles flee them. Makes the simulation interactive beyond text.

### 4. Audio Reactivity (Advanced)
Use the Web Audio API + `AudioContext.createAnalyser()` to sample microphone amplitude and modulate particle `speed` in real-time — speaking excitedly vs. quietly changes simulation intensity.

---

## License

MIT — free to fork, remix, extend.
