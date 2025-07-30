import Phaser from 'phaser';
import { GAME_CONFIG, KEYS, TILE_TYPES } from '../utils/constants';
import { LevelManager } from '../systems/LevelManager';
import { SpriteGenerator } from '../utils/SpriteGenerator';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private levelManager: LevelManager;
  private isOnLadder = false;
  private isOnPole = false;
  private moveSpeed = 150;
  private updateCount = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, levelManager: LevelManager) {
    // Create visual first
    SpriteGenerator.createPlayerSprite(scene);
    
    super(scene, x, y, 'player');
    
    this.levelManager = levelManager;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Ensure player is on top
    this.setDepth(100);
    
    this.setSize(GAME_CONFIG.TILE_SIZE - 4, GAME_CONFIG.TILE_SIZE - 4);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(0);
    body.setDragX(0);
    
    this.createKeys();
    
    console.log('Player initialized at:', this.x, this.y);
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
    
    console.log('Keys created:', Object.keys(this.keys));
    console.log('DIG_LEFT constant:', KEYS.DIG_LEFT);
    console.log('DIG_RIGHT constant:', KEYS.DIG_RIGHT);
    console.log('digLeft key object:', this.keys.digLeft);
    console.log('digRight key object:', this.keys.digRight);
    console.log('Scene input keyboard available:', !!this.scene.input.keyboard);
  }


  update() {
    if (!this.body) {
      console.error('Player has no physics body!');
      return;
    }
    
    // Debug: Flash the player to show it's updating
    this.updateCount++;
    if (this.updateCount % 60 === 0) { // Every second at 60fps
      console.log('Player update running. Position:', this.x, this.y);
      this.setAlpha(this.alpha === 1 ? 0.5 : 1); // Flash visibility
    }
    
    this.handleInput();
    this.checkTileCollisions();
  }

  private handleInput() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const cursors = this.scene.input.keyboard!.createCursorKeys();
    
    body.setVelocityX(0);
    
    if (!this.isOnLadder) {
      body.setGravityY(300);
    } else {
      body.setGravityY(0);
      // Don't reset velocity here, let climbing control it
    }

    // Test with cursor keys first
    if (cursors.left.isDown) {
      console.log('Cursor left pressed');
      body.setVelocityX(-this.moveSpeed);
    } else if (cursors.right.isDown) {
      console.log('Cursor right pressed');
      body.setVelocityX(this.moveSpeed);
    }
    
    // Also test our custom keys
    if (this.keys.left.isDown) {
      console.log('Custom left key pressed');
      body.setVelocityX(-this.moveSpeed);
    } else if (this.keys.right.isDown) {
      console.log('Custom right key pressed');
      body.setVelocityX(this.moveSpeed);
    }

    // Test Z/X keys every frame to see if they're detected at all
    if (this.keys.digLeft.isDown) {
      console.log('Z key is being held down');
    }
    if (this.keys.digRight.isDown) {
      console.log('X key is being held down');
    }

    if (this.isOnLadder) {
      // Only align to ladder when actually climbing (not moving horizontally)
      const isClimbing = (this.keys.up.isDown || cursors.up.isDown || this.keys.down.isDown || cursors.down.isDown);
      const isMovingHorizontally = (this.keys.left.isDown || cursors.left.isDown || this.keys.right.isDown || cursors.right.isDown);
      
      if (isClimbing && !isMovingHorizontally) {
        // Auto-align to ladder when climbing vertically
        this.alignToLadder();
        
        if (this.keys.up.isDown || cursors.up.isDown) {
          body.setVelocityY(-this.moveSpeed);
        } else if (this.keys.down.isDown || cursors.down.isDown) {
          body.setVelocityY(this.moveSpeed);
        }
      } else if (isMovingHorizontally) {
        // Allow falling when moving horizontally off ladder
        body.setGravityY(300);
        body.setVelocityY(0); // Stop vertical movement when moving horizontally
      } else {
        // Standing still on ladder
        body.setVelocityY(0);
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

    // Try both methods to detect Z/X key presses
    const zKey = this.scene.input.keyboard!.addKey('Z');
    const xKey = this.scene.input.keyboard!.addKey('X');
    
    if (Phaser.Input.Keyboard.JustDown(this.keys.digLeft)) {
      console.log('Z key pressed (via KEYS constant) - digging left');
      this.digHole(-1, 1);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.digRight)) {
      console.log('X key pressed (via KEYS constant) - digging right');
      this.digHole(1, 1);
    }
    
    // Alternative method
    if (Phaser.Input.Keyboard.JustDown(zKey)) {
      console.log('Z key pressed (direct) - digging left');
      this.digHole(-1, 1);
    } else if (Phaser.Input.Keyboard.JustDown(xKey)) {
      console.log('X key pressed (direct) - digging right');
      this.digHole(1, 1);
    }
  }

  private checkTileCollisions() {
    const centerX = Math.floor(this.x / GAME_CONFIG.TILE_SIZE);
    const centerY = Math.floor(this.y / GAME_CONFIG.TILE_SIZE);
    
    // Check current position and adjacent positions for ladders
    const currentTile = this.levelManager.getTileAt(centerX, centerY);
    const leftTile = this.levelManager.getTileAt(centerX - 1, centerY);
    const rightTile = this.levelManager.getTileAt(centerX + 1, centerY);
    const belowTile = this.levelManager.getTileAt(centerX, centerY + 1);
    const aboveTile = this.levelManager.getTileAt(centerX, centerY - 1);
    
    // Check if player is moving horizontally to exit ladder
    const cursors = this.scene.input.keyboard!.createCursorKeys();
    const isMovingHorizontally = (this.keys.left.isDown || cursors.left.isDown || this.keys.right.isDown || cursors.right.isDown);
    
    // More restrictive ladder detection when moving horizontally
    if (isMovingHorizontally && this.isOnLadder) {
      // Only stay on ladder if directly on a ladder tile, not adjacent ones
      this.isOnLadder = (currentTile === TILE_TYPES.LADDER);
    } else {
      // Normal forgiving ladder detection when not moving horizontally
      this.isOnLadder = (currentTile === TILE_TYPES.LADDER) ||
                       (leftTile === TILE_TYPES.LADDER && Math.abs(this.x - (centerX - 1) * GAME_CONFIG.TILE_SIZE - GAME_CONFIG.TILE_SIZE/2) < GAME_CONFIG.TILE_SIZE * 0.7) ||
                       (rightTile === TILE_TYPES.LADDER && Math.abs(this.x - (centerX + 1) * GAME_CONFIG.TILE_SIZE - GAME_CONFIG.TILE_SIZE/2) < GAME_CONFIG.TILE_SIZE * 0.7) ||
                       (aboveTile === TILE_TYPES.LADDER) ||
                       (belowTile === TILE_TYPES.LADDER);
    }
    
    this.isOnPole = currentTile === TILE_TYPES.POLE || belowTile === TILE_TYPES.POLE;
    
    // Debug when found ladder
    if (this.isOnLadder) {
      console.log(`ON LADDER: Player at (${this.x.toFixed(1)}, ${this.y.toFixed(1)}), center tile: ${currentTile}, moving horizontally: ${isMovingHorizontally}`);
    }
  }


  private alignToLadder() {
    const centerX = Math.floor(this.x / GAME_CONFIG.TILE_SIZE);
    const centerY = Math.floor(this.y / GAME_CONFIG.TILE_SIZE);
    
    // Check for ladders in adjacent tiles
    const currentTile = this.levelManager.getTileAt(centerX, centerY);
    const leftTile = this.levelManager.getTileAt(centerX - 1, centerY);
    const rightTile = this.levelManager.getTileAt(centerX + 1, centerY);
    
    let targetLadderX = null;
    
    // Find the ladder to align to
    if (currentTile === TILE_TYPES.LADDER) {
      targetLadderX = centerX * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    } else if (leftTile === TILE_TYPES.LADDER) {
      targetLadderX = (centerX - 1) * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    } else if (rightTile === TILE_TYPES.LADDER) {
      targetLadderX = (centerX + 1) * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    }
    
    // Align to the ladder with a more aggressive snap
    if (targetLadderX !== null) {
      const distance = Math.abs(this.x - targetLadderX);
      if (distance > 2) {
        const snapSpeed = Math.min(distance * 0.2, 8); // Adaptive snap speed
        if (this.x < targetLadderX) {
          this.x = Math.min(this.x + snapSpeed, targetLadderX);
        } else {
          this.x = Math.max(this.x - snapSpeed, targetLadderX);
        }
        console.log(`Aligning to ladder: current X=${this.x.toFixed(1)}, target X=${targetLadderX}, distance=${distance.toFixed(1)}`);
      }
    }
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
    
    console.log(`Attempting to dig at tile (${tileX}, ${tileY}) from player position (${this.x}, ${this.y})`);
    
    const targetTile = this.levelManager.getTileAt(tileX, tileY);
    console.log(`Target tile type: ${targetTile}, BRICK type: ${TILE_TYPES.BRICK}`);
    
    if (targetTile === TILE_TYPES.BRICK) {
      console.log('Digging hole!');
      this.levelManager.setTileAt(tileX, tileY, TILE_TYPES.EMPTY);
      
      setTimeout(() => {
        console.log('Refilling hole');
        this.levelManager.setTileAt(tileX, tileY, TILE_TYPES.BRICK);
        (this.scene as any).renderTerrain?.();
      }, 3000);
      
      (this.scene as any).renderTerrain?.();
    } else {
      console.log('Cannot dig - not a brick tile');
    }
  }
}