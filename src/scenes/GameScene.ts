import Phaser from 'phaser';
import { GAME_CONFIG, COLORS, TILE_TYPES } from '../utils/constants';
import { LevelManager } from '../systems/LevelManager';
import { Player } from '../entities/Player';

export class GameScene extends Phaser.Scene {
  private levelManager!: LevelManager;
  private terrainLayer!: Phaser.GameObjects.Layer;
  private player!: Player;
  private terrainGroup!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: 'GameScene' });
  }

  async create() {
    // Ensure keyboard input is enabled
    this.input.keyboard!.enabled = true;
    
    this.levelManager = new LevelManager();
    await this.levelManager.loadLevels();
    
    if (this.levelManager.setCurrentLevel(1)) {
      this.createLevel();
    } else {
      console.error('Failed to load level 1');
    }
  }

  private createLevel() {
    this.terrainGroup = this.physics.add.staticGroup();
    this.terrainLayer = this.add.layer();
    this.renderTerrain();
    this.createPlayer();
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

  update() {
    if (this.player) {
      this.player.update();
    }
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

        let color: number = 0x000000;
        let shouldRender = true;

        switch (tileType) {
          case TILE_TYPES.BRICK:
            color = COLORS.BRICK;
            break;
          case TILE_TYPES.METAL:
            color = COLORS.METAL;
            break;
          case TILE_TYPES.LADDER:
            color = COLORS.LADDER;
            break;
          case TILE_TYPES.POLE:
            color = COLORS.POLE;
            break;
          case TILE_TYPES.GOLD:
            color = COLORS.GOLD;
            break;
          case TILE_TYPES.PLAYER_START:
            color = COLORS.PLAYER;
            break;
          case TILE_TYPES.GUARD_START:
            color = COLORS.GUARD;
            break;
          default:
            shouldRender = false;
            break;
        }

        if (shouldRender) {
          const tile = this.add.rectangle(
            worldX + GAME_CONFIG.TILE_SIZE / 2,
            worldY + GAME_CONFIG.TILE_SIZE / 2,
            GAME_CONFIG.TILE_SIZE,
            GAME_CONFIG.TILE_SIZE,
            color
          );
          
          if (tileType === TILE_TYPES.LADDER) {
            tile.setStrokeStyle(2, 0x000000);
          } else if (tileType === TILE_TYPES.POLE) {
            tile.setSize(GAME_CONFIG.TILE_SIZE, 4);
          }
          
          this.terrainLayer.add(tile);
          
          // Add physics body for solid tiles
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
  }
}