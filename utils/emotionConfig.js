// =============================================================
//  emotionConfig.js  (V2)
//  Maps each of the 9 detected emotions to a complete physics
//  + visual profile used by main.js when spawning particles.
// =============================================================

export const EMOTION_CONFIG = {

    // ── JOY 🌟 ────────────────────────────────────────────────
    // Expansive outward spirals, golden yellow, near-frictionless.
    joy: {
        color: '#FFD700',
        glowColor: '#FFA500',
        size: 5,
        speed: 4.5,
        friction: 0.985,
        behaviour: 'joy',
        lifespan: 280,
        count: 110,
        trail: 12,
        bgGlow: 'rgba(255,200,0,0.04)'
    },

    // ── ANGER 🔥 ───────────────────────────────────────────────
    // Explosive burst, inter-particle repulsion, fiery red.
    anger: {
        color: '#FF2200',
        glowColor: '#FF6600',
        size: 7,
        speed: 9,
        friction: 0.935,
        behaviour: 'anger',
        lifespan: 160,
        count: 140,
        trail: 6,
        bgGlow: 'rgba(255,40,0,0.05)'
    },

    // ── SADNESS 💧 ─────────────────────────────────────────────
    // Slow downward drift, inward pull, cool blue, long lifespan.
    sadness: {
        color: '#4488FF',
        glowColor: '#2255CC',
        size: 4,
        speed: 1.8,
        friction: 0.97,
        behaviour: 'sadness',
        lifespan: 360,
        count: 90,
        trail: 14,
        bgGlow: 'rgba(40,80,200,0.04)'
    },

    // ── ANXIETY ⚡ ─────────────────────────────────────────────
    // Fast jitter + sine-wave oscillation, vivid purple.
    anxiety: {
        color: '#CC44FF',
        glowColor: '#9900CC',
        size: 4.5,
        speed: 5.5,
        friction: 0.96,
        behaviour: 'anxiety',
        lifespan: 220,
        count: 120,
        trail: 9,
        bgGlow: 'rgba(150,0,220,0.05)'
    },

    // ── FEAR ⚫ ────────────────────────────────────────────────
    // Fragmented freeze-flight alternation, short bursts, dark slate.
    // Particles accelerate briefly then stall — mimicking the
    // freeze response of acute fear.
    fear: {
        color: '#445566',
        glowColor: '#223355',
        size: 4,
        speed: 6.5,
        friction: 0.91,          // Burns out very fast after burst
        behaviour: 'fear',
        lifespan: 140,
        count: 100,
        trail: 5,
        bgGlow: 'rgba(20,30,60,0.06)'
    },

    // ── CALM 🟢 ───────────────────────────────────────────────
    // Barely-there drift, very high friction, teal, long life.
    // Particles float like dust motes in still air.
    calm: {
        color: '#44DDAA',
        glowColor: '#22BB88',
        size: 3.5,
        speed: 1.2,
        friction: 0.993,         // Extremely slow decay → gentle float
        behaviour: 'calm',
        lifespan: 420,
        count: 70,
        trail: 16,
        bgGlow: 'rgba(40,200,150,0.03)'
    },

    // ── CURIOSITY 🟠 ──────────────────────────────────────────
    // Clockwise swirling arcs around canvas centre, amber.
    curiosity: {
        color: '#FF9933',
        glowColor: '#FF6600',
        size: 4.5,
        speed: 3.5,
        friction: 0.978,
        behaviour: 'curiosity',
        lifespan: 300,
        count: 100,
        trail: 13,
        bgGlow: 'rgba(220,120,0,0.04)'
    },

    // ── GRATITUDE 💛 ──────────────────────────────────────────
    // Slow outward halo expansion, champagne shimmer.
    gratitude: {
        color: '#FFEE88',
        glowColor: '#DDCC44',
        size: 4,
        speed: 2.2,
        friction: 0.988,
        behaviour: 'gratitude',
        lifespan: 350,
        count: 90,
        trail: 15,
        bgGlow: 'rgba(220,200,50,0.03)'
    },

    // ── SHAME 🌸 ──────────────────────────────────────────────
    // Inward contraction + velocity dampening, muted rose-red.
    shame: {
        color: '#DD4477',
        glowColor: '#AA2255',
        size: 4,
        speed: 2.8,
        friction: 0.955,
        behaviour: 'shame',
        lifespan: 190,
        count: 80,
        trail: 8,
        bgGlow: 'rgba(180,40,80,0.04)'
    },

    // ── COURAGE 💙 ────────────────────────────────────────────
    // Upward arc rockets, electric cyan, expanding outward then
    // looping back — like fireworks of confidence.
    courage: {
        color: '#00DDFF',
        glowColor: '#0099CC',
        size: 5.5,
        speed: 6,
        friction: 0.975,
        behaviour: 'courage',
        lifespan: 260,
        count: 100,
        trail: 11,
        bgGlow: 'rgba(0,200,255,0.04)'
    },

    // ── HOPEFUL 🌱 ────────────────────────────────────────────
    // Gentle upward float with soft wavering, mint/sky blue.
    hopeful: {
        color: '#88FFCC',
        glowColor: '#44BBAA',
        size: 4,
        speed: 2.5,
        friction: 0.986,
        behaviour: 'hopeful',
        lifespan: 320,
        count: 85,
        trail: 13,
        bgGlow: 'rgba(80,220,170,0.03)'
    },

    // ── DISCONNECTED 🌫️ ───────────────────────────────────────
    // Slow grey drift inward, fades fast; particles barely alive.
    // Desaturated monochrome to reflect emotional flatness.
    disconnected: {
        color: '#778899',
        glowColor: '#445566',
        size: 3.5,
        speed: 1.5,
        friction: 0.975,
        behaviour: 'disconnected',
        lifespan: 280,
        count: 65,
        trail: 10,
        bgGlow: 'rgba(60,80,100,0.03)'
    },

    // ── STRESS 🔶 ─────────────────────────────────────────────
    // Chaotic short bursts, sickly orange-yellow, rapid falloff.
    stress: {
        color: '#FF8800',
        glowColor: '#CC5500',
        size: 5,
        speed: 7,
        friction: 0.945,
        behaviour: 'stress',
        lifespan: 175,
        count: 130,
        trail: 7,
        bgGlow: 'rgba(200,100,0,0.05)'
    },

    // ── POWERLESS ⚫ ──────────────────────────────────────────
    // Heavy sinking, brownish-grey, strong downward pull.
    powerless: {
        color: '#775544',
        glowColor: '#442211',
        size: 5,
        speed: 1.5,
        friction: 0.968,
        behaviour: 'powerless',
        lifespan: 300,
        count: 75,
        trail: 9,
        bgGlow: 'rgba(60,30,20,0.05)'
    },

    // ── UNSETTLED 🟡 ──────────────────────────────────────────
    // Jittery but slow, murky olive/yellow-green, uncertain arcs.
    unsettled: {
        color: '#BBCC33',
        glowColor: '#889900',
        size: 4,
        speed: 3.2,
        friction: 0.962,
        behaviour: 'unsettled',
        lifespan: 200,
        count: 90,
        trail: 8,
        bgGlow: 'rgba(150,160,0,0.04)'
    },

    // ── TENDER 💕 ─────────────────────────────────────────────
    // Slow warm outward drift, rose-gold, long lifespan, smooth.
    tender: {
        color: '#FFAABB',
        glowColor: '#DD6688',
        size: 4,
        speed: 2,
        friction: 0.99,
        behaviour: 'tender',
        lifespan: 380,
        count: 80,
        trail: 15,
        bgGlow: 'rgba(220,100,150,0.03)'
    }
};

