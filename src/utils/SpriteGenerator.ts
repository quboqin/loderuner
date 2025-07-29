import Phaser from 'phaser';
import { GAME_CONFIG } from './constants';

export class SpriteGenerator {
  
  static createPlayerSprite(scene: Phaser.Scene): void {
    if (!scene.textures.exists('player')) {
      const graphics = scene.add.graphics();
      
      // Create a simple pixel art runner character
      const size = GAME_CONFIG.TILE_SIZE - 4;
      
      // Head (light green)
      graphics.fillStyle(0x90EE90);
      graphics.fillRect(8, 2, 12, 8);
      
      // Body (green)
      graphics.fillStyle(0x32CD32);
      graphics.fillRect(6, 10, 16, 12);
      
      // Arms (green)
      graphics.fillStyle(0x228B22);
      graphics.fillRect(2, 12, 4, 8);
      graphics.fillRect(22, 12, 4, 8);
      
      // Legs (dark green)
      graphics.fillStyle(0x006400);
      graphics.fillRect(8, 22, 5, 6);
      graphics.fillRect(15, 22, 5, 6);
      
      // Eyes (black dots)
      graphics.fillStyle(0x000000);
      graphics.fillRect(10, 5, 2, 2);
      graphics.fillRect(16, 5, 2, 2);
      
      graphics.generateTexture('player', size, size);
      graphics.destroy();
    }
  }

  static createGuardSprite(scene: Phaser.Scene): void {
    if (!scene.textures.exists('guard')) {
      const graphics = scene.add.graphics();
      
      // Create a simple pixel art guard character  
      const size = GAME_CONFIG.TILE_SIZE - 4;
      
      // Head (light red)
      graphics.fillStyle(0xFF6B6B);
      graphics.fillRect(8, 2, 12, 8);
      
      // Body (red)
      graphics.fillStyle(0xFF0000);
      graphics.fillRect(6, 10, 16, 12);
      
      // Arms (dark red)
      graphics.fillStyle(0xCC0000);
      graphics.fillRect(2, 12, 4, 8);
      graphics.fillRect(22, 12, 4, 8);
      
      // Legs (dark red)
      graphics.fillStyle(0x990000);
      graphics.fillRect(8, 22, 5, 6);
      graphics.fillRect(15, 22, 5, 6);
      
      // Eyes (black dots)
      graphics.fillStyle(0x000000);
      graphics.fillRect(10, 5, 2, 2);
      graphics.fillRect(16, 5, 2, 2);
      
      graphics.generateTexture('guard', size, size);
      graphics.destroy();
    }
  }

