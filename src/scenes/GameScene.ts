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
            // Don't render gold tiles here - they are handled by Gold entities
            shouldRender = false;
            break;
          case TILE_TYPES.PLAYER_START:
            // Don't render player start tiles - they are handled by Player entity
            shouldRender = false;
            break;
          case TILE_TYPES.GUARD_START:
            // Don't render guard start tiles - they are handled by Guard entities
            shouldRender = false;
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

  // Disabled for movement testing
  // private handlePlayerGuardCollision() {
  //   console.log('Player caught by guard! Game Over!');
  //   // For now, just log the collision - later we can add game over logic
  //   // this.scene.restart(); // Uncomment to restart level on collision
  // }

  private handlePlayerGoldCollision(_player: any, gold: any) {
    const goldSprite = gold as Gold;
    if (!goldSprite.isCollected()) {
      goldSprite.collect();
      
      // Check if all gold collected
      const remainingGold = this.goldItems.filter(g => !g.isCollected());
      if (remainingGold.length === 0) {
        console.log('All gold collected! Creating exit ladder...');
        this.createExitLadder();
      }
    }
  }

  private createExitLadder() {
    const level = this.levelManager.getCurrentLevel();
    if (!level) return;

    // Find the center-top position for the exit ladder
    const centerX = Math.floor(level.width / 2);
    const topY = 1; // Just below the top border

    // Add exit ladder to level data
    level.terrain[topY][centerX] = TILE_TYPES.LADDER;

    // Create visual ladder sprite
    const worldX = centerX * GAME_CONFIG.TILE_SIZE;
    const worldY = topY * GAME_CONFIG.TILE_SIZE;

    const exitLadder = this.add.image(
      worldX + GAME_CONFIG.TILE_SIZE / 2,
      worldY + GAME_CONFIG.TILE_SIZE / 2,
      'ladder'
    );
    
    exitLadder.setDisplaySize(GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
    exitLadder.setTint(0xFFD700); // Golden tint to show it's the exit
    this.terrainLayer.add(exitLadder);

    console.log(`Exit ladder created at tile (${centerX}, ${topY})`);

    // Check for player reaching the exit
    this.time.addEvent({
      delay: 100,
      callback: this.checkExitLadder,
      callbackScope: this,
      loop: true
    });
  }

  private checkExitLadder() {
    if (!this.player) return;

    const playerTileX = Math.floor(this.player.x / GAME_CONFIG.TILE_SIZE);
    const playerTileY = Math.floor(this.player.y / GAME_CONFIG.TILE_SIZE);

    const level = this.levelManager.getCurrentLevel();
    if (!level) return;

    const centerX = Math.floor(level.width / 2);
    const exitY = 1; // Exit ladder position

    // Check if player reached the exit ladder position
    if (playerTileX === centerX && playerTileY === exitY) {
      console.log('Player reached exit ladder! Level completed!');
      this.completeLevel();
    }
  }

  private completeLevel() {
    // Show level completion message
    const completionText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      'LEVEL COMPLETE!\nPress SPACE to continue',
      {
        fontSize: '32px',
        color: '#FFD700',
        align: 'center'
      }
    );
    completionText.setOrigin(0.5, 0.5);

    // Pause the game
    this.physics.pause();

    // Listen for space key to restart or continue
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }
}