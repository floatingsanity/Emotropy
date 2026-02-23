// =============================================================
//  emotionDetector.js  (V2 — Full Vocabulary)
//  15-category emotion classifier with ~200+ word lexicon.
//  Handles single words, phrases, and long paragraphs equally.
//
//  Smart features:
//    • Intensifier boosting (very, so, really → weight ×1.5)
//    • Negation inversion (not happy → sadness/anxiety signal)
//    • Paragraph-normalised scoring (total sum → weights)
//    • Multi-emotion blend array (top emotions above threshold)
//    • Bodily sensation cross-tag (somatic intensity multiplier)
//
//  Return shape:
//    emotion    {string}   dominant emotion key
//    confidence {number}   0–1 share of total score
//    scores     {Object}   raw score per emotion
//    blend      {Array}    [{ emotion, weight }, …] above threshold
//    bodily     {number}   0–2 body-sensation intensity multiplier
// =============================================================

// ── Negation words ───────────────────────────────────────────
const NEGATION_WORDS = new Set([
    'not', 'no', 'never', 'neither', 'nor', 'without',
    "can't", 'cannot', "couldn't", "won't", "don't", "didn't",
    "isn't", "wasn't", 'hardly', 'barely', 'nothing', 'none',
    'lack', 'lacking', 'without', 'unable', 'refuse'
]);

// ── Intensifier words ────────────────────────────────────────
// When one of these appears before an emotion word, boost weight × 1.5
const INTENSIFIERS = new Set([
    'very', 'so', 'really', 'extremely', 'incredibly', 'deeply',
    'profoundly', 'overwhelmingly', 'utterly', 'absolutely', 'completely',
    'totally', 'truly', 'beyond', 'intensely', 'hugely', 'especially',
    'particularly', 'terribly', 'awfully', 'dreadfully', 'insanely',
    'ridiculously', 'super', 'quite', 'rather', 'fairly'
]);

