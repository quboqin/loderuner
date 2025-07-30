import Phaser from 'phaser';
import { GAME_CONFIG, TILE_TYPES } from '../utils/constants';
import { LevelManager } from '../systems/LevelManager';
import { Player } from './Player';
import { SpriteGenerator } from '../utils/SpriteGenerator';

export class Guard extends Phaser.Physics.Arcade.Sprite {
  private levelManager: LevelManager;
  private player: Player;
  private moveSpeed = 120;
  private isOnLadder = false;
  private nextMoveTime = 0;
  private moveDelay = 100; // Milliseconds between AI decisions

  constructor(scene: Phaser.Scene, x: number, y: number, levelManager: LevelManager, player: Player) {
    // Create visual first
    SpriteGenerator.createGuardSprite(scene);
    
    super(scene, x, y, 'guard');
    
    this.levelManager = levelManager;
    this.player = player;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setDepth(90); // Below player but above terrain
    
    this.setSize(GAME_CONFIG.TILE_SIZE - 4, GAME_CONFIG.TILE_SIZE - 4);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(0);
    body.setDragX(0);
    
    console.log('Guard created at:', this.x, this.y);
  }


  update(time: number) {
    if (!this.body) {
      return;
    }
    
    this.checkTileCollisions();
    
    // AI decision making with delay to make movement less jittery
    if (time > this.nextMoveTime) {
      this.makeAIDecision();
      this.nextMoveTime = time + this.moveDelay;
    }
  }

  private checkTileCollisions() {
    const tileX = Math.floor(this.x / GAME_CONFIG.TILE_SIZE);
    const tileY = Math.floor(this.y / GAME_CONFIG.TILE_SIZE);
    
    const currentTile = this.levelManager.getTileAt(tileX, tileY);
    
    this.isOnLadder = currentTile === TILE_TYPES.LADDER;
  }

  private makeAIDecision() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Get positions in tile coordinates
    const guardTileX = Math.floor(this.x / GAME_CONFIG.TILE_SIZE);
    const guardTileY = Math.floor(this.y / GAME_CONFIG.TILE_SIZE);
    const playerTileX = Math.floor(this.player.x / GAME_CONFIG.TILE_SIZE);
    const playerTileY = Math.floor(this.player.y / GAME_CONFIG.TILE_SIZE);
    
    // Calculate distance to player
    const deltaX = playerTileX - guardTileX;
    const deltaY = playerTileY - guardTileY;
    
    // Reset velocity
    body.setVelocityX(0);
    
    // Handle gravity and ladder physics
    if (!this.isOnLadder) {
      body.setGravityY(300);
    } else {
      body.setGravityY(0);
      body.setVelocityY(0);
    }
    
    // Vertical movement (priority for ladders)
    if (Math.abs(deltaY) > 0 && this.isOnLadder) {
      if (deltaY < 0) { // Player is above
        body.setVelocityY(-this.moveSpeed);
      } else if (deltaY > 0) { // Player is below
        body.setVelocityY(this.moveSpeed);
      }
    }
    // If not on ladder but need to go up/down, look for nearby ladders
    else if (Math.abs(deltaY) > 0) {
      // Check for ladders to left and right to reach different levels
      const leftTile = this.levelManager.getTileAt(guardTileX - 1, guardTileY);
      const rightTile = this.levelManager.getTileAt(guardTileX + 1, guardTileY);
      
      if (leftTile === TILE_TYPES.LADDER && this.canMoveLeft()) {
        body.setVelocityX(-this.moveSpeed);
      } else if (rightTile === TILE_TYPES.LADDER && this.canMoveRight()) {
        body.setVelocityX(this.moveSpeed);
      }
    }
    
    // Horizontal movement (when on same level or no vertical path available)
    if (Math.abs(deltaX) > 0 && Math.abs(deltaY) <= 1) {
      if (deltaX < 0 && this.canMoveLeft()) {
        body.setVelocityX(-this.moveSpeed);
      } else if (deltaX > 0 && this.canMoveRight()) {
        body.setVelocityX(this.moveSpeed);
      }
    }
  }

  private canMoveLeft(): boolean {
    const tileX = Math.floor((this.x - GAME_CONFIG.TILE_SIZE) / GAME_CONFIG.TILE_SIZE);
    const tileY = Math.floor(this.y / GAME_CONFIG.TILE_SIZE);
    
    const leftTile = this.levelManager.getTileAt(tileX, tileY);
    
    // Can move if tile is empty, ladder, or pole - guards should fall into holes!
    return (leftTile === TILE_TYPES.EMPTY || leftTile === TILE_TYPES.LADDER || leftTile === TILE_TYPES.POLE);
  }

  private canMoveRight(): boolean {
    const tileX = Math.floor((this.x + GAME_CONFIG.TILE_SIZE) / GAME_CONFIG.TILE_SIZE);
    const tileY = Math.floor(this.y / GAME_CONFIG.TILE_SIZE);
    
    const rightTile = this.levelManager.getTileAt(tileX, tileY);
    
    // Can move if tile is empty, ladder, or pole - guards should fall into holes!
    return (rightTile === TILE_TYPES.EMPTY || rightTile === TILE_TYPES.LADDER || rightTile === TILE_TYPES.POLE);
  }

  // Method to handle being trapped in a hole
  public isTrapped(): boolean {
    const tileX = Math.floor(this.x / GAME_CONFIG.TILE_SIZE);
    const tileY = Math.floor(this.y / GAME_CONFIG.TILE_SIZE);
    
    const leftTile = this.levelManager.getTileAt(tileX - 1, tileY);
    const rightTile = this.levelManager.getTileAt(tileX + 1, tileY);
    const aboveTile = this.levelManager.getTileAt(tileX, tileY - 1);
    
    // Trapped if surrounded by solid tiles and can't climb up
    return (leftTile === TILE_TYPES.BRICK || leftTile === TILE_TYPES.METAL) &&
           (rightTile === TILE_TYPES.BRICK || rightTile === TILE_TYPES.METAL) &&
           (aboveTile === TILE_TYPES.BRICK || aboveTile === TILE_TYPES.METAL);
  }

  // Method to escape from hole when it refills
  public escapeHole() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-this.moveSpeed * 2); // Jump out quickly
  }
}