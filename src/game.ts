import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { GAME_CONFIG, COLORS } from './utils/constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: document.body,
  backgroundColor: COLORS.BACKGROUND,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false
    }
  },
  scene: [GameScene]
};

export { config };