// ── Idle / ambient config ─────────────────────────────────────
export const IDLE_CONFIG = {
    color: '#AAAACC',
    glowColor: '#8888AA',
    size: 3,
    speed: 1.2,
    friction: 0.99,
    behaviour: 'joy',
    lifespan: 300,
    count: 40,
    trail: 5,
    bgGlow: 'rgba(100,100,150,0.02)'
};

// ── UI metadata for all 15 emotions + idle ────────────────────
export const EMOTION_META = {
    joy: { icon: '', label: 'Joy' },
    calm: { icon: '', label: 'Calm' },
    anger: { icon: '', label: 'Anger' },
    fear: { icon: '', label: 'Fear' },
    anxiety: { icon: '', label: 'Anxiety' },
    sadness: { icon: '', label: 'Sadness' },
    shame: { icon: '', label: 'Shame' },
    gratitude: { icon: '', label: 'Gratitude' },
    courage: { icon: '', label: 'Courage' },
    hopeful: { icon: '', label: 'Hopeful' },
    disconnected: { icon: '', label: 'Disconnected' },
    stress: { icon: '', label: 'Stress' },
    powerless: { icon: '', label: 'Powerless' },
    unsettled: { icon: '', label: 'Unsettled' },
    tender: { icon: '', label: 'Tender' },
    idle: { icon: '', label: 'Waiting…' }
};
