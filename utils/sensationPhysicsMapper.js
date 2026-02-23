// =============================================================
//  sensationConfig.js
//  Maps specific somatic sensation words to physics/visual profiles.
//  This allows sensation tags to trigger unique particle bursts
//  when clicked, describing the sensation in motion.
// =============================================================

export const SENSATION_PHYSICS = {
    // ── HOT / BURNING (Anger-like physics) ─────────────────────
    'hot': { color: '#FF4400', behaviour: 'anger', speed: 10, friction: 0.94 },
    'burning': { color: '#FF7700', behaviour: 'anger', speed: 12, friction: 0.92 },
    'pounding': { color: '#FF2244', behaviour: 'anger', speed: 8, friction: 0.95 },

    // ── EXPANDED / OPEN (Joy-like physics) ──────────────────────
    'expanded': { color: '#FFEE44', behaviour: 'joy', speed: 5, friction: 0.985 },
    'radiating': { color: '#FFFFAA', behaviour: 'joy', speed: 4, friction: 0.99 },
    'electric': { color: '#AAFFFF', behaviour: 'joy', speed: 7, friction: 0.97 },
    'vibrant': { color: '#44FF88', behaviour: 'joy', speed: 5, friction: 0.98 },
    'sparkly': { color: '#FFFFFF', behaviour: 'joy', speed: 6, friction: 0.96 },

    // ── LIGHT / AIRY / SPACIOUS (Hopeful/Calm physics) ──────────
    'light': { color: '#CCFFFF', behaviour: 'hopeful', speed: 3, friction: 0.99 },
    'airy': { color: '#EEFFFF', behaviour: 'hopeful', speed: 2.5, friction: 0.995 },
    'spacious': { color: '#AAFFEE', behaviour: 'calm', speed: 1.5, friction: 0.998 },
    'flowing': { color: '#88FFEE', behaviour: 'calm', speed: 2, friction: 0.992 },

    // ── SHAKY / TREMBLY / JUMPY (Anxiety/Fear physics) ──────────
    'shaky': { color: '#CC99FF', behaviour: 'anxiety', speed: 6, friction: 0.95 },
    'trembly': { color: '#BB88EE', behaviour: 'anxiety', speed: 5, friction: 0.96 },
    'jumpy': { color: '#AA66DD', behaviour: 'stress', speed: 7, friction: 0.94 },
    'fluttery': { color: '#FFCCFF', behaviour: 'anxiety', speed: 4, friction: 0.97 },

    // ── HEAVY / SINKING (Sadness/Powerless physics) ───────────
    'heavy': { color: '#556688', behaviour: 'sadness', speed: 1.5, friction: 0.98 },
    'sinking': { color: '#334466', behaviour: 'powerless', speed: 2, friction: 0.97 },
    'hollow': { color: '#99AABB', behaviour: 'disconnected', speed: 1.2, friction: 0.99 },
    'empty': { color: '#778899', behaviour: 'disconnected', speed: 1, friction: 0.995 },

    // ── COLD / FROZEN / NUMB (Fear/Disconnected physics) ───────
    'cold': { color: '#66AAFF', behaviour: 'fear', speed: 4, friction: 0.92 },
    'frozen': { color: '#AAEEFF', behaviour: 'fear', speed: 2, friction: 0.90 },
    'numb': { color: '#B0C4DE', behaviour: 'disconnected', speed: 1, friction: 0.98 },

    // ── TINGLING / BUZZY (Joy/Anxiety blend) ───────────────────
    'tingling': { color: '#FFFFCC', behaviour: 'joy', speed: 3, friction: 0.99 },
    'buzzy': { color: '#CCFFCC', behaviour: 'anxiety', speed: 3.5, friction: 0.975 },
    'vibrating': { color: '#DDFFBB', behaviour: 'anxiety', speed: 5, friction: 0.965 },

    // ── DEFAULT / FALLBACK (Warm/Settled) ───────────────────────
    'default': { color: '#FFFFFF', behaviour: 'calm', speed: 2.5, friction: 0.98 }
};

/**
 * Searches for a close match for a sensation label and returns a physics profile.
 * @param {string} label 
 * @returns {Object}
 */
export function getPhysicsForSensation(label) {
    const key = label.toLowerCase();

    // Exact match
    if (SENSATION_PHYSICS[key]) return SENSATION_PHYSICS[key];

    // Fuzzy match (contains keyword)
    for (const [sensation, profile] of Object.entries(SENSATION_PHYSICS)) {
        if (key.includes(sensation)) return profile;
    }

    // Deep fuzzy (keyword contains the label)
    for (const [sensation, profile] of Object.entries(SENSATION_PHYSICS)) {
        if (sensation.includes(key)) return profile;
    }

    return SENSATION_PHYSICS.default;
}