// ── Emotion Lexicons ─────────────────────────────────────────
// Organised as { word: baseWeight }. Higher = stronger signal.
// Words shared across categories are assigned to the dominant one.
const LEXICONS = {

    // ── 1. JOY / ALIVENESS ─────────────────────────────────────
    joy: {
        happy: 2, happiness: 2, joy: 3, joyful: 3, joyous: 2,
        bliss: 3, blissful: 3, ecstatic: 3, elated: 3, euphoric: 3,
        excited: 2, excitement: 2, thrilled: 2, exhilarated: 2.5,
        delighted: 2.5, delight: 2, wonderful: 2, amazing: 2,
        fantastic: 2, great: 1.5, awesome: 2, incredible: 2,
        magnificent: 2, radiant: 2.5, vibrant: 2.5, alive: 2,
        aliveness: 2.5, energized: 2.5, invigorated: 2.5, lively: 2,
        enthusiastic: 2.5, enthusiasm: 2, eager: 2, eagerness: 2,
        passionate: 2, passion: 2, inspired: 2, inspiration: 1.5,
        refreshed: 2, rejuvenated: 2, renewed: 2, revived: 2,
        satisfied: 1.5, satisfaction: 1.5, playful: 2, playfulness: 2,
        fun: 1.5, laugh: 1.5, laughing: 1.5, smile: 1.5, smiling: 1.5,
        celebrate: 2, celebration: 2, win: 1.5, winning: 1.5,
        free: 1.5, freedom: 2, liberated: 2, enchanted: 2.5,
        amazed: 2.5, awe: 2.5, wonder: 2, awed: 2.5,
        engaged: 1.5, engagement: 1.5, stimulated: 1.5, love: 2,
        good: 1, nice: 1, yay: 2, wow: 1.5, yeah: 1
    },

    // ── 2. CALM / ACCEPTING / OPEN ───────────────────────────────
    calm: {
        calm: 2.5, calming: 2, calmed: 2, serene: 3, serenity: 3,
        peaceful: 2.5, peace: 2, tranquil: 3, tranquility: 3,
        relaxed: 2.5, relaxing: 2, relax: 2, still: 1.5, stillness: 2,
        present: 1.5, grounded: 2.5, centered: 2.5, centred: 2.5,
        breath: 1.5, breathing: 1.5, meditate: 2, meditation: 2,
        mindful: 2, quiet: 1.5, gentle: 1.5, soft: 1,
        content: 2, contented: 2, contentment: 2, ease: 2, steady: 1.5,
        patient: 2, patience: 2, accepting: 2, acceptance: 2,
        open: 1.5, openness: 1.5, trusting: 1.5, trust: 1.5,
        fulfilled: 2, fulfillment: 2, at_peace: 2.5
    },

    // ── 3. ANGER ─────────────────────────────────────────────────
    anger: {
        angry: 2, anger: 2, furious: 3, rage: 3, enraged: 3,
        livid: 3, irate: 2.5, outraged: 2.5, incensed: 2.5,
        frustrated: 1.5, frustrating: 1.5, frustration: 1.5,
        annoyed: 1.5, annoying: 1.5, irritated: 1.5, irritating: 1.5,
        mad: 1.5, infuriated: 2, bitter: 1.5, resentful: 1.5, resentment: 2,
        agitated: 2, aggravated: 2, contempt: 2.5, cynical: 1.5,
        disdain: 2, disgruntled: 2, disturbed: 1.5, edgy: 1.5,
        exasperated: 2, grouchy: 1.5, hostile: 2.5, impatient: 1.5,
        moody: 1.5, 'on edge': 1.5, pissed: 2.5, vindictive: 2.5,
        hate: 2.5, hating: 2.5, hatred: 2.5, detest: 2.5, despise: 2.5,
        violent: 2, scream: 1.5, yell: 1.5, shout: 1.5, slam: 1.5,
        damn: 1.5, hell: 1, upset: 1.5
    },

    // ── 4. FEAR ──────────────────────────────────────────────────
    fear: {
        afraid: 2.5, fear: 2, fearful: 2.5, scared: 2.5, terrified: 3,
        terror: 3, horrified: 3, horror: 2.5, petrified: 3,
        dread: 2.5, dreading: 2.5, helpless: 2.5, paralyzed: 3,
        paralysed: 3, frozen: 2, trapped: 1.5, powerless: 1.5,
        threatened: 2, vulnerable: 1.5, unsafe: 2, danger: 1.5,
        nightmare: 2, phobia: 2, frightened: 2.5, apprehensive: 2,
        hesitant: 1.5, nervous: 2, nervousness: 2, panic: 3,
        panicking: 3, panicked: 3, anxious: 2, worried: 2, worry: 2,
        worrying: 2, fragile: 1.5, sensitive: 1.5
    },

    // ── 5. ANXIETY / STRESS ──────────────────────────────────────
    anxiety: {
        anxious: 2.5, anxiety: 2.5, stressed: 2.5, stress: 2,
        overwhelmed: 2.5, overwhelm: 2.5, restless: 2, tense: 2,
        tension: 2, uptight: 1.5, overthinking: 2.5, overthink: 2,
        spiraling: 2.5, spiral: 2, unsettled: 2, uncertain: 1.5,
        unsure: 1.5, doubt: 1.5, doubtful: 1.5, confused: 1.5,
        shaking: 1.5, trembling: 1.5, racing: 1, breathless: 1.5,
        shaking: 1.5, trembling: 1.5, racing: 1, breathless: 1.5
    },

    // ── 6. SADNESS / DESPAIR ─────────────────────────────────────
    sadness: {
        sad: 2, sadness: 2, unhappy: 1.5, sorrow: 2, sorrowful: 2,
        grief: 2.5, grieving: 2.5, depressed: 2.5, depression: 2.5,
        heartbroken: 3, heartbreak: 3, devastated: 3, despondent: 2.5,
        despair: 3, anguish: 3, forlorn: 2.5, gloomy: 1.5,
        discouraged: 2, disappointed: 2, disappointment: 2,
        lonely: 2.5, loneliness: 2.5, alone: 2, isolation: 2,
        longing: 2, yearning: 2, melancholy: 2, melancholic: 2,
        cry: 2, crying: 2, tears: 1.5, teary: 2, sobbing: 2.5, weep: 2,
        hopeless: 2.5, worthless: 1.5, helpless: 1.5, empty: 1.5,
        numb: 1.5, meaningless: 2, pointless: 2, weary: 1.5,
        broken: 1.5, hurt: 1.5, tired: 1, exhausted: 1.5,
        broken: 1.5, hurt: 1.5, tired: 1, exhausted: 1.5
    },

    // ── 7. SHAME / EMBARRASSMENT / GUILT ─────────────────────────
    shame: {
        ashamed: 3, shame: 3, embarrassed: 2.5, embarrassment: 2.5,
        mortified: 3, humiliated: 3, humiliation: 3,
        self_conscious: 2.5, inhibited: 2, useless: 2, weak: 1.5,
        worthless: 2.5, guilty: 2.5, guilt: 2.5, regret: 2.5,
        regretting: 2, remorseful: 3, remorse: 3, sorry: 2,
        disgrace: 2.5, disgraced: 2.5, exposed: 2, judged: 2,
        failure: 2, failed: 1.5, pathetic: 2, stupid: 1.5,
        failure: 2, failed: 1.5, pathetic: 2, stupid: 1.5
    },

    // ── 8. GRATITUDE ─────────────────────────────────────────────
    gratitude: {
        grateful: 3, gratitude: 3, thankful: 2.5, thank: 1.5,
        thanks: 1.5, appreciate: 2.5, appreciation: 2.5, blessed: 2.5,
        blessing: 2, touched: 2, moved: 1.5, humbled: 2,
        honored: 2, honoured: 2, fortunate: 2, lucky: 1.5,
        cherish: 2, cherishing: 2, abundance: 1.5, gift: 1.5,
        warmth: 1.5, warm: 1, tender: 1.5, grace: 2.5,
        appreciative: 2.5,
        appreciative: 2.5
    },

    // ── 9. COURAGE / POWER ───────────────────────────────────────
    courage: {
        brave: 2.5, bravery: 2.5, courageous: 3, courage: 3,
        bold: 2, confident: 2.5, confidence: 2.5, daring: 2.5,
        determined: 2.5, determination: 2.5, adventurous: 2,
        adventure: 1.5, capable: 2, strong: 2, strength: 2,
        powerful: 2.5, power: 2, proud: 2, pride: 2,
        worthy: 2, valiant: 2.5, fearless: 2.5, resilient: 2,
        resilience: 2, grounded: 1.5, free: 1.5, driven: 2,
        unstoppable: 3, empowered: 2.5, rising: 1.5,
        unstoppable: 3, empowered: 2.5, rising: 1.5
    },

    // ── 10. HOPEFUL ──────────────────────────────────────────────
    hopeful: {
        hopeful: 3, hope: 2.5, hoping: 2, optimistic: 2.5,
        optimism: 2.5, encouraged: 2.5, expectant: 2, expectation: 2,
        looking_forward: 2.5, anticipate: 2, anticipation: 2,
        possibility: 1.5, believe: 1.5, believing: 1.5,
        faith: 1.5, trust: 1, bright: 1.5, potential: 1.5,
        faith: 1.5, trust: 1, bright: 1.5, potential: 1.5
    },

    // ── 11. DISCONNECTED / NUMB ──────────────────────────────────
    disconnected: {
        numb: 2.5, empty: 2, hollow: 2, blank: 1.5, detached: 2.5,
        disconnected: 3, dissociated: 2.5, withdrawn: 2.5, distant: 2,
        aloof: 2, isolated: 2.5, isolation: 2.5, alone: 1.5,
        bored: 2, boredom: 2, listless: 2.5, lethargic: 2.5,
        indifferent: 2.5, apathetic: 2.5, apathy: 2.5, flat: 2,
        removed: 2.5, shut: 1.5, shutdown: 2.5, closed: 1.5,
        uneasy: 1.5, resistant: 1.5, nothing: 1, invisible: 2,
        uneasy: 1.5, resistant: 1.5, nothing: 1, invisible: 2
    },

    // ── 12. STRESS / BURNOUT ─────────────────────────────────────
    stress: {
        stressed: 2.5, stress: 2, exhausted: 2.5, burnout: 3,
        'burned out': 3, burnt_out: 3, depleted: 2.5, drained: 2.5,
        frazzled: 2.5, frantic: 2, overwhelmed: 2, overloaded: 2.5,
        tense: 1.5, cranky: 1.5, edgy: 1.5, restless: 1.5,
        rattled: 2, shaken: 2, tight: 1.5, weary: 2, worn: 1.5,
        'worn out': 2.5, rundown: 2, run_down: 2, heavy: 1.5,
        pressure: 2, pressured: 2, strained: 2,
        pressure: 2, pressured: 2, strained: 2
    },

    // ── 13. POWERLESS ────────────────────────────────────────────
    powerless: {
        powerless: 3, helpless: 2.5, hopeless: 2, impotent: 2.5,
        incapable: 2.5, inadequate: 2, resigned: 2.5, resignation: 2.5,
        victim: 2.5, stuck: 2, trapped: 2.5, imprisoned: 2.5,
        no_choice: 2, nowhere: 1.5, can_not: 1.5, unable: 2,
        defeated: 2.5, beaten: 2, crushed: 2, broken: 2, failing: 1.5,
        defeated: 2.5, beaten: 2, crushed: 2, broken: 2, failing: 1.5
    },

    // ── 14. UNSETTLED / DOUBT ────────────────────────────────────
    unsettled: {
        unsettled: 2.5, doubt: 2.5, doubtful: 2, uncertain: 2,
        uncertainty: 2, confused: 2, perplexed: 2.5, questioning: 2,
        skeptical: 2.5, suspicious: 2.5, concerned: 1.5, dissatisfied: 2,
        hesitant: 2, reluctant: 2, ungrounded: 2.5, grouchy: 1.5,
        inhibited: 1.5, rejecting: 1.5, shocked: 2, disturbed: 1.5,
        inhibited: 1.5, rejecting: 1.5, shocked: 2, disturbed: 1.5
    },

    // ── 15. TENDER / LOVING / CONNECTED ─────────────────────────
    tender: {
        loving: 2.5, love: 2, affectionate: 2.5, affection: 2.5,
        caring: 2.5, care: 2, compassion: 2.5, compassionate: 2.5,
        empathy: 2, empathetic: 2, warm: 2, warmth: 2,
        tender: 2.5, tenderness: 2.5, nurturing: 2, nurture: 2,
        soft: 1.5, gentle: 1.5, kind: 2, kindness: 2,
        connected: 2.5, connection: 2.5, intimate: 2, intimacy: 2,
        held: 1.5, safe: 2, secure: 1.5, reflective: 1.5,
        self_loving: 2.5
    }
};

