// =============================================================
//  Particle.js
//  Core particle entity used in the Emotropy simulation.
//  Each particle carries its own physics state and render style.
// =============================================================

export class Particle {
  /**
   * @param {number} x       - Initial x position (canvas coordinates)
   * @param {number} y       - Initial y position (canvas coordinates)
   * @param {Object} config  - Emotion-derived configuration object
   *   config.color         {string}  - CSS colour (hex or rgba)
   *   config.glowColor     {string}  - Glow / shadow colour
   *   config.size          {number}  - Base radius in pixels
   *   config.speed         {number}  - Scalar applied to initial velocity
   *   config.friction      {number}  - Deceleration factor (0–1, lower = more drag)
   *   config.behaviour     {string}  - One of: 'joy'|'anger'|'sadness'|'anxiety'
   *   config.lifespan      {number}  - Max frames this particle lives for
   */
  constructor(x, y, config) {
    this.x = x;
    this.y = y;

    // ------- Velocity (pixels per frame) -------
    // Random direction, scaled by emotion speed
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * config.speed * (0.5 + Math.random() * 0.5);
    this.vy = Math.sin(angle) * config.speed * (0.5 + Math.random() * 0.5);

    // ------- Acceleration (applied each frame) -------
    this.ax = 0;
    this.ay = 0;

    // ------- Visual properties -------
    this.color = config.color;
    this.glowColor = config.glowColor ?? config.color;
    this.size = config.size * (0.6 + Math.random() * 0.8);  // slight size variance

    // ------- Physics properties -------
    this.friction = config.friction;   // velocity multiplied each frame
    this.behaviour = config.behaviour;  // drives per-frame force logic
    this.speed = config.speed;

    // ------- Lifecycle -------
    this.lifespan = config.lifespan ?? 200;
    this.age = 0;
    this.alive = true;

    // Bodily sensation multiplier (0.8–2.0): scales size pulse amplitude
    this.bodily = config.bodily ?? 1;

    // Trail buffer: stores last N positions for motion-blur / comet tail effect
    this.trail = [];
    this.maxTrail = config.trail ?? 8;
  }

  // ----------------------------------------------------------------
  //  applyForce(fx, fy)
  //  Accumulates an external force vector into acceleration.
  //  Call this before update() each frame.
  // ----------------------------------------------------------------
  applyForce(fx, fy) {
    this.ax += fx;
    this.ay += fy;
  }

  // ----------------------------------------------------------------
  //  update(canvasW, canvasH)
  //  Advances physics one frame: behaviour forces → velocity → position
  //  Wraps particles at canvas edges; ages the particle toward death.
  // ----------------------------------------------------------------
  update(canvasW, canvasH) {
    // --- Record trail position before moving ---
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.shift();

    // --- Per-emotion force injection ---
    this._applyBehaviourForces(canvasW, canvasH);

    // --- Integrate acceleration into velocity ---
    this.vx += this.ax;
    this.vy += this.ay;

    // --- Apply friction (drag) ---
    this.vx *= this.friction;
    this.vy *= this.friction;

    // --- Integrate velocity into position ---
    this.x += this.vx;
    this.y += this.vy;

    // --- Reset acceleration (re-computed next frame) ---
    this.ax = 0;
    this.ay = 0;

    // --- Edge wrapping: particles re-enter from opposite side ---
    if (this.x < -this.size) this.x = canvasW + this.size;
    if (this.x > canvasW + this.size) this.x = -this.size;
    if (this.y < -this.size) this.y = canvasH + this.size;
    if (this.y > canvasH + this.size) this.y = -this.size;

    // --- Age and kill ---
    this.age++;
    if (this.age >= this.lifespan) this.alive = false;
  }

