// =============================================================
//  bodySensationMapper.js
//  Maps detected emotion categories to likely somatic (body)
//  sensations based on nervous system science and somatic
//  psychology research.
//
//  Each emotion has a primary list (most common) and a secondary
//  list (less common but possible). The UI shows a random sample
//  of 3–5 suggestions drawn from the primary list of all active
//  emotions in the blend.
//
//  The suggestions are phrased as gentle invitations, not diagnoses.
// =============================================================

// ── Emotion → Body Sensation Map ────────────────────────────
// Values are arrays of sensation words from the comprehensive list.
// Organised by most → least commonly felt for that emotion.
const SENSATION_MAP = {

    joy: [
        'Warm', 'Expanded', 'Light', 'Flowing', 'Buzzy',
        'Sparkly', 'Radiating', 'Electric', 'Tingling',
        'Vibrating', 'Pulsing', 'Airy', 'Spacious'
    ],

    calm: [
        'Settled', 'Soft', 'Smooth', 'Still', 'Relaxed',
        'Loose', 'Slow', 'Spacious', 'Gentle', 'Flowing',
        'Warm', 'Full', 'Spacey'
    ],

    anger: [
        'Hot', 'Pounding', 'Tight', 'Burning', 'Clenched',
        'Knotted', 'Rigid', 'Tense', 'Throbbing', 'Stiff',
        'Prickly', 'Constricted', 'Blocked'
    ],

    fear: [
        'Frozen', 'Shaky', 'Cold', 'Trembly', 'Constricted',
        'Breathless', 'Clammy', 'Numb', 'Jumpy', 'Icy',
        'Knotted', 'Breathless', 'Wobbly'
    ],

    anxiety: [
        'Tight', 'Breathless', 'Jumpy', 'Fluttery', 'Trembly',
        'Knotted', 'Shaky', 'Buzzy', 'Twitchy', 'Queasy',
        'Prickly', 'Constricted', 'Clammy'
    ],

    sadness: [
        'Heavy', 'Hollow', 'Dull', 'Achy', 'Contracted',
        'Slow', 'Drained', 'Sore', 'Numb', 'Empty',
        'Wooden', 'Fluid', 'Still'
    ],

    shame: [
        'Hot', 'Clammy', 'Tight', 'Burning', 'Contracted',
        'Hollow', 'Heavy', 'Sore', 'Constricted', 'Bruised',
        'Rigid', 'Numb'
    ],

    gratitude: [
        'Warm', 'Expanded', 'Full', 'Radiating', 'Flowing',
        'Soft', 'Gentle', 'Spacious', 'Pulsing', 'Tenderness',
        'Glowing', 'Settled', 'Light'
    ],

    courage: [
        'Expanded', 'Electric', 'Warm', 'Pulsing', 'Radiating',
        'Full', 'Light', 'Strong', 'Spacious', 'Vibrating',
        'Buzzy', 'Open', 'Flowing'
    ],

    hopeful: [
        'Light', 'Airy', 'Expanded', 'Fluttery', 'Warm',
        'Flowing', 'Soft', 'Spacious', 'Pulsing', 'Tingling',
        'Releasing', 'Gentle'
    ],

    disconnected: [
        'Numb', 'Empty', 'Hollow', 'Wooden', 'Cold',
        'Frozen', 'Slow', 'Dull', 'Spacey', 'Heavy',
        'Drained', 'Contracted', 'Blocked'
    ],

    stress: [
        'Tense', 'Tight', 'Knotted', 'Drained', 'Pounding',
        'Clenched', 'Rigid', 'Hot', 'Shaky', 'Constricted',
        'Throbbing', 'Stiff', 'Breathless'
    ],

    powerless: [
        'Heavy', 'Contracted', 'Wooden', 'Numb', 'Drained',
        'Hollow', 'Slow', 'Collapsed', 'Cold', 'Blocked',
        'Suffocated', 'Rigid', 'Still'
    ],

    unsettled: [
        'Jumpy', 'Fluttery', 'Wobbly', 'Shaky', 'Constricted',
        'Queasy', 'Twitchy', 'Buzzy', 'Knotted', 'Prickly',
        'Ungrounded', 'Cold', 'Tight'
    ],

    tender: [
        'Soft', 'Warm', 'Full', 'Gentle', 'Flowing',
        'Expanded', 'Pulsing', 'Releasing', 'Smooth', 'Sensitive',
        'Light', 'Open', 'Spacious'
    ],

    idle: [
        'Neutral', 'Still', 'Settled', 'Soft', 'Gentle'
    ]
};

// ── Suggestion Generator ────────────────────────────────────
/**
 * Returns a deduplicated, weighted random sample of body sensation
 * suggestions based on a blend array from detectEmotion().
 *
 * @param {Array<{emotion:string, weight:number}>} blend
 * @param {number} count - How many sensations to return (default 4)
 * @returns {string[]}  - Array of sensation label strings
 */
export function getSensationSuggestions(blend, count = 4) {
    if (!blend || blend.length === 0) return [];

    // Build a weighted pool: top-weight emotions contribute more candidates
    const pool = [];
    blend.forEach(({ emotion, weight }) => {
        const sensations = SENSATION_MAP[emotion] ?? [];
        // Number of candidates drawn from this emotion proportional to weight
        const draw = Math.min(sensations.length, Math.max(3, Math.round(sensations.length * weight)));
        // Shuffle and take `draw` items
        const shuffled = [...sensations].sort(() => Math.random() - 0.5).slice(0, draw);
        shuffled.forEach(s => pool.push(s));
    });

    // Deduplicate and shuffle the full pool
    const unique = [...new Set(pool)].sort(() => Math.random() - 0.5);

    // Return only `count` items
    return unique.slice(0, count);
}
