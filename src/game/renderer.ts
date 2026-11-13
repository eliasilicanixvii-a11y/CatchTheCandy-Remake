import Matter from 'matter-js';
import { GamePhysics } from './physics';
import { LevelConfig, LevelObject, Particle, SurfaceType } from './types';
import { SKINS, SkinDef } from './logic';

export class GameRenderer {
  private particles: Particle[] = [];
  private maxParticles = 120;
  private blinkTimer = 0;
  private isBlinking = false;
  private eyeAngle = 0;
  private mouthOpenProgress = 0; // 0 (closed) to 1 (wide open)
  private candyRotation = 0;

  // Authentic Fluffy sprite images
  private imgNormal: HTMLImageElement | null = null;
  private imgHurt: HTMLImageElement | null = null;
  private imgDie: HTMLImageElement | null = null;
  private imagesLoaded = { normal: false, hurt: false, die: false };

  constructor() {
    this.particles = [];
    if (typeof window !== 'undefined') {
      this.imgNormal = new Image();
      this.imgNormal.src = '/FluffyNormal.png';
      this.imgNormal.onload = () => {
        this.imagesLoaded.normal = true;
      };

      this.imgHurt = new Image();
      this.imgHurt.src = '/FluffyHurt.png';
      this.imgHurt.onload = () => {
        this.imagesLoaded.hurt = true;
      };

      this.imgDie = new Image();
      this.imgDie.src = '/FluffyDie.png';
      this.imgDie.onload = () => {
        this.imagesLoaded.die = true;
      };
    }
  }

