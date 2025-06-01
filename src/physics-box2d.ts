import { IPhysics } from './IPhysics';
import { StageDef } from './data/maps';
import Box2DFactory from 'box2d-wasm';
import { MapEntity, MapEntityState } from './types/MapEntity.type';

export class Box2dPhysics implements IPhysics {
  private Box2D!: typeof Box2D & EmscriptenModule;
  private gravity!: Box2D.b2Vec2;
  private world!: Box2D.b2World;

  private marbleMap: { [id: number]: Box2D.b2Body } = {};
  private entities: ({ body: Box2D.b2Body } & MapEntityState)[] = [];

  private deleteCandidates: Box2D.b2Body[] = [];

  async init(): Promise<void> {
    try {
      console.log('🔧 Initializing Box2D WebAssembly...');
      console.log('🌐 Current URL:', window.location.href);
      console.log('🔍 WebAssembly support:', typeof WebAssembly === 'object');
      
      if (typeof WebAssembly !== 'object') {
        throw new Error('WebAssembly is not supported in this browser');
      }

      this.Box2D = await Box2DFactory();
      this.gravity = new this.Box2D.b2Vec2(0, 10);
      this.world = new this.Box2D.b2World(this.gravity);
      console.log('✅ Box2D WebAssembly initialized successfully');
    } catch (error: unknown) {
      console.error('❌ Failed to initialize Box2D WebAssembly:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Show user-friendly error message
      this.showLoadingError(error);
      throw error;
    }
  }

  private showLoadingError(error: unknown) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 68, 68, 0.95);
      color: white;
      padding: 2rem;
      border-radius: 15px;
      max-width: 500px;
      text-align: center;
      font-family: 'Orbitron', monospace;
      z-index: 9999;
      backdrop-filter: blur(10px);
      border: 2px solid #ff4444;
      box-shadow: 0 20px 60px rgba(255, 68, 68, 0.4);
    `;
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    errorDiv.innerHTML = `
      <h2 style="margin-bottom: 1rem; color: #fff;">⚠️ Quantum Engine Error</h2>
      <p style="margin-bottom: 1rem;">The physics engine failed to initialize.</p>
      <p style="margin-bottom: 1rem; font-size: 0.9em; opacity: 0.8;">
        This usually happens when WebAssembly files aren't loading correctly.
      </p>
      <details style="text-align: left; margin-top: 1rem;">
        <summary style="cursor: pointer; margin-bottom: 0.5rem;">Technical Details</summary>
        <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 5px; font-size: 0.8em; overflow: auto;">
Error: ${errorMessage || 'Unknown error'}

Troubleshooting:
- Check browser console for network errors
- Ensure WebAssembly is enabled
- Try refreshing the page
- Check if running on HTTPS (required for some browsers)
        </pre>
      </details>
      <button onclick="window.location.reload()" style="
        background: #ff4444;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 1rem;
        font-family: inherit;
      ">
        🔄 Retry
      </button>
    `;
    
    document.body.appendChild(errorDiv);
  }

  clear(): void {
    this.clearEntities();
  }

  clearMarbles(): void {
    Object.values(this.marbleMap).forEach((body) => {
      this.world.DestroyBody(body);
    });
    this.marbleMap = {};
  }

  createStage(stage: StageDef): void {
    this.createEntities(stage.entities);
  }

  createEntities(entities?: MapEntity[]) {
    if (!entities) return;

    const bodyTypes = {
      static: this.Box2D.b2_staticBody,
      kinematic: this.Box2D.b2_kinematicBody,
    } as const;

    entities.forEach((entity) => {
      const bodyDef = new this.Box2D.b2BodyDef();
      bodyDef.set_type(bodyTypes[entity.type]);
      const body = this.world.CreateBody(bodyDef);

      const fixtureDef = new this.Box2D.b2FixtureDef();
      fixtureDef.set_density(entity.props.density);
      fixtureDef.set_restitution(entity.props.restitution);

      let shape;
      switch (entity.shape.type) {
        case 'box':
          shape = new this.Box2D.b2PolygonShape();
          shape.SetAsBox(
            entity.shape.width,
            entity.shape.height,
            0,
            entity.shape.rotation,
          );
          fixtureDef.set_shape(shape);
          body.CreateFixture(fixtureDef);
          break;
        case 'polyline':
          shape = new this.Box2D.b2EdgeShape();
          for (let i = 0; i < entity.shape.points.length - 1; i++) {
            const p1 = entity.shape.points[i];
            const p2 = entity.shape.points[i + 1];
            const v1 = new this.Box2D.b2Vec2(p1[0], p1[1]);
            const v2 = new this.Box2D.b2Vec2(p2[0], p2[1]);
            const edge = new this.Box2D.b2EdgeShape();
            edge.SetTwoSided(v1, v2);
            body.CreateFixture(edge, 1);
          }
          break;
        case 'circle':
          shape = new this.Box2D.b2CircleShape();
          shape.set_m_radius(entity.shape.radius);
          fixtureDef.set_shape(shape);
          body.CreateFixture(fixtureDef);
          break;
      }

      body.SetAngularVelocity(entity.props.angularVelocity);
      body.SetTransform(
        new this.Box2D.b2Vec2(entity.position.x, entity.position.y),
        0,
      );
      this.entities.push({
        body,
        x: entity.position.x,
        y: entity.position.y,
        angle: 0,
        shape: entity.shape,
        life: entity.props.life ?? -1,
      });
    });
  }

  clearEntities() {
    this.entities.forEach((entity) => {
      this.world.DestroyBody(entity.body);
    });
    this.entities = [];
  }

  createMarble(id: number, x: number, y: number): void {
    const circleShape = new this.Box2D.b2CircleShape();
    circleShape.set_m_radius(0.25);

    const bodyDef = new this.Box2D.b2BodyDef();
    bodyDef.set_type(this.Box2D.b2_dynamicBody);
    bodyDef.set_position(new this.Box2D.b2Vec2(x, y));

    const body = this.world.CreateBody(bodyDef);
    body.CreateFixture(circleShape, 1 + Math.random());
    body.SetAwake(false);
    body.SetEnabled(false);
    this.marbleMap[id] = body;
  }

  shakeMarble(id: number): void {
    const body = this.marbleMap[id];
    if (body) {
      body.ApplyLinearImpulseToCenter(
        new this.Box2D.b2Vec2(Math.random() * 10 - 5, Math.random() * 10 - 5),
        true,
      );
    }
  }

  removeMarble(id: number): void {
    const marble = this.marbleMap[id];
    if (marble) {
      this.world.DestroyBody(marble);
      delete this.marbleMap[id];
    }
  }

  getMarblePosition(id: number): { x: number; y: number; angle: number } {
    const marble = this.marbleMap[id];
    if (marble) {
      const pos = marble.GetPosition();
      return { x: pos.x, y: pos.y, angle: marble.GetAngle() };
    } else {
      return { x: 0, y: 0, angle: 0 };
    }
  }

  getEntities(): MapEntityState[] {
    return this.entities.map((entity) => {
      return {
        ...entity,
        angle: entity.body.GetAngle(),
      };
    });
  }

  impact(id: number): void {
    const src = this.marbleMap[id];
    if (!src) return;

    Object.values(this.marbleMap).forEach((body) => {
      if (body === src) return;

      const distVector = new this.Box2D.b2Vec2(
        body.GetPosition().x,
        body.GetPosition().y,
      );
      distVector.op_sub(src.GetPosition());
      const distSq = distVector.LengthSquared();

      if (distSq < 100) {
        distVector.Normalize();
        const power = 1 - distVector.Length() / 10;
        distVector.op_mul(power * power * 5);
        body.ApplyLinearImpulseToCenter(distVector, true);
      }
    });
  }

  start(): void {
    for (const key in this.marbleMap) {
      const marble = this.marbleMap[key];
      marble.SetAwake(true);
      marble.SetEnabled(true);
    }
  }

  step(deltaSeconds: number): void {
    this.deleteCandidates.forEach((body) => {
      this.world.DestroyBody(body);
    });
    this.deleteCandidates = [];

    this.world.Step(deltaSeconds, 6, 2);

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if (entity.life > 0) {
        const edge = entity.body.GetContactList();
        if (edge.contact && edge.contact.IsTouching()) {
          this.deleteCandidates.push(entity.body);
          this.entities.splice(i, 1);
        }
      }
    }
  }
}
