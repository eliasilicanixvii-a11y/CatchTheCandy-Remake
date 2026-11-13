import Matter from 'matter-js';
import { LevelConfig, LevelObject, SurfaceType } from './types';
import { sound } from './audio';

const { Engine, World, Bodies, Body, Constraint, Query, Vector } = Matter;

export interface TongueState {
  isActive: boolean;
  isLatched: boolean;
  isIceSlipped: boolean;
  slipTimer: number; // for rendering slip sparks
  targetX: number;
  targetY: number;
  anchorX: number;
  anchorY: number;
  latchedBody: Matter.Body | null;
  currentTipX: number;
  currentTipY: number;
  progress: number; // 0 to 1 tongue extension animation
  length: number;
}

export interface GamePhysics {
  engine: Matter.Engine;
  world: Matter.World;
  playerBody: Matter.Body;
  candyBody: Matter.Body;
  levelBodies: Matter.Body[];
  tongueConstraint: Matter.Constraint | null;
  tongue: TongueState;
  bounds: { width: number; height: number };
  lives: number;
  maxLives: number;
  isDead: boolean;
  deathTimer: number;
  isHurt: boolean;
  hurtTimer: number;
  invulnerableTimer: number;
}

export function createGameWorld(level: LevelConfig): GamePhysics {
  const engine = Engine.create({
    gravity: { x: 0, y: 0.95 },
  });
  const world = engine.world;
  const bounds = { width: 1000, height: 600 };

  // World boundary walls to keep player inside arena
  const wallThick = 60;
  const leftWall = Bodies.rectangle(-wallThick / 2, bounds.height / 2, wallThick, bounds.height * 2, {
    isStatic: true,
    friction: 0.2,
    label: 'Left Boundary',
  });
  const rightWall = Bodies.rectangle(bounds.width + wallThick / 2, bounds.height / 2, wallThick, bounds.height * 2, {
    isStatic: true,
    friction: 0.2,
    label: 'Right Boundary',
  });
  const ceiling = Bodies.rectangle(bounds.width / 2, -wallThick / 2, bounds.width * 2, wallThick, {
    isStatic: true,
    friction: 0.2,
    label: 'Ceiling Boundary',
  });
  const floor = Bodies.rectangle(bounds.width / 2, bounds.height + wallThick / 2, bounds.width * 2, wallThick, {
    isStatic: true,
    friction: 0.4,
    label: 'Floor Boundary',
  });

  World.add(world, [leftWall, rightWall, ceiling, floor]);

  // Create Player Body
  const playerRadius = 26;
  const playerBody = Bodies.circle(level.playerStart.x, level.playerStart.y, playerRadius, {
    restitution: 0.25,
    friction: 0.35,
    frictionAir: 0.018,
    density: 0.003,
    label: 'Player',
  });
  (playerBody as unknown as { surfaceType: SurfaceType }).surfaceType = 'normal';

  // Create Candy Body
  const candyRadius = 20;
  const candyBody = Bodies.circle(level.candyStart.x, level.candyStart.y, candyRadius, {
    isStatic: !level.candyStart.isMovable,
    restitution: 0.45,
    friction: 0.2,
    density: 0.0015,
    label: 'Candy',
  });
  (candyBody as unknown as { surfaceType: SurfaceType }).surfaceType = 'normal';

  // Create Level Objects
  const levelBodies: Matter.Body[] = [];

  level.objects.forEach((obj: LevelObject, index: number) => {
    let body: Matter.Body;
    const isIce = obj.type === 'ice';
    const isBouncy = obj.type === 'bouncy';
    const isMovable = obj.type === 'movable';
    const isStatic = obj.isStatic !== undefined ? obj.isStatic : !isMovable;

    const options: Matter.IChamferableBodyDefinition = {
      isStatic,
      angle: obj.angle || 0,
      friction: isIce ? 0.001 : 0.6,
      frictionStatic: isIce ? 0.001 : 0.6,
      restitution: isBouncy ? 0.95 : 0.15,
      density: isMovable ? 0.0025 : 0.001,
      label: obj.label || `Object_${index}`,
    };

    if (obj.shape === 'circle') {
      const r = obj.radius || obj.width / 2;
      body = Bodies.circle(obj.x, obj.y, r, options);
    } else {
      body = Bodies.rectangle(obj.x, obj.y, obj.width, obj.height, options);
    }

    (body as unknown as { surfaceType: SurfaceType; originalObj: LevelObject }).surfaceType = obj.type;
    (body as unknown as { originalObj: LevelObject }).originalObj = obj;

    levelBodies.push(body);
  });

  World.add(world, [playerBody, candyBody, ...levelBodies]);

  const tongue: TongueState = {
    isActive: false,
    isLatched: false,
    isIceSlipped: false,
    slipTimer: 0,
    targetX: 0,
    targetY: 0,
    anchorX: 0,
    anchorY: 0,
    latchedBody: null,
    currentTipX: level.playerStart.x,
    currentTipY: level.playerStart.y,
    progress: 0,
    length: 0,
  };

  const physics: GamePhysics = {
    engine,
    world,
    playerBody,
    candyBody,
    levelBodies,
    tongueConstraint: null,
    tongue,
    bounds,
    lives: 3,
    maxLives: 3,
    isDead: false,
    deathTimer: 0,
    isHurt: false,
    hurtTimer: 0,
    invulnerableTimer: 0,
  };

  // Detect collisions with hazards or high-impact thuds
  Matter.Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const isA = pair.bodyA === playerBody;
      const isB = pair.bodyB === playerBody;
      if (isA || isB) {
        const other = isA ? pair.bodyB : pair.bodyA;
        const surfaceType = (other as unknown as { surfaceType?: SurfaceType }).surfaceType;
        if (surfaceType === 'hazard') {
          // If not currently invulnerable, lose a life and trigger hurt state
          if (physics.invulnerableTimer <= 0 && !physics.isDead) {
            physics.lives = Math.max(0, physics.lives - 1);
            physics.isHurt = true;
            physics.hurtTimer = 1.0;
            physics.invulnerableTimer = 1.5;
            releaseTongue(physics);
            sound.playHurt();

            // Knockback impulse away from spikes
            Body.setVelocity(playerBody, {
              x: (playerBody.velocity.x > 0 ? -1 : 1) * 3,
              y: -8,
            });

            // When out of lives, Fluffy ascends as an angel
            if (physics.lives <= 0) {
              physics.isDead = true;
              physics.deathTimer = 0;
            }
          }
        } else {
          const speed = Math.hypot(playerBody.velocity.x, playerBody.velocity.y);
          if (speed > 2.5) {
            sound.playBounce(Math.min(speed / 4, 1.5));
          }
        }
      }
    }
  });

  return physics;
}

