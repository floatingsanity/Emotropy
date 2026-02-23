// =============================================================
//  main.js  (V2)
//  Emotropy — Animation orchestrator.
//
//  New in V2:
//    • Multi-emotion blended particle spawning
//    • Additive glow compositing (ctx.globalCompositeOperation='lighter')
//    • Click-to-place attractor / right-click repeller system
//    • 9 emotions supported (imported from updated modules)
// =============================================================

import { Particle } from './particles/Particle.js';
import { detectEmotion } from './utils/emotionDetector.js';
import { EMOTION_CONFIG, IDLE_CONFIG, EMOTION_META } from './utils/emotionConfig.js';
import { getSensationSuggestions } from './utils/bodySensationMapper.js';
import { getPhysicsForSensation } from './utils/sensationPhysicsMapper.js';

// ── Canvas setup ──────────────────────────────────────────────
const canvas = document.getElementById('emotropy-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ── Particle pool ─────────────────────────────────────────────
/** @type {Particle[]} */
let particles = [];
const MAX_PARTICLES = 700;
let uiLocked = false;

// ── Attractor / Repeller system ───────────────────────────────
/**
 * @typedef {{ x:number, y:number, type:'attract'|'repel',
 *             radius:number, strength:number, age:number }} AttractorPoint
 * @type {AttractorPoint[]}
 */
let attractors = [];
const MAX_ATTRACTORS = 3;
const ATTRACTOR_LIFE = 600;   // frames before auto-removing
const ATTRACTOR_R = 160;   // influence radius in px
const ATTRACTOR_STR = 0.22;  // force scalar

// ── Canvas click → place attractor/repeller ──────────────────
canvas.addEventListener('click', (e) => {
    placeAttractor(e.clientX, e.clientY, 'attract');
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    placeAttractor(e.clientX, e.clientY, 'repel');
});

function placeAttractor(x, y, type) {
    if (attractors.length >= MAX_ATTRACTORS) attractors.shift();
    attractors.push({ x, y, type, radius: ATTRACTOR_R, strength: ATTRACTOR_STR, age: 0 });
}

// ── Current emotion (for background glow) ────────────────────
let bgGlowColor = 'rgba(100,100,150,0.02)';
let bgGlowColor2 = 'rgba(100,100,150,0.00)';  // secondary blend colour

// ── UI elements ───────────────────────────────────────────────
const form = document.getElementById('emotion-form');
const textInput = document.getElementById('emotion-input');
const submitBtn = document.getElementById('submit-btn');
const emotionLabel = document.getElementById('emotion-label');
const confidenceEl = document.getElementById('confidence-bar-fill');
const badge = document.getElementById('emotion-badge');
const sensationPanel = document.getElementById('sensation-panel');
const sensationTags = document.getElementById('sensation-tags');
const appContainer = document.getElementById('app');

// ── Spawn particles — blended multi-emotion ───────────────────
/**
 * Spawns particles for a full blend array returned by detectEmotion().
 *
 * @param {Array<{emotion:string, weight:number}>} blend
 * @param {number} totalCount  - Total particle budget for this submission
 * @param {number} bodily      - Bodily sensation multiplier (0.8–2.0)
 */
function spawnBlend(blend, totalCount, bodily) {
    // Remove oldest particles if at cap
    if (particles.length + totalCount > MAX_PARTICLES) {
        particles.splice(0, particles.length + totalCount - MAX_PARTICLES);
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    blend.forEach(({ emotion, weight }) => {
        const config = EMOTION_CONFIG[emotion] ?? IDLE_CONFIG;
        const count = Math.max(1, Math.round(totalCount * weight));

        for (let i = 0; i < count; i++) {
            const spread = Math.min(canvas.width, canvas.height) * 0.12;
            const spawnX = cx + (Math.random() - 0.5) * spread;
            const spawnY = cy + (Math.random() - 0.5) * spread;

            particles.push(new Particle(spawnX, spawnY, {
                ...config,
                speed: config.speed * (0.7 + Math.random() * 0.6),
                lifespan: config.lifespan * (0.8 + Math.random() * 0.4),
                bodily                       // pass bodily intensity to particle
            }));
        }
    });
}

// ── Legacy single-config spawn (for idle boot) ───────────────
function spawnParticles(config) {
    if (particles.length + config.count > MAX_PARTICLES) {
        particles.splice(0, config.count);
    }
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < config.count; i++) {
        const spread = Math.min(canvas.width, canvas.height) * 0.12;
        const spawnX = cx + (Math.random() - 0.5) * spread;
        const spawnY = cy + (Math.random() - 0.5) * spread;
        particles.push(new Particle(spawnX, spawnY, {
            ...config,
            speed: config.speed * (0.7 + Math.random() * 0.6),
            lifespan: config.lifespan * (0.8 + Math.random() * 0.4),
            bodily: 1
        }));
    }
}

// ── Attractor / Repeller forces ───────────────────────────────
function applyAttractors() {
    attractors.forEach(pt => {
        particles.forEach(p => {
            const dx = pt.x - p.x;
            const dy = pt.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < pt.radius) {
                const falloff = 1 - dist / pt.radius;  // 1 at centre, 0 at edge
                const force = pt.strength * falloff;
                if (pt.type === 'attract') {
                    p.applyForce((dx / dist) * force, (dy / dist) * force);
                } else {
                    p.applyForce(-(dx / dist) * force, -(dy / dist) * force);
                }
            }
        });
        pt.age++;
    });

    // Remove expired attractors
    attractors = attractors.filter(pt => pt.age < ATTRACTOR_LIFE);
}

