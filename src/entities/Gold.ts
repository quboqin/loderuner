import Phaser from 'phaser';
import { SpriteGenerator } from '../utils/SpriteGenerator';

export class Gold extends Phaser.Physics.Arcade.Sprite {
  private collected = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Create visual first
    SpriteGenerator.createGoldSprite(scene);
    
    super(scene, x, y, 'gold');
    
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body
    
    this.setDepth(50); // Above terrain, below player/guards
    
    console.log('Gold created at:', this.x, this.y);
  }

  collect(): void {
    if (!this.collected) {
      this.collected = true;
      
      // Play collection animation
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          this.destroy();
        }
      });
      
      console.log('Gold collected!');
    }
  }

  isCollected(): boolean {
    return this.collected;
  }
}