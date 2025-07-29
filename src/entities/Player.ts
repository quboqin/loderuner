import Phaser from 'phaser';
import { GAME_CONFIG, COLORS, KEYS, TILE_TYPES } from '../utils/constants';
import { LevelManager } from '../systems/LevelManager';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private levelManager: LevelManager;
  private isOnLadder = false;
  private isOnPole = false;
  private moveSpeed = 150;

  constructor(scene: Phaser.Scene, x: number, y: number, levelManager: LevelManager) {
    // Create visual first
    Player.createPlayerTexture(scene);
    
    super(scene, x, y, 'player');
    
    this.levelManager = levelManager;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setSize(GAME_CONFIG.TILE_SIZE - 4, GAME_CONFIG.TILE_SIZE - 4);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(0);
    body.setDragX(0);
    
    this.createKeys();
  }

  private createKeys() {
    this.keys = {
      left: this.scene.input.keyboard!.addKey(KEYS.LEFT),
      right: this.scene.input.keyboard!.addKey(KEYS.RIGHT),
      up: this.scene.input.keyboard!.addKey(KEYS.UP),
      down: this.scene.input.keyboard!.addKey(KEYS.DOWN),
      digLeft: this.scene.input.keyboard!.addKey(KEYS.DIG_LEFT),
      digRight: this.scene.input.keyboard!.addKey(KEYS.DIG_RIGHT)
    };
  }

  static createPlayerTexture(scene: Phaser.Scene) {
    if (!scene.textures.exists('player')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(COLORS.PLAYER);
      graphics.fillRect(0, 0, GAME_CONFIG.TILE_SIZE - 4, GAME_CONFIG.TILE_SIZE - 4);
      graphics.generateTexture('player', GAME_CONFIG.TILE_SIZE - 4, GAME_CONFIG.TILE_SIZE - 4);
      graphics.destroy();
    }
  }

  update() {
    this.handleInput();
    this.checkTileCollisions();
  }

  private handleInput() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    body.setVelocityX(0);
    
    if (!this.isOnLadder) {
      body.setGravityY(300);
    } else {
      body.setGravityY(0);
      body.setVelocityY(0);
    }

    if (this.keys.left.isDown) {
      body.setVelocityX(-this.moveSpeed);
    } else if (this.keys.right.isDown) {
      body.setVelocityX(this.moveSpeed);
    }

    if (this.isOnLadder) {
      if (this.keys.up.isDown) {
        body.setVelocityY(-this.moveSpeed);
      } else if (this.keys.down.isDown) {
        body.setVelocityY(this.moveSpeed);
      }
    }

    if (this.isOnPole && (this.keys.up.isDown || this.keys.down.isDown)) {
      if (this.keys.up.isDown && this.canMoveUp()) {
        body.setVelocityY(-this.moveSpeed);
        body.setGravityY(0);
      } else if (this.keys.down.isDown) {
        body.setGravityY(300);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.digLeft)) {
      this.digHole(-1, 1);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.digRight)) {
      this.digHole(1, 1);
    }
  }

  private checkTileCollisions() {
    const tileX = Math.floor(this.x / GAME_CONFIG.TILE_SIZE);
    const tileY = Math.floor(this.y / GAME_CONFIG.TILE_SIZE);
    
    const currentTile = this.levelManager.getTileAt(tileX, tileY);
    const belowTile = this.levelManager.getTileAt(tileX, tileY + 1);
    
    this.isOnLadder = currentTile === TILE_TYPES.LADDER;
    this.isOnPole = currentTile === TILE_TYPES.POLE || belowTile === TILE_TYPES.POLE;
  }

  private canMoveUp(): boolean {
    const tileX = Math.floor(this.x / GAME_CONFIG.TILE_SIZE);
    const tileY = Math.floor((this.y - GAME_CONFIG.TILE_SIZE) / GAME_CONFIG.TILE_SIZE);
    const aboveTile = this.levelManager.getTileAt(tileX, tileY);
    
    return aboveTile === TILE_TYPES.EMPTY || aboveTile === TILE_TYPES.LADDER || aboveTile === TILE_TYPES.POLE;
  }

  private digHole(directionX: number, directionY: number) {
    const tileX = Math.floor(this.x / GAME_CONFIG.TILE_SIZE) + directionX;
    const tileY = Math.floor(this.y / GAME_CONFIG.TILE_SIZE) + directionY;
    
    const targetTile = this.levelManager.getTileAt(tileX, tileY);
    
    if (targetTile === TILE_TYPES.BRICK) {
      this.levelManager.setTileAt(tileX, tileY, TILE_TYPES.EMPTY);
      
      setTimeout(() => {
        this.levelManager.setTileAt(tileX, tileY, TILE_TYPES.BRICK);
        (this.scene as any).renderTerrain?.();
      }, 3000);
      
      (this.scene as any).renderTerrain?.();
    }
  }
}