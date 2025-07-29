import Phaser from 'phaser';
import { GAME_CONFIG, TILE_TYPES } from '../utils/constants';
import { LevelManager } from '../systems/LevelManager';
import { Player } from '../entities/Player';
import { Guard } from '../entities/Guard';
import { Gold } from '../entities/Gold';
import { SpriteGenerator } from '../utils/SpriteGenerator';

export class GameScene extends Phaser.Scene {
  private levelManager!: LevelManager;
  private terrainLayer!: Phaser.GameObjects.Layer;
  private player!: Player;
  private guards: Guard[] = [];
  private goldItems: Gold[] = [];
  private terrainGroup!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: 'GameScene' });
  }

  async create() {
    // Ensure keyboard input is enabled
    this.input.keyboard!.enabled = true;
    
    // Generate all sprites at startup
    SpriteGenerator.generateAllSprites(this);
    
    this.levelManager = new LevelManager();
    await this.levelManager.loadLevels();
    
    if (this.levelManager.setCurrentLevel(1)) {
      this.createLevel();
      this.debugLadderPositions();
    } else {
      console.error('Failed to load level 1');
    }
  }

  private debugLadderPositions() {
    const level = this.levelManager.getCurrentLevel();
    if (!level) return;
    
    console.log('=== LADDER POSITIONS ===');
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        if (level.terrain[y][x] === TILE_TYPES.LADDER) {
          const worldX = x * GAME_CONFIG.TILE_SIZE;
          const worldY = y * GAME_CONFIG.TILE_SIZE;
          console.log(`Ladder at tile (${x}, ${y}) = world (${worldX}, ${worldY})`);
        }
      }
    }
    console.log('========================');
  }

  private createLevel() {
    this.terrainGroup = this.physics.add.staticGroup();
    this.terrainLayer = this.add.layer();
    this.renderTerrain();
    this.createPlayer();
    this.createGuards();
    this.createGold();
    this.setupCollisions();
  }

  private createPlayer() {
    const playerStart = this.levelManager.findPlayerStart();
    console.log('Player start position:', playerStart);
    if (playerStart) {
      this.player = new Player(this, playerStart.x, playerStart.y, this.levelManager);
      console.log('Player created at:', this.player.x, this.player.y);
    } else {
      console.error('No player start position found!');
    }
  }

  private createGuards() {
    const guardStarts = this.levelManager.findGuardStarts();
    console.log('Guard start positions:', guardStarts);
    
    this.guards = [];
    guardStarts.forEach((guardStart, index) => {
      const guard = new Guard(this, guardStart.x, guardStart.y, this.levelManager, this.player);
      this.guards.push(guard);
      console.log(`Guard ${index + 1} created at:`, guard.x, guard.y);
    });
  }

  private createGold() {
    const goldPositions = this.levelManager.findGoldPositions();
    console.log('Gold positions:', goldPositions);
    
    this.goldItems = [];
    goldPositions.forEach((goldPos, index) => {
      const gold = new Gold(this, goldPos.x, goldPos.y);
      this.goldItems.push(gold);
      console.log(`Gold ${index + 1} created at:`, gold.x, gold.y);
    });
  }

  update(time: number) {
    if (this.player) {
      this.player.update();
    }
    
    // Update all guards
    this.guards.forEach(guard => {
      guard.update(time);
    });
  }

  renderTerrain() {
    this.terrainLayer.removeAll(true);
    this.terrainGroup.clear(true, true);
    const level = this.levelManager.getCurrentLevel();
    if (!level) return;

    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const tileType = level.terrain[y][x];
        const worldX = x * GAME_CONFIG.TILE_SIZE;
        const worldY = y * GAME_CONFIG.TILE_SIZE;

        let textureName: string = '';
        let shouldRender = true;

        switch (tileType) {
          case TILE_TYPES.BRICK:
            textureName = 'brick';
            break;
          case TILE_TYPES.METAL:
            textureName = 'metal';
            break;
          case TILE_TYPES.LADDER:
            textureName = 'ladder';
            break;
          case TILE_TYPES.POLE:
            textureName = 'pole';
            break;
          case TILE_TYPES.GOLD:
            textureName = 'gold';
            break;
          default:
            shouldRender = false;
            break;
        }

        if (shouldRender) {
          const tile = this.add.image(
            worldX + GAME_CONFIG.TILE_SIZE / 2,
            worldY + GAME_CONFIG.TILE_SIZE / 2,
            textureName
          );
          
          tile.setDisplaySize(GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
          
          this.terrainLayer.add(tile);
          
          // Add physics body for solid tiles only (not ladders/poles)
          if (tileType === TILE_TYPES.BRICK || tileType === TILE_TYPES.METAL) {
            const rect = this.add.rectangle(
              worldX + GAME_CONFIG.TILE_SIZE / 2,
              worldY + GAME_CONFIG.TILE_SIZE / 2,
              GAME_CONFIG.TILE_SIZE,
              GAME_CONFIG.TILE_SIZE
            );
            rect.visible = false;
            const physicsBody = this.physics.add.existing(rect, true);
            this.terrainGroup.add(physicsBody);
          }
        }
      }
    }
  }

  private setupCollisions() {
    if (this.player && this.terrainGroup) {
      this.physics.add.collider(this.player, this.terrainGroup);
    }
    
    // Add collisions between guards and terrain
    this.guards.forEach(guard => {
      this.physics.add.collider(guard, this.terrainGroup);
    });
    
    // Add collision detection between player and guards (disabled for movement testing)
    // this.guards.forEach(guard => {
    //   this.physics.add.overlap(this.player, guard, this.handlePlayerGuardCollision, undefined, this);
    // });
    
    // Add collision detection between player and gold
    this.goldItems.forEach(gold => {
      this.physics.add.overlap(this.player, gold, this.handlePlayerGoldCollision, undefined, this);
    });
  }

  private handlePlayerGuardCollision() {
    console.log('Player caught by guard! Game Over!');
    // For now, just log the collision - later we can add game over logic
    // this.scene.restart(); // Uncomment to restart level on collision
  }

  private handlePlayerGoldCollision(_player: any, gold: any) {
    const goldSprite = gold as Gold;
    if (!goldSprite.isCollected()) {
      goldSprite.collect();
      
      // Check if all gold collected
      const remainingGold = this.goldItems.filter(g => !g.isCollected());
      if (remainingGold.length === 0) {
        console.log('All gold collected! Level complete!');
        // TODO: Add level completion logic
      }
    }
  }
}