// ── Anger inter-particle repulsion (O(n) sample) ─────────────
function applyRepulsion() {
    const R = 60, F = 0.4;
    const sample = particles.filter(p => p.behaviour === 'anger').slice(0, 80);
    for (let i = 0; i < sample.length; i++) {
        for (let j = i + 1; j < sample.length; j++) {
            const a = sample[i], b = sample[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const dSq = dx * dx + dy * dy;
            if (dSq < R * R && dSq > 0.01) {
                const d = Math.sqrt(dSq), f = F / d;
                a.applyForce(-dx * f, -dy * f);
                b.applyForce(dx * f, dy * f);
            }
        }
    }
}

// ── Emotion UI update ─────────────────────────────────────────
/**
 * @param {string}                              dominantEmotion
 * @param {number}                              confidence
 * @param {Array<{emotion:string,weight:number}>} blend
 */
function updateEmotionUI(dominantEmotion, confidence, blend) {
    const config = EMOTION_CONFIG[dominantEmotion] ?? IDLE_CONFIG;
    const meta = EMOTION_META[dominantEmotion] ?? EMOTION_META.idle;
    bgGlowColor = config.bgGlow;

    // Secondary glow from secondary blend emotion (if present)
    const second = blend?.[1];
    bgGlowColor2 = second ? (EMOTION_CONFIG[second.emotion]?.bgGlow ?? 'transparent') : 'transparent';

    // Fade badge out then swap content
    emotionLabel.style.opacity = '0';

    setTimeout(() => {
        // Build compound label if blend has 2 emotions
        const compoundLabel = blend && blend.length >= 2
            ? `${EMOTION_META[blend[0].emotion]?.label ?? blend[0].emotion} + ${EMOTION_META[blend[1].emotion]?.label ?? blend[1].emotion}`
            : meta.label;

        emotionLabel.textContent = compoundLabel;
        emotionLabel.style.color = config.color;
        emotionLabel.style.opacity = '1';
    }, 200);

    // Confidence bar
    const pct = Math.round(confidence * 100);
    confidenceEl.style.width = `${pct}%`;
    confidenceEl.style.backgroundColor = config.color;
    confidenceEl.style.boxShadow = `0 0 8px ${config.glowColor}`;

    // Pulse animation
    badge.classList.remove('pulse');
    void badge.offsetWidth;
    badge.classList.add('pulse');
}

// ── Body sensation suggestion UI ──────────────────────────────
/**
 * Populates the sensation panel with suggested somatic tags.
 * @param {Array<{emotion:string,weight:number}>} blend
 * @param {string} dominantColor  - Hex colour of dominant emotion
 */
function updateSensationUI(blend, dominantColor) {
    const suggestions = getSensationSuggestions(blend, 4);

    // Clear previous tags
    sensationTags.innerHTML = '';

    suggestions.forEach(label => {
        const tag = document.createElement('span');
        tag.className = 'sensation-tag';
        tag.role = 'button';
        tag.tabIndex = 0;
        tag.textContent = label;
        tag.style.cursor = 'pointer';
        tag.style.pointerEvents = 'auto'; // Re-enable clicks

        // Set CSS variables for this emotion's colour
        tag.style.setProperty('--tag-color', dominantColor);
        tag.style.setProperty('--tag-glow', dominantColor + '33');

        tag.addEventListener('click', (e) => {
            e.stopPropagation();
            spawnSensation(label, e.clientX, e.clientY);

            // Visual feedback on click
            tag.style.transform = 'scale(0.9) translateY(0)';
            setTimeout(() => tag.style.transform = '', 100);
        });

        tag.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tag.click();
            }
        });

        sensationTags.appendChild(tag);
    });

    // Make panel visible
    sensationPanel.classList.add('visible');
}