/**
 * Shoot tongue towards a target point.
 * Performs raycasting against world bodies to find the nearest contact surface.
 */
export function shootTongue(
  physics: GamePhysics,
  targetX: number,
  targetY: number,
  onIceSlip?: (x: number, y: number) => void,
  onLatch?: (x: number, y: number) => void
): boolean {
  // Release any existing constraint
  releaseTongue(physics);

  const start = physics.playerBody.position;
  const end = { x: targetX, y: targetY };

  // Calculate direction and max ray distance (up to 750px)
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 10) return false;

  const maxDist = 720;
  const rayDist = Math.min(dist, maxDist);
  const dirX = dx / dist;
  const dirY = dy / dist;
  const rayEnd = {
    x: start.x + dirX * rayDist,
    y: start.y + dirY * rayDist,
  };

  sound.playTongueShoot();

  // Raycast query against level bodies and candy
  const candidateBodies = [...physics.levelBodies];
  if (!physics.candyBody.isStatic) {
    candidateBodies.push(physics.candyBody);
  }

  const collisions = Query.ray(candidateBodies, start, rayEnd, 6);

  if (collisions.length > 0) {
    // Find collision closest to the player
    let closestCollision = collisions[0];
    let minD = Infinity;
    let hitPoint = rayEnd;

    for (const col of collisions) {
      // Find approximate intersection point
      const body = col.bodyA === physics.playerBody ? col.bodyB : col.bodyA;
      const bPos = body.position;
      const d = Math.hypot(bPos.x - start.x, bPos.y - start.y);
      if (d < minD) {
        minD = d;
        closestCollision = col;
      }
    }

    const hitBody = closestCollision.bodyA === physics.playerBody ? closestCollision.bodyB : closestCollision.bodyA;
    const surfaceType = (hitBody as unknown as { surfaceType?: SurfaceType }).surfaceType || 'normal';

    // Approximate exact hit location by clamping ray to body edge
    const bodyCenter = hitBody.position;
    // Projection of bodyCenter onto ray
    const vx = bodyCenter.x - start.x;
    const vy = bodyCenter.y - start.y;
    const proj = Math.max(10, Math.min(rayDist, vx * dirX + vy * dirY));
    hitPoint = {
      x: start.x + dirX * proj,
      y: start.y + dirY * proj,
    };

    if (surfaceType === 'ice') {
      // ICE SLIP! The tongue hits ice and slides off!
      physics.tongue.isActive = true;
      physics.tongue.isLatched = false;
      physics.tongue.isIceSlipped = true;
      physics.tongue.slipTimer = 0.45;
      physics.tongue.targetX = hitPoint.x;
      physics.tongue.targetY = hitPoint.y;
      physics.tongue.currentTipX = hitPoint.x;
      physics.tongue.currentTipY = hitPoint.y;

      sound.playIceSlip();
      if (onIceSlip) onIceSlip(hitPoint.x, hitPoint.y);
      return false;
    }

    if (surfaceType === 'hazard') {
      // Hazard spike: tongue slips or creature takes bounce
      sound.playIceSlip();
      return false;
    }

    // Normal or Movable or Bouncy surface: LATCH ON!
    physics.tongue.isActive = true;
    physics.tongue.isLatched = true;
    physics.tongue.isIceSlipped = false;
    physics.tongue.anchorX = hitPoint.x;
    physics.tongue.anchorY = hitPoint.y;
    physics.tongue.targetX = hitPoint.x;
    physics.tongue.targetY = hitPoint.y;
    physics.tongue.currentTipX = hitPoint.x;
    physics.tongue.currentTipY = hitPoint.y;
    physics.tongue.latchedBody = hitBody;

    // Create elastic constraint
    const currentDist = Math.hypot(hitPoint.x - start.x, hitPoint.y - start.y);
    physics.tongue.length = currentDist;

    // If attached to a movable body, use relative pointA/pointB
    if (!hitBody.isStatic) {
      const relPointB = {
        x: hitPoint.x - hitBody.position.x,
        y: hitPoint.y - hitBody.position.y,
      };

      physics.tongueConstraint = Constraint.create({
        bodyA: physics.playerBody,
        bodyB: hitBody,
        pointB: relPointB,
        stiffness: 0.075,
        damping: 0.04,
        length: Math.max(15, currentDist * 0.4),
      });
    } else {
      // Static anchor
      physics.tongueConstraint = Constraint.create({
        bodyA: physics.playerBody,
        pointB: hitPoint,
        stiffness: 0.08,
        damping: 0.04,
        length: Math.max(15, currentDist * 0.4),
      });
    }

    World.add(physics.world, physics.tongueConstraint);
    sound.playLatchNormal();
    if (onLatch) onLatch(hitPoint.x, hitPoint.y);
    return true;
  } else {
    // Air shoot (missed)
    physics.tongue.isActive = true;
    physics.tongue.isLatched = false;
    physics.tongue.isIceSlipped = false;
    physics.tongue.targetX = rayEnd.x;
    physics.tongue.targetY = rayEnd.y;
    physics.tongue.currentTipX = rayEnd.x;
    physics.tongue.currentTipY = rayEnd.y;
    return false;
  }
}