  public addConfettiBurst(x: number, y: number, count = 40) {
    const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#fbbf24', '#ffffff'];
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.012 + Math.random() * 0.018,
        shape: Math.random() > 0.4 ? 'star' : 'circle',
        angle: Math.random() * Math.PI,
        va: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  public addIceSlipBurst(x: number, y: number) {
    for (let i = 0; i < 16; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#67e8f9' : '#e0f2fe',
        alpha: 1,
        decay: 0.04 + Math.random() * 0.03,
        shape: 'shard',
      });
    }
  }

  public addLatchPuff(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: '#fbcfe8',
        alpha: 0.9,
        decay: 0.05,
        shape: 'circle',
      });
    }
  }

  public updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gentle gravity
      p.alpha -= p.decay;
      if (p.angle !== undefined && p.va !== undefined) {
        p.angle += p.va;
      }
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    physics: GamePhysics,
    level: LevelConfig,
    mousePos: { x: number; y: number },
    skinId: string,
    isVictory: boolean,
    dt: number
  ) {
    const { width, height } = physics.bounds;
    const skin: SkinDef = SKINS[skinId] || SKINS.purple;

    this.candyRotation += dt * 1.5;

    // Blink timer update
    this.blinkTimer += dt;
    if (this.blinkTimer > 3.5) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.7) {
        this.isBlinking = false;
        this.blinkTimer = Math.random() * 1.0;
      }
    }

    // Mouth animation: open wider when tongue is shooting or near victory
    const targetMouth = physics.tongue.isActive || isVictory ? 1 : 0;
    this.mouthOpenProgress += (targetMouth - this.mouthOpenProgress) * 0.2;

    ctx.save();

    // 1. Background with rich layered gradients
    this.drawBackground(ctx, width, height, level.theme);

    // 2. Aim guide trajectory (dotted gradient) when mouse hovers and tongue is idle
    if (!physics.tongue.isActive && !isVictory) {
      this.drawAimGuide(ctx, physics.playerBody.position, mousePos);
    }

    // 3. Level objects & platforms
    for (const body of physics.levelBodies) {
      this.drawLevelBody(ctx, body);
    }

    // 4. Elastic Tongue
    if (physics.tongue.isActive) {
      this.drawTongue(ctx, physics, skin);
    }

    // 5. Candy
    this.drawCandy(ctx, physics.candyBody);

    // 6. Purple Furry Creature (Player)
    this.drawCreature(ctx, physics, mousePos, skin, isVictory);

    // 7. Particles
    this.drawParticles(ctx);

    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, theme: string) {
    // Rich gradient sky/environment based on level theme
    let grad: CanvasGradient;

    if (theme === 'ice' || theme === 'crystal') {
      grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0c4a6e'); // deep arctic navy
      grad.addColorStop(0.4, '#0284c7'); // glacial blue
      grad.addColorStop(0.8, '#7dd3fc'); // ice mist
      grad.addColorStop(1, '#e0f2fe'); // frosty snow floor
    } else if (theme === 'sunset') {
      grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#4c1d95'); // twilight purple
      grad.addColorStop(0.4, '#db2777'); // vibrant magenta
      grad.addColorStop(0.7, '#f97316'); // warm golden sunset
      grad.addColorStop(1, '#fef08a'); // luminous glow
    } else if (theme === 'candy') {
      grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#831843'); // candy berry
      grad.addColorStop(0.4, '#ec4899'); // strawberry pink
      grad.addColorStop(0.8, '#fbcfe8'); // sugar glaze
      grad.addColorStop(1, '#fff1f2'); // cotton candy
    } else {
      // Meadow (default)
      grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1e3a8a'); // sapphire blue sky
      grad.addColorStop(0.45, '#38bdf8'); // sky blue
      grad.addColorStop(0.8, '#a7f3d0'); // spring haze
      grad.addColorStop(1, '#f0fdf4'); // fresh ground glow
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Ambient floating clouds / sun glow with radial gradient
    const sunGrad = ctx.createRadialGradient(width * 0.75, height * 0.2, 10, width * 0.75, height * 0.2, 180);
    sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    sunGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.2)');
    sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.2, 180, 0, Math.PI * 2);
    ctx.fill();

    // Subtle cartoon background hills with soft gradients
    ctx.save();
    const hillGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
    hillGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    hillGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    ctx.fillStyle = hillGrad;

    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.bezierCurveTo(width * 0.2, height * 0.65, width * 0.4, height * 0.75, width * 0.6, height * 0.7);
    ctx.bezierCurveTo(width * 0.8, height * 0.65, width * 0.9, height * 0.8, width, height * 0.75);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawAimGuide(
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 20) return;

    const maxAim = Math.min(dist, 400);
    const endX = from.x + (dx / dist) * maxAim;
    const endY = from.y + (dy / dist) * maxAim;

    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2.5;

    const grad = ctx.createLinearGradient(from.x, from.y, endX, endY);
    grad.addColorStop(0, 'rgba(244, 114, 182, 0.7)');
    grad.addColorStop(1, 'rgba(244, 114, 182, 0.1)');

    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Aim target reticle ring at end
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.5)';
    ctx.beginPath();
    ctx.arc(to.x, to.y, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawLevelBody(ctx: CanvasRenderingContext2D, body: Matter.Body) {
    const pos = body.position;
    const angle = body.angle;
    const surfaceType = (body as unknown as { surfaceType?: SurfaceType }).surfaceType || 'normal';
    const originalObj = (body as unknown as { originalObj?: LevelObject }).originalObj;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);

    if (originalObj?.shape === 'circle') {
      const r = originalObj.radius || originalObj.width / 2;
      this.drawCircleSurface(ctx, r, surfaceType);
    } else {
      const w = originalObj?.width || 100;
      const h = originalObj?.height || 40;
      this.drawRectSurface(ctx, w, h, surfaceType);
    }

    ctx.restore();
  }

  private drawRectSurface(ctx: CanvasRenderingContext2D, w: number, h: number, surfaceType: SurfaceType) {
    const halfW = w / 2;
    const halfH = h / 2;
    const cornerR = Math.min(10, h / 2, w / 2);

    ctx.beginPath();
    ctx.roundRect(-halfW, -halfH, w, h, cornerR);

    if (surfaceType === 'ice') {
      // ICE SURFACE: Glossy cyan-to-white crystalline gradient with reflection gleam
      const iceGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      iceGrad.addColorStop(0, '#e0f2fe'); // snowy top highlight
      iceGrad.addColorStop(0.3, '#7dd3fc'); // bright sky cyan
      iceGrad.addColorStop(0.7, '#0284c7'); // deep glacier blue
      iceGrad.addColorStop(1, '#0369a1');

      ctx.fillStyle = iceGrad;
      ctx.fill();

      // Icy border with frosted glow
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.stroke();

      // Diagonal glossy glass shine across ice
      ctx.save();
      ctx.clip();
      ctx.beginPath();
      ctx.moveTo(-halfW + 15, -halfH);
      ctx.lineTo(-halfW + 45, -halfH);
      ctx.lineTo(-halfW + 20, halfH);
      ctx.lineTo(-halfW - 10, halfH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      // Frost speckles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let x = -halfW + 20; x < halfW - 20; x += 40) {
        ctx.beginPath();
        ctx.arc(x, -halfH + 6, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Icicles hanging underneath
      if (h >= 30) {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
        for (let ix = -halfW + 16; ix < halfW - 10; ix += 24) {
          ctx.beginPath();
          ctx.moveTo(ix - 5, halfH);
          ctx.lineTo(ix, halfH + 8);
          ctx.lineTo(ix + 5, halfH);
          ctx.fill();
        }
      }
    } else if (surfaceType === 'movable') {
      // MOVABLE CRATE: Warm wooden crate with metal brackets and cross bracing
      const woodGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      woodGrad.addColorStop(0, '#d97706'); // warm golden amber
      woodGrad.addColorStop(0.5, '#b45309'); // rich oak
      woodGrad.addColorStop(1, '#78350f'); // shadow wood

      ctx.fillStyle = woodGrad;
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#451a03';
      ctx.stroke();

      // Wood plank inner inset
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeRect(-halfW + 6, -halfH + 6, w - 12, h - 12);

      // Metal corner rivets with gradient
      const rivetColors = ['#fde68a', '#d97706'];
      const rivetCoords = [
        [-halfW + 10, -halfH + 10],
        [halfW - 10, -halfH + 10],
        [-halfW + 10, halfH - 10],
        [halfW - 10, halfH - 10],
      ];
      for (const [rx, ry] of rivetCoords) {
        ctx.beginPath();
        ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#451a03';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rx, ry, 2, 0, Math.PI * 2);
        ctx.fillStyle = rivetColors[0];
        ctx.fill();
      }
    } else if (surfaceType === 'bouncy') {
      // BOUNCY PAD: Vibrant springy emerald to lime gradient with pulse arrows
      const bounceGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      bounceGrad.addColorStop(0, '#86efac'); // bright spring lime
      bounceGrad.addColorStop(0.5, '#22c55e'); // emerald
      bounceGrad.addColorStop(1, '#15803d');

      ctx.fillStyle = bounceGrad;
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#bbf7d0';
      ctx.stroke();

      // Spring chevron indicators
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -halfH + 6);
      ctx.lineTo(8, -halfH + 14);
      ctx.lineTo(4, -halfH + 14);
      ctx.lineTo(4, -halfH + 20);
      ctx.lineTo(-4, -halfH + 20);
      ctx.lineTo(-4, -halfH + 14);
      ctx.lineTo(-8, -halfH + 14);
      ctx.closePath();
      ctx.fill();
    } else if (surfaceType === 'hazard') {
      // HAZARD / SPIKES: Crimson warning gradient with sharp teeth
      const hazGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      hazGrad.addColorStop(0, '#f87171');
      hazGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = hazGrad;
      ctx.fill();

      // Sharp spike teeth along top
      ctx.fillStyle = '#fca5a5';
      const spikeW = 16;
      for (let sx = -halfW; sx < halfW; sx += spikeW) {
        ctx.beginPath();
        ctx.moveTo(sx, -halfH);
        ctx.lineTo(sx + spikeW / 2, -halfH - 10);
        ctx.lineTo(sx + spikeW, -halfH);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // NORMAL PLATFORM: Lush organic wood/stone with mossy grass top gradient
      const normalGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      normalGrad.addColorStop(0, '#a16207'); // warm earthy amber
      normalGrad.addColorStop(0.3, '#854d0e'); // rich bark
      normalGrad.addColorStop(1, '#451a03'); // deep earth

      ctx.fillStyle = normalGrad;
      ctx.fill();

      // Beveled border
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#291e12';
      ctx.stroke();

      // Lush grassy moss gradient canopy along top
      ctx.save();
      ctx.clip();
      const grassGrad = ctx.createLinearGradient(0, -halfH, 0, -halfH + 14);
      grassGrad.addColorStop(0, '#86efac'); // sunlit grass
      grassGrad.addColorStop(0.6, '#22c55e'); // vibrant green
      grassGrad.addColorStop(1, '#15803d');

      ctx.fillStyle = grassGrad;
      ctx.beginPath();
      ctx.roundRect(-halfW, -halfH, w, 14, [cornerR, cornerR, 0, 0]);
      ctx.fill();

      // Little cute grass blades
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.5;
      for (let gx = -halfW + 12; gx < halfW - 10; gx += 16) {
        ctx.beginPath();
        ctx.moveTo(gx, -halfH + 14);
        ctx.lineTo(gx + 2, -halfH + 3);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawCircleSurface(ctx: CanvasRenderingContext2D, radius: number, surfaceType: SurfaceType) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);

    if (surfaceType === 'ice') {
      const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 2, 0, 0, radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#7dd3fc');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else {
      // Normal anchor orb
      const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 2, 0, 0, radius);
      grad.addColorStop(0, '#fde68a'); // golden bronze ring
      grad.addColorStop(0.5, '#d97706');
      grad.addColorStop(1, '#78350f');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner grip hole
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#291e12';
      ctx.fill();
    }
  }

  private drawTongue(ctx: CanvasRenderingContext2D, physics: GamePhysics, skin: SkinDef) {
    const playerPos = physics.playerBody.position;
    const { currentTipX, currentTipY, isLatched, isIceSlipped } = physics.tongue;

    ctx.save();

    // Elastic tongue ribbon with gradient
    const tongueGrad = ctx.createLinearGradient(playerPos.x, playerPos.y, currentTipX, currentTipY);
    tongueGrad.addColorStop(0, skin.tongueGradient[0]);
    tongueGrad.addColorStop(1, skin.tongueGradient[1]);

    ctx.strokeStyle = tongueGrad;
    ctx.lineWidth = isLatched ? 7 : 5;
    ctx.lineCap = 'round';

    // Slight droop or curve
    const midX = (playerPos.x + currentTipX) / 2;
    const midY = (playerPos.y + currentTipY) / 2 + (isLatched ? 3 : 8);

    ctx.beginPath();
    ctx.moveTo(playerPos.x, playerPos.y);
    ctx.quadraticCurveTo(midX, midY, currentTipX, currentTipY);
    ctx.stroke();

    // Suction Cup Tip
    ctx.translate(currentTipX, currentTipY);
    const angle = Math.atan2(currentTipY - playerPos.y, currentTipX - playerPos.x);
    ctx.rotate(angle);

    if (isIceSlipped) {
      // Ice slip animation: red squeak star
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Suction cup with gradient rim
      const cupGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 12);
      cupGrad.addColorStop(0, '#fbcfe8');
      cupGrad.addColorStop(0.6, skin.tongueGradient[1]);
      cupGrad.addColorStop(1, '#9d174d');

      ctx.fillStyle = cupGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Suction cup rim ring
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Inner suction depth
      ctx.beginPath();
      ctx.arc(2, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#831843';
      ctx.fill();
    }

    ctx.restore();
  }

  private drawCandy(ctx: CanvasRenderingContext2D, candyBody: Matter.Body) {
    const pos = candyBody.position;
    const radius = 22;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(this.candyRotation);

    // Candy wrapper side frills with gradient
    const frillGrad = ctx.createLinearGradient(-radius * 1.5, 0, radius * 1.5, 0);
    frillGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    frillGrad.addColorStop(0.5, 'rgba(254, 205, 211, 0.9)');
    frillGrad.addColorStop(1, 'rgba(255, 255, 255, 0.7)');

    ctx.fillStyle = frillGrad;
    // Left frill
    ctx.beginPath();
    ctx.moveTo(-radius + 2, 0);
    ctx.lineTo(-radius - 12, -8);
    ctx.lineTo(-radius - 10, 0);
    ctx.lineTo(-radius - 12, 8);
    ctx.closePath();
    ctx.fill();

    // Right frill
    ctx.beginPath();
    ctx.moveTo(radius - 2, 0);
    ctx.lineTo(radius + 12, -8);
    ctx.lineTo(radius + 10, 0);
    ctx.lineTo(radius + 12, 8);
    ctx.closePath();
    ctx.fill();

    // Circular Candy base with radial gradient
    const candyGrad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, 2, 0, 0, radius);
    candyGrad.addColorStop(0, '#ffffff'); // pure sugar shine
    candyGrad.addColorStop(0.2, '#fecdd3');
    candyGrad.addColorStop(0.6, '#e11d48'); // rich ruby strawberry
    candyGrad.addColorStop(1, '#9f1239');

    ctx.fillStyle = candyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Swirling red and white peppermint candy stripes
    ctx.save();
    ctx.clip();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const a = (i * Math.PI) / 2;
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        Math.cos(a + 0.4) * (radius * 0.7),
        Math.sin(a + 0.4) * (radius * 0.7),
        Math.cos(a) * radius,
        Math.sin(a) * radius
      );
      ctx.stroke();
    }
    ctx.restore();

    // Shiny candy rim
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.stroke();

    // Specular glossy reflection crescent
    ctx.beginPath();
    ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();

    ctx.restore();
  }

  private drawCreature(
    ctx: CanvasRenderingContext2D,
    physics: GamePhysics,
    mousePos: { x: number; y: number },
    skin: SkinDef,
    isVictory: boolean
  ) {
    const playerBody = physics.playerBody;
    const candyPos = physics.candyBody.position;
    const pos = playerBody.position;
    const vel = playerBody.velocity;
    const radius = 28;

    // 1. DEATH / ANGEL STATE (FluffyDie.png)
    if (physics.isDead && this.imagesLoaded.die && this.imgDie) {
      ctx.save();
      ctx.translate(pos.x, pos.y);

      // Golden glowing halo
      ctx.save();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(0, -36, 20, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Winged Fluffy sprite (476 x 261)
      const w = 92;
      const h = (261 / 476) * w;
      ctx.drawImage(this.imgDie, -w / 2, -h / 2, w, h);
      ctx.restore();
      return;
    }

    // Velocity stretch and squash
    const speed = Math.hypot(vel.x, vel.y);
    const stretch = Math.min(speed * 0.02, 0.22);
    const moveAngle = speed > 0.5 ? Math.atan2(vel.y, vel.x) : 0;

    // 2. HURT STATE (FluffyHurt.png strictly when losing a life)
    const isHurt = physics.isHurt;
    if (isHurt && this.imagesLoaded.hurt && this.imgHurt) {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(moveAngle);
      ctx.scale(1 + stretch, 1 - stretch * 0.6);
      ctx.rotate(-moveAngle);

      if (physics.invulnerableTimer > 0 && Math.floor(Date.now() / 90) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }

      if (skin.id === 'candyPink') ctx.filter = 'hue-rotate(300deg)';
      else if (skin.id === 'mint') ctx.filter = 'hue-rotate(150deg)';
      else if (skin.id === 'sunset') ctx.filter = 'hue-rotate(45deg) saturate(1.4)';
      else if (skin.id === 'cosmic') ctx.filter = 'hue-rotate(220deg)';

      const w = 60;
      const h = 64;
      ctx.drawImage(this.imgHurt, -w / 2, -h / 2 - 2, w, h);
      ctx.restore();
      return;
    }

    // 3. NORMAL STATE (FluffyNormal.png)
    if (this.imagesLoaded.normal && this.imgNormal) {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(moveAngle);
      ctx.scale(1 + stretch, 1 - stretch * 0.6);
      ctx.rotate(-moveAngle);

      if (physics.invulnerableTimer > 0 && Math.floor(Date.now() / 90) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }

      if (skin.id === 'candyPink') ctx.filter = 'hue-rotate(300deg)';
      else if (skin.id === 'mint') ctx.filter = 'hue-rotate(150deg)';
      else if (skin.id === 'sunset') ctx.filter = 'hue-rotate(45deg) saturate(1.4)';
      else if (skin.id === 'cosmic') ctx.filter = 'hue-rotate(220deg)';

      const w = 60;
      const h = 64;
      ctx.drawImage(this.imgNormal, -w / 2, -h / 2 - 2, w, h);
      ctx.restore();
      return;
    }

    // Fallback: procedural vector creature
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(moveAngle);
    ctx.scale(1 + stretch, 1 - stretch * 0.6);
    ctx.rotate(-moveAngle);

    // Cute Furry Tufts around perimeter (procedural fluff with bezier curves)
    const tuftCount = 18;
    ctx.fillStyle = skin.bodyGradient[1];
    ctx.beginPath();
    for (let i = 0; i < tuftCount; i++) {
      const angle = (i * Math.PI * 2) / tuftCount;
      const nextAngle = ((i + 1) * Math.PI * 2) / tuftCount;
      const midAngle = (angle + nextAngle) / 2;
      const tuftR = radius + 3.8;

      const x1 = Math.cos(angle) * radius;
      const y1 = Math.sin(angle) * radius;
      const xMid = Math.cos(midAngle) * tuftR;
      const yMid = Math.sin(midAngle) * tuftR;
      const x2 = Math.cos(nextAngle) * radius;
      const y2 = Math.sin(nextAngle) * radius;

      if (i === 0) ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(xMid, yMid, x2, y2);
    }
    ctx.closePath();
    ctx.fill();

    // Main Body Sphere with luscious multi-stop radial gradient
    const bodyGrad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, 2, 0, 0, radius);
    bodyGrad.addColorStop(0, skin.highlightColor);
    bodyGrad.addColorStop(0.3, skin.bodyGradient[0]);
    bodyGrad.addColorStop(0.7, skin.bodyGradient[1]);
    bodyGrad.addColorStop(1, skin.bodyGradient[2]);

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Outer subtle fluffy stroke
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = skin.bodyGradient[2];
    ctx.stroke();

    // Gaze tracking: Creature looks toward candy if close, otherwise looks at mouse cursor
    const candyDist = Math.hypot(candyPos.x - pos.x, candyPos.y - pos.y);
    const target = candyDist < 250 ? candyPos : mousePos;
    const lookAngle = Math.atan2(target.y - pos.y, target.x - pos.x);
    const lookDist = Math.min(6, Math.hypot(target.x - pos.x, target.y - pos.y) * 0.03);
    const pupilOffsetX = Math.cos(lookAngle) * lookDist;
    const pupilOffsetY = Math.sin(lookAngle) * lookDist;

    // Big expressive cartoon eyes!
    const eyeOffsetX = 8;
    const eyeOffsetY = -5;
    const eyeRadius = 9;

    [-eyeOffsetX, eyeOffsetX].forEach((ex) => {
      ctx.save();
      ctx.translate(ex, eyeOffsetY);

      if (this.isBlinking) {
        // Blinking line
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-eyeRadius + 2, 0);
        ctx.quadraticCurveTo(0, 3, eyeRadius - 2, 0);
        ctx.stroke();
      } else {
        // Sclera with radial gradient
        const eyeGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, eyeRadius);
        eyeGrad.addColorStop(0, '#ffffff');
        eyeGrad.addColorStop(0.85, '#f8fafc');
        eyeGrad.addColorStop(1, '#cbd5e1');

        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.arc(0, 0, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        // Big shiny pupil
        const pupilRadius = 5.2;
        ctx.fillStyle = skin.eyeColor;
        ctx.beginPath();
        ctx.arc(pupilOffsetX, pupilOffsetY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        // Specular glint in pupil
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pupilOffsetX - 2, pupilOffsetY - 2, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pupilOffsetX + 2, pupilOffsetY + 2, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // Cute Cheeks blush
    const blushGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 5);
    blushGrad.addColorStop(0, 'rgba(244, 114, 182, 0.6)');
    blushGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
    ctx.fillStyle = blushGrad;

    ctx.save();
    ctx.translate(-14, 5);
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(14, 5);
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Cute Mouth!
    ctx.save();
    ctx.translate(0, 8);

    if (this.mouthOpenProgress > 0.1 || isVictory) {
      // Open mouth (cheering, eating candy, shooting tongue)
      const mouthScale = Math.max(this.mouthOpenProgress, isVictory ? 1 : 0);
      ctx.fillStyle = '#831843';
      ctx.beginPath();
      ctx.arc(0, 0, 6 * mouthScale, 0, Math.PI);
      ctx.closePath();
      ctx.fill();

      // Cute tiny tongue in mouth
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(0, 3 * mouthScale, 3.5 * mouthScale, 0, Math.PI);
      ctx.fill();
    } else {
      // Happy smiling curved mouth
      ctx.strokeStyle = skin.bodyGradient[2];
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.quadraticCurveTo(0, 4, 5, 0);
      ctx.stroke();
    }

    ctx.restore();

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      if (p.angle !== undefined) ctx.rotate(p.angle);

      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        // Draw 5-pointed star
        ctx.beginPath();
        for (let s = 0; s < 5; s++) {
          const a = (s * Math.PI * 2) / 5 - Math.PI / 2;
          const aInner = a + Math.PI / 5;
          const rOuter = p.size;
          const rInner = p.size * 0.45;
          if (s === 0) ctx.moveTo(Math.cos(a) * rOuter, Math.sin(a) * rOuter);
          else ctx.lineTo(Math.cos(a) * rOuter, Math.sin(a) * rOuter);
          ctx.lineTo(Math.cos(aInner) * rInner, Math.sin(aInner) * rInner);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'shard') {
        // Ice shard diamond
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.5);
        ctx.lineTo(p.size * 0.8, 0);
        ctx.lineTo(0, p.size * 1.5);
        ctx.lineTo(-p.size * 0.8, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        // Circle / puff
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