// ── Bodily Sensation Lexicon ─────────────────────────────────
// These don't set the emotion but amplify the somatic intensity
// of particles (larger pulse, stronger vibration effect).
const BODILY_LEXICON = {
    hot: 1.5, burning: 1.5, heat: 1.2, flushed: 1.3, sweating: 1.3,
    cold: 1.2, chilled: 1.2, shivery: 1.5, shiver: 1.5, frozen: 1.3,
    tight: 1.3, tightness: 1.3, heavy: 1.4, heaviness: 1.4,
    numb: 1.3, tingling: 1.5, buzzing: 1.5, vibrating: 1.5,
    tender: 1.2, raw: 1.3, aching: 1.3, ache: 1.3, pain: 1.4,
    light: 1.2, weightless: 1.4, floating: 1.3, dizzy: 1.4,
    electric: 1.6, charged: 1.5, pulsing: 1.5, throbbing: 1.4,
    breathless: 1.4, racing_heart: 1.5, trembling: 1.3, shaking: 1.3,
    pressure: 1.3, sinking: 1.4, lifting: 1.3, expansion: 1.3
};

// ── Tokeniser ────────────────────────────────────────────────
function tokenise(text) {
    return text.toLowerCase().match(/\w+/g) || [];
}

// ── Blend threshold ──────────────────────────────────────────
// Emotions with a normalised share >= this appear in blend[].
const BLEND_THRESHOLD = 0.16;