  static createBrickSprite(scene: Phaser.Scene): void {
    if (!scene.textures.exists('brick')) {
      const graphics = scene.add.graphics();
      
      // Create brick pattern
      graphics.fillStyle(0x8B4513); // Brown base
      graphics.fillRect(0, 0, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      
      // Brick lines (darker brown)
      graphics.lineStyle(1, 0x654321);
      
      // Horizontal lines
      graphics.beginPath();
      graphics.moveTo(0, GAME_CONFIG.TILE_SIZE / 2);
      graphics.lineTo(GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE / 2);
      graphics.strokePath();
      
      // Vertical lines (offset pattern)
      graphics.beginPath();
      graphics.moveTo(GAME_CONFIG.TILE_SIZE / 2, 0);
      graphics.lineTo(GAME_CONFIG.TILE_SIZE / 2, GAME_CONFIG.TILE_SIZE / 2);
      graphics.strokePath();
      
      graphics.beginPath();
      graphics.moveTo(GAME_CONFIG.TILE_SIZE / 4, GAME_CONFIG.TILE_SIZE / 2);
      graphics.lineTo(GAME_CONFIG.TILE_SIZE / 4, GAME_CONFIG.TILE_SIZE);
      graphics.strokePath();
      
      graphics.beginPath();
      graphics.moveTo(3 * GAME_CONFIG.TILE_SIZE / 4, GAME_CONFIG.TILE_SIZE / 2);
      graphics.lineTo(3 * GAME_CONFIG.TILE_SIZE / 4, GAME_CONFIG.TILE_SIZE);
      graphics.strokePath();
      
      graphics.generateTexture('brick', GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      graphics.destroy();
    }
  }

  static createMetalSprite(scene: Phaser.Scene): void {
    if (!scene.textures.exists('metal')) {
      const graphics = scene.add.graphics();
      
      // Create metal pattern
      graphics.fillStyle(0x808080); // Gray base
      graphics.fillRect(0, 0, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      
      // Metal highlights (lighter gray)
      graphics.fillStyle(0xA0A0A0);
      graphics.fillRect(2, 2, GAME_CONFIG.TILE_SIZE - 4, 2);
      graphics.fillRect(2, 2, 2, GAME_CONFIG.TILE_SIZE - 4);
      
      // Metal shadows (darker gray)
      graphics.fillStyle(0x606060);
      graphics.fillRect(2, GAME_CONFIG.TILE_SIZE - 4, GAME_CONFIG.TILE_SIZE - 2, 2);
      graphics.fillRect(GAME_CONFIG.TILE_SIZE - 4, 2, 2, GAME_CONFIG.TILE_SIZE - 2);
      
      graphics.generateTexture('metal', GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      graphics.destroy();
    }
  }

  static createLadderSprite(scene: Phaser.Scene): void {
    if (!scene.textures.exists('ladder')) {
      const graphics = scene.add.graphics();
      
      // Create ladder pattern
      graphics.fillStyle(0x8B4513); // Brown wood
      
      // Vertical rails
      graphics.fillRect(4, 0, 4, GAME_CONFIG.TILE_SIZE);
      graphics.fillRect(GAME_CONFIG.TILE_SIZE - 8, 0, 4, GAME_CONFIG.TILE_SIZE);
      
      // Horizontal rungs
      for (let i = 0; i < 4; i++) {
        const y = (i * GAME_CONFIG.TILE_SIZE / 4) + 2;
        graphics.fillRect(4, y, GAME_CONFIG.TILE_SIZE - 8, 3);
      }
      
      graphics.generateTexture('ladder', GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      graphics.destroy();
    }
  }

  static createPoleSprite(scene: Phaser.Scene): void {
    if (!scene.textures.exists('pole')) {
      const graphics = scene.add.graphics();
      
      // Create horizontal pole
      graphics.fillStyle(0xFFD700); // Gold color
      graphics.fillRect(0, GAME_CONFIG.TILE_SIZE / 2 - 2, GAME_CONFIG.TILE_SIZE, 4);
      
      // Pole highlights
      graphics.fillStyle(0xFFFF00);
      graphics.fillRect(0, GAME_CONFIG.TILE_SIZE / 2 - 2, GAME_CONFIG.TILE_SIZE, 1);
      
      graphics.generateTexture('pole', GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      graphics.destroy();
    }
  }

  static createGoldSprite(scene: Phaser.Scene): void {
    if (!scene.textures.exists('gold')) {
      const graphics = scene.add.graphics();
      
      // Create gold treasure
      const centerX = GAME_CONFIG.TILE_SIZE / 2;
      const centerY = GAME_CONFIG.TILE_SIZE / 2;
      
      // Gold circle
      graphics.fillStyle(0xFFD700);
      graphics.fillCircle(centerX, centerY, 10);
      
      // Inner highlight
      graphics.fillStyle(0xFFFF00);
      graphics.fillCircle(centerX - 2, centerY - 2, 4);
      
      // Dollar sign or gem pattern
      graphics.fillStyle(0x000000);
      graphics.fillRect(centerX - 1, centerY - 6, 2, 12);
      graphics.fillRect(centerX - 4, centerY - 2, 8, 2);
      graphics.fillRect(centerX - 4, centerY + 1, 8, 2);
      
      graphics.generateTexture('gold', GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      graphics.destroy();
    }
  }

  static generateAllSprites(scene: Phaser.Scene): void {
    this.createPlayerSprite(scene);
    this.createGuardSprite(scene);
    this.createBrickSprite(scene);
    this.createMetalSprite(scene);
    this.createLadderSprite(scene);
    this.createPoleSprite(scene);
    this.createGoldSprite(scene);
  }
}