  // ----------------------------------------------------------------
  //  _applyBehaviourForces(canvasW, canvasH)
  //  Private. Injects emotion-specific physics each frame.
  // ----------------------------------------------------------------
  _applyBehaviourForces(canvasW, canvasH) {
    const cx = canvasW / 2;  // canvas centre x
    const cy = canvasH / 2;  // canvas centre y

    switch (this.behaviour) {
      // JOY — gentle outward radial push; particles drift away from centre
      case 'joy': {
        const dx = this.x - cx;
        const dy = this.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        this.applyForce((dx / dist) * 0.08, (dy / dist) * 0.06);
        break;
      }

      // ANGER — strong random explosive kicks; high chaotic energy
      case 'anger': {
        this.applyForce(
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.2
        );
        // Mild repulsion from neighbours handled externally in main.js
        break;
      }

      // SADNESS — gravity-like pull downward + slow inward drift toward centre
      case 'sadness': {
        // Downward gravity
        this.applyForce(0, 0.12);
        // Slight inward pull toward canvas centre
        const dx = cx - this.x;
        const dy = cy - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        this.applyForce((dx / dist) * 0.04, (dy / dist) * 0.04);
        break;
      }

      // ANXIETY — fast random jitter; oscillation via sine waves
      case 'anxiety': {
        const jitterStrength = 0.8;
        this.applyForce(
          (Math.random() - 0.5) * jitterStrength,
          (Math.random() - 0.5) * jitterStrength
        );
        // Oscillation using particle age as phase
        this.applyForce(
          Math.sin(this.age * 0.4) * 0.5,
          Math.cos(this.age * 0.3) * 0.5
        );
        break;
      }

      // FEAR — freeze-flight alternation
      // Every ~30 frames the particle "freezes" (strong deceleration),
      // then suddenly flees in a random direction (burst of force).
      case 'fear': {
        const cycle = Math.floor(this.age / 30) % 2; // 0=freeze, 1=burst
        if (cycle === 0) {
          // Freeze: apply counter-force proportional to current velocity
          this.applyForce(-this.vx * 0.25, -this.vy * 0.25);
        } else {
          // Flight: random directional burst
          const angle = Math.random() * Math.PI * 2;
          this.applyForce(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9);
        }
        // Subtle trembling overlay
        this.applyForce(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        );
        break;
      }

      // CALM — near-zero additional force; particles drift gently on
      // their initial velocity and high friction does the rest.
      // A very faint centering pull prevents them leaving the canvas.
      case 'calm': {
        const dx = cx - this.x;
        const dy = cy - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // Ultra-soft pull toward centre (< 0.01 force)
        this.applyForce((dx / dist) * 0.008, (dy / dist) * 0.008);
        break;
      }

      // CURIOSITY — tangential (perpendicular) force around canvas centre
      // creates a clockwise swirling orbit effect.
      case 'curiosity': {
        const dx = this.x - cx;
        const dy = this.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // Tangential direction: rotate radial vector 90° clockwise
        const tx = dy / dist;
        const ty = -dx / dist;
        this.applyForce(tx * 0.18, ty * 0.18);
        // Soft radial pull to keep them in orbit
        this.applyForce((-dx / dist) * 0.04, (-dy / dist) * 0.04);
        break;
      }

      // GRATITUDE — slow radial expansion like an opening halo.
      // Sinusoidal size pulse creates a shimmer when drawn.
      case 'gratitude': {
        const dx = this.x - cx;
        const dy = this.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // Gentle outward push
        this.applyForce((dx / dist) * 0.06, (dy / dist) * 0.05);
        // Soft upward drift (lightness)
        this.applyForce(0, -0.02);
        break;
      }

      // SHAME — strong inward pull + rotational curl
      case 'shame': {
        const dx = cx - this.x;
        const dy = cy - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        this.applyForce((dx / dist) * 0.14, (dy / dist) * 0.12);
        const tx = -dy / dist;
        const ty = dx / dist;
        this.applyForce(tx * 0.08, ty * 0.08);
        break;
      }

      // COURAGE — upward arc launched from centre, expands then arcs back
      // Like a firework: fast climb, then graceful falloff.
      case 'courage': {
        // Strong upward bias in early life, tapering off
        const upwardBias = Math.max(0, 1 - this.age / 80);
        this.applyForce(0, -0.2 * upwardBias);
        // Gentle outward radial drift
        const dx = this.x - cx;
        const dy = this.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        this.applyForce((dx / dist) * 0.04, (dy / dist) * 0.03);
        break;
      }

      // HOPEFUL — gentle upward float with soft side-to-side wavering
      // Particles rise slowly like embers or bubbles.
      case 'hopeful': {
        // Soft upward lift
        this.applyForce(0, -0.06);
        // Gentle horizontal sway using sine of age
        this.applyForce(Math.sin(this.age * 0.05) * 0.08, 0);
        break;
      }

      // DISCONNECTED — slow inward drift; nearly no force, particle barely moves
      // High friction in config handles the rest. Early fade via alpha scaling.
      case 'disconnected': {
        const dx = cx - this.x;
        const dy = cy - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // Very weak inward pull — detached, drifting nowhere
        this.applyForce((dx / dist) * 0.015, (dy / dist) * 0.015);
        // Accelerate fade: make particle feel like it's disappearing early
        if (this.age > this.lifespan * 0.4) {
          this.applyForce(0, 0.02); // slow sink in later life
        }
        break;
      }

      // STRESS — rapid chaotic bursts that change direction every few frames
      // Higher-frequency jitter than anxiety; burns out faster.
      case 'stress': {
        // Change direction forcefully every ~12 frames
        if (this.age % 12 === 0) {
          const angle = Math.random() * Math.PI * 2;
          this.applyForce(Math.cos(angle) * 1.4, Math.sin(angle) * 1.4);
        }
        // Constant low-level jitter between bursts
        this.applyForce(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        );
        break;
      }

      // POWERLESS — heavy downward pull, stronger than sadness.
      // Particles sink quickly and don't bounce back.
      case 'powerless': {
        // Strong gravity
        this.applyForce(0, 0.2);
        // Slight inward drag (collapsing inward)
        const dx = cx - this.x;
        const dy = cy - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        this.applyForce((dx / dist) * 0.02, (dy / dist) * 0.02);
        break;
      }

      // UNSETTLED — slow, uncertain jitter with occasional direction changes.
      // Lower energy than anxiety; more doubtful/hesitant feel.
      case 'unsettled': {
        // Slow jitter
        this.applyForce(
          (Math.random() - 0.5) * 0.35,
          (Math.random() - 0.5) * 0.35
        );
        // Occasional stronger lurch every ~25 frames
        if (this.age % 25 === 0) {
          this.applyForce(
            (Math.random() - 0.5) * 1.2,
            (Math.random() - 0.5) * 1.2
          );
        }
        break;
      }

      // TENDER — warm outward halo drift with slow pulsing orbit.
      // Smooth, gentle, loving — particles expand softly like a hug.
      case 'tender': {
        const dx = this.x - cx;
        const dy = this.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // Very slow outward radial drift
        this.applyForce((dx / dist) * 0.03, (dy / dist) * 0.025);
        // Soft clockwise tangential orbit (slower than curiosity)
        const tx = dy / dist;
        const ty = -dx / dist;
        this.applyForce(tx * 0.05, ty * 0.045);
        break;
      }
    }
  }