/**
 * Spawns a burst of particles for a specific physical sensation.
 * @param {string} label 
 * @param {number} x 
 * @param {number} y 
 */
function spawnSensation(label, x, y) {
    const profile = getPhysicsForSensation(label);
    const count = 35;

    // Use click position or centre
    const spawnX = x ?? canvas.width / 2;
    const spawnY = y ?? (canvas.height / 2 + 100);

    for (let i = 0; i < count; i++) {
        const config = {
            ...profile,
            size: (profile.size ?? 4) * 0.8,
            lifespan: (profile.lifespan ?? 200) * 0.7,
            trail: 6
        };
        const p = new Particle(spawnX, spawnY, config);
        // Add random velocity blast
        const angle = Math.random() * Math.PI * 2;
        const mag = Math.random() * 4 + 2;
        p.vx += Math.cos(angle) * mag;
        p.vy += Math.sin(angle) * mag;
        particles.push(p);
    }
}


form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = textInput.value.trim();
    if (!text) return;

    // Detect with full blend + bodily output
    const { emotion, confidence, blend, bodily, total } = detectEmotion(text);

    // Transition from initial state if needed
    const isFirstSubmit = appContainer.classList.contains('state-initial');
    if (isFirstSubmit) {
        appContainer.classList.remove('state-initial');
    }

    // Show loading state
    badge.classList.add('analyzing');
    emotionLabel.textContent = ''; // Clear label to show the 'Analyzing' pseudo-content

    const resultDelay = isFirstSubmit ? 800 : 400;

    setTimeout(() => {
        badge.classList.remove('analyzing');

        if (total === 0) {
            // Clarification system: System isn't sure
            emotionLabel.textContent = 'Unclear';
            emotionLabel.style.color = 'var(--text-muted)';
            confidenceEl.style.width = '0%';

            // Ask for clarification
            textInput.value = '';
            textInput.placeholder = 'Could you describe that feeling more deeply?';
            submitBtn.textContent = 'Feel It';
            submitBtn.disabled = false;
            textInput.disabled = false;
            uiLocked = false;
            return;
        }

        // Lock UI until particles clear (only if we actually spawn results)
        uiLocked = true;
        submitBtn.disabled = true;
        textInput.disabled = true;

        // Update badge (shows compound label for blends)
        updateEmotionUI(emotion, confidence, blend);

        // Spawn proportional blend of particles
        const totalSpawn = blend.length > 1 ? 160 : 120;
        spawnBlend(blend, totalSpawn, bodily);

        // Show body sensation suggestions
        updateSensationUI(blend, EMOTION_CONFIG[emotion]?.color ?? '#FFFFFF');

        // Button feedback
        submitBtn.textContent = 'Visualizing…';
        textInput.value = '';
        textInput.style.height = 'auto'; // Reset height
        textInput.placeholder = 'Wait for current feeling to fade…';
        appContainer.classList.remove('diary-mode');
    }, resultDelay);
});