/**
 * Release the tongue and remove any active physical constraint
 */
export function releaseTongue(physics: GamePhysics) {
  if (physics.tongueConstraint) {
    World.remove(physics.world, physics.tongueConstraint);
    physics.tongueConstraint = null;
  }
  physics.tongue.isActive = false;
  physics.tongue.isLatched = false;
  physics.tongue.latchedBody = null;
}

/**
 * Advance physics step and update tongue contraction
 */
export function stepPhysics(physics: GamePhysics, dt: number) {
  // Update invulnerability timer
  if (physics.invulnerableTimer > 0) {
    physics.invulnerableTimer -= dt;
  }

  // Update hurt timer (shows FluffyHurt.png)
  if (physics.hurtTimer > 0) {
    physics.hurtTimer -= dt;
    if (physics.hurtTimer <= 0) {
      physics.isHurt = false;
    }
  }

  // If dead, float gently upwards like an angel
  if (physics.isDead) {
    physics.deathTimer += dt;
    Body.setVelocity(physics.playerBody, { x: 0, y: -1.6 });
    Body.setPosition(physics.playerBody, {
      x: physics.playerBody.position.x,
      y: physics.playerBody.position.y - 1.2,
    });
    return;
  }

  // Update ice slip visual timer
  if (physics.tongue.slipTimer > 0) {
    physics.tongue.slipTimer -= dt;
    if (physics.tongue.slipTimer <= 0) {
      physics.tongue.isIceSlipped = false;
      physics.tongue.isActive = false;
    }
  }

  // If tongue is actively pulling, gradually reel in constraint length to pull creature closer!
  if (physics.tongueConstraint && physics.tongue.isLatched) {
    const minLen = 22;
    if (physics.tongueConstraint.length > minLen) {
      physics.tongueConstraint.length = Math.max(minLen, physics.tongueConstraint.length - 180 * dt);
    }

    // Apply supplementary pull force along tongue vector for responsive, delightful game feel
    const pPos = physics.playerBody.position;
    let aX = physics.tongue.anchorX;
    let aY = physics.tongue.anchorY;

    if (physics.tongue.latchedBody && !physics.tongue.latchedBody.isStatic) {
      aX = physics.tongue.latchedBody.position.x;
      aY = physics.tongue.latchedBody.position.y;
    }

    const tDx = aX - pPos.x;
    const tDy = aY - pPos.y;
    const tDist = Math.hypot(tDx, tDy);

    if (tDist > 10) {
      const forceMag = 0.0016;
      Body.applyForce(physics.playerBody, pPos, {
        x: (tDx / tDist) * forceMag,
        y: (tDy / tDist) * forceMag,
      });

      // If latched to movable body, pull it reciprocally
      if (physics.tongue.latchedBody && !physics.tongue.latchedBody.isStatic) {
        Body.applyForce(physics.tongue.latchedBody, physics.tongue.latchedBody.position, {
          x: -(tDx / tDist) * forceMag * 0.8,
          y: -(tDy / tDist) * forceMag * 0.8,
        });
      }
    }
  }

  // Step Matter engine with recommended clamped delta <= 16.666 ms
  const timeStep = Math.min(dt * 1000, 16.666);
  Engine.update(physics.engine, timeStep);
}