  // ----------------------------------------------------------------
  //  draw(ctx)
  //  Renders the particle (and its trail) onto the 2D canvas context.
  // ----------------------------------------------------------------
  draw(ctx) {
    // --- Fade out as particle approaches end of lifespan ---
    const lifeFraction = 1 - this.age / this.lifespan;  // 1 = fresh, 0 = dying
    const alpha = Math.max(0, lifeFraction);

    // --- Size pulse: bodily multiplier amplifies the pulsing ---
    const pulse = 1 + 0.15 * this.bodily * Math.sin(this.age * 0.2);
    const radius = this.size * pulse;

    // === Draw comet trail ===
    if (this.trail.length > 1) {
      for (let i = 0; i < this.trail.length - 1; i++) {
        const t = i / this.trail.length;          // 0 (oldest) → 1 (newest)
        const trailAlpha = t * alpha * 0.4;       // fade older trail segments
        const trailRadius = radius * t * 0.6;

        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, Math.max(0.5, trailRadius), 0, Math.PI * 2);
        ctx.fillStyle = this._alphaColor(this.color, trailAlpha);
        ctx.fill();
      }
    }

    // === Draw glow halo (soft shadow) ===
    // REMOVED ctx.shadowBlur as it is extremely expensive for thousands of arcs.
    // Instead, we rely on additive compositing and radial gradients for bloom.

    // === Draw core particle circle ===
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);

    // Radial gradient for a "lit" look
    const grad = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, radius
    );

    const alphaStr = alpha.toFixed(2);
    grad.addColorStop(0, this._alphaColor(this.color, alphaStr));
    grad.addColorStop(0.6, this._alphaColor(this.color, (alpha * 0.8).toFixed(2)));
    grad.addColorStop(1, this._alphaColor(this.color, '0'));

    ctx.fillStyle = grad;
    ctx.fill();
  }

  // ----------------------------------------------------------------
  //  _alphaColor(hexOrRgb, alphaStr)
  //  Utility: converts a colour string to rgba. Caches results to
  //  avoid parsing hex strings 60 times per second per particle.
  // ----------------------------------------------------------------
  static _colorCache = new Map();

  _alphaColor(color, alphaStr) {
    const key = `${color}_${alphaStr}`;
    if (Particle._colorCache.has(key)) return Particle._colorCache.get(key);

    let result = color;
    if (color.startsWith('#')) {
      let hex = color.slice(1);
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      result = `rgba(${r},${g},${b},${alphaStr})`;
    } else if (color.startsWith('rgba')) {
      result = color.replace(/[\d.]+\)$/, `${alphaStr})`);
    }

    // Small cache maintenance
    if (Particle._colorCache.size > 1000) Particle._colorCache.clear();

    Particle._colorCache.set(key, result);
    return result;
  }
}