// ── Diary Mode: Auto-growing Textarea ─────────────────────────
function autoGrow() {
    textInput.style.height = 'auto';
    const newHeight = Math.min(textInput.scrollHeight, 240); // Max grow to 240px
    textInput.style.height = newHeight + 'px';

    // Toggle a 'diary-active' class for styling when text is long
    if (textInput.value.length > 100) {
        appContainer.classList.add('diary-mode');
    } else {
        appContainer.classList.remove('diary-mode');
    }
}

textInput.addEventListener('input', autoGrow);

// Enter to submit (Shift+Enter for newline)
textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
    }
});

// ── Draw attractor indicators ─────────────────────────────────
function drawAttractors() {
    attractors.forEach(pt => {
        const lifeFrac = 1 - pt.age / ATTRACTOR_LIFE;
        const alpha = lifeFrac * 0.5;
        const ringR = pt.radius * (0.1 + 0.06 * Math.sin(pt.age * 0.05));

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';

        // Pulse ring
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = pt.type === 'attract'
            ? `rgba(100,255,200,${alpha})`
            : `rgba(255,100,80,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Centre dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = pt.type === 'attract'
            ? `rgba(100,255,200,${alpha * 2})`
            : `rgba(255,100,80,${alpha * 2})`;
        ctx.fill();

        ctx.restore();
    });
}

// ── Main animation loop ────────────────────────────────────────
function animate() {
    // --- Motion blur via semi-transparent overlay ---
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(8, 8, 20, 0.22)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Background emotion glow (dual-colour blend) ---
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxDim = Math.max(canvas.width, canvas.height);

    const bg1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDim * 0.55);
    bg1.addColorStop(0, bgGlowColor);
    bg1.addColorStop(1, 'transparent');
    ctx.fillStyle = bg1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Secondary emotion colour (blend halo offset slightly)
    if (bgGlowColor2 !== 'transparent') {
        const bg2 = ctx.createRadialGradient(cx * 1.1, cy * 0.9, 0, cx * 1.1, cy * 0.9, maxDim * 0.4);
        bg2.addColorStop(0, bgGlowColor2);
        bg2.addColorStop(1, 'transparent');
        ctx.fillStyle = bg2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // --- Apply physics forces ---
    applyRepulsion();
    applyAttractors();

    // --- ADDITIVE GLOW COMPOSITING ---
    // Particles drawn in 'lighter' mode add their colour channels together.
    // Where many overlap, the result blooms toward white — a plasma/nebula effect.
    ctx.globalCompositeOperation = 'lighter';

    particles.forEach(p => {
        p.update(canvas.width, canvas.height);
        p.draw(ctx);
    });

    // Reset composite mode before drawing UI overlays
    ctx.globalCompositeOperation = 'source-over';

    // --- Draw attractor / repeller indicators ---
    drawAttractors();

    // --- Cull dead particles ---
    particles = particles.filter(p => p.alive);

    // --- Auto-unlock UI when particles are gone ---
    if (uiLocked && particles.length === 0) {
        uiLocked = false;
        submitBtn.disabled = false;
        textInput.disabled = false;
        submitBtn.textContent = 'Feel It';
        textInput.placeholder = 'Type your feelings…';
        textInput.focus();
    }

    requestAnimationFrame(animate);
}

// ── Boot ──────────────────────────────────────────────────────
spawnParticles(IDLE_CONFIG);
updateEmotionUI('idle', 0.5, [{ emotion: 'idle', weight: 1 }]);
animate();