// ── Core Detector ────────────────────────────────────────────
// ── Context Transitions ──────────────────────────────────────
const TRANSITION_WORDS = new Set([
    'but', 'however', 'yet', 'nevertheless', 'though', 'nonetheless',
    'alternatively', 'instead', 'otherwise', 'even though'
]);

// ── Sentential Analysis Helpers ───────────────────────────────
function splitToSentences(text) {
    // Regex matches . ! ? followed by space or end of string
    return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
}

/**
 * Core detector upgraded for long-form context ("Diary Mode").
 * 
 * New Logic:
 * 1. Split text into sentences.
 * 2. Score each sentence independently.
 * 3. Apply a "Recency Bias" (sentences at the end of a journal entry 
 *    often represent the current state more than the start).
 * 4. Detect "But/However" shifts to prioritize the new sentiment.
 */
export function detectEmotion(text) {
    if (!text || text.trim().length === 0) {
        return { emotion: 'joy', confidence: 0.5, scores: {}, blend: [{ emotion: 'joy', weight: 1 }], bodily: 1, total: 0 };
    }

    const sentences = splitToSentences(text);
    const aggregatedScores = {
        joy: 0, calm: 0, anger: 0, fear: 0, anxiety: 0,
        sadness: 0, shame: 0, gratitude: 0, courage: 0,
        hopeful: 0, disconnected: 0, stress: 0,
        powerless: 0, unsettled: 0, tender: 0
    };

    let totalBodilySum = 0;
    let totalBodilyCount = 0;
    let totalWeight = 0;

    sentences.forEach((sentence, index) => {
        const tokens = tokenise(sentence);
        const sentenceScores = { ...aggregatedScores }; // Zeroed template
        Object.keys(sentenceScores).forEach(k => sentenceScores[k] = 0);

        let sentenceBodilySum = 0;
        let sentenceBodilyCount = 0;
        let containsTransition = false;

        // 1. Process tokens for this sentence
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (TRANSITION_WORDS.has(token)) containsTransition = true;

            const prevOne = i >= 1 ? tokens[i - 1] : '';
            const prevTwo = i >= 2 ? tokens[i - 2] : '';

            const isNegated = NEGATION_WORDS.has(prevOne) || NEGATION_WORDS.has(prevTwo);
            const isIntensified = INTENSIFIERS.has(prevOne) || INTENSIFIERS.has(prevTwo);
            const intensityMult = isIntensified ? 1.6 : 1.0;

            for (const [emotion, lexicon] of Object.entries(LEXICONS)) {
                if (token in lexicon) {
                    const weight = lexicon[token] * intensityMult;
                    if (isNegated) {
                        const opponents = Object.keys(sentenceScores).filter(e => e !== emotion);
                        opponents.forEach(opp => { sentenceScores[opp] += weight * 0.2; });
                    } else {
                        sentenceScores[emotion] += weight;
                    }
                }
            }

            if (token in BODILY_LEXICON) {
                sentenceBodilySum += BODILY_LEXICON[token];
                sentenceBodilyCount++;
            }
        }

        // 2. Apply Recency Bias + Transition Boost
        // Later sentences are weighted more (up to 2x weight).
        // Sentences following a "BUT" get a 1.3x boost to their unique signal.
        const positionWeight = 1.0 + (index / (sentences.length || 1)) * 1.0;
        const transitionBoost = containsTransition ? 1.3 : 1.0;
        const finalSentenceWeight = positionWeight * transitionBoost;

        Object.keys(sentenceScores).forEach(emo => {
            aggregatedScores[emo] += sentenceScores[emo] * finalSentenceWeight;
        });

        if (sentenceBodilyCount > 0) {
            totalBodilySum += (sentenceBodilySum / sentenceBodilyCount) * finalSentenceWeight;
            totalBodilyCount += finalSentenceWeight;
        }

        totalWeight += finalSentenceWeight;
    });

    // ── Aggregation ──

    // Bodily intensity: clamped 0.8 → 2.0
    const bodily = totalBodilyCount > 0
        ? Math.min(2.2, 0.8 + (totalBodilySum / totalBodilyCount) * 0.7)
        : 1;

    const total = Object.values(aggregatedScores).reduce((s, v) => s + v, 0);

    if (total === 0) {
        return { emotion: 'joy', confidence: 0, scores: aggregatedScores, blend: [], bodily, total: 0 };
    }

    const normalised = Object.entries(aggregatedScores)
        .map(([e, s]) => ({ emotion: e, weight: s / total }))
        .sort((a, b) => b.weight - a.weight);

    const top = normalised[0];

    // Build blend from all emotions above threshold
    const above = normalised.filter(e => e.weight >= BLEND_THRESHOLD);
    const blendTotal = above.reduce((s, e) => s + e.weight, 0);
    const blend = above.map(e => ({ emotion: e.emotion, weight: e.weight / blendTotal }));

    if (blend.length === 0) blend.push({ emotion: top.emotion, weight: 1 });

    return {
        emotion: top.emotion,
        confidence: top.weight,
        scores: aggregatedScores,
        blend,
        bodily,
        total
    };
}
