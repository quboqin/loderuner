import { TILE_TYPES, GAME_CONFIG } from '../utils/constants';

export interface LevelData {
  id: number;
  name: string;
  width: number;
  height: number;
  terrain: number[][];
}

export class LevelManager {
  private levels: LevelData[] = [];
  private currentLevel: LevelData | null = null;

  async loadLevels(): Promise<void> {
    try {
      const response = await fetch('/src/data/levels.json');
      this.levels = await response.json();
    } catch (error) {
      console.error('Failed to load levels:', error);
      this.levels = [];
    }
  }

  getLevel(id: number): LevelData | null {
    return this.levels.find(level => level.id === id) || null;
  }

  setCurrentLevel(id: number): boolean {
    const level = this.getLevel(id);
    if (level) {
      this.currentLevel = level;
      return true;
    }
    return false;
  }

  getCurrentLevel(): LevelData | null {
    return this.currentLevel;
  }

  getTileAt(x: number, y: number): number {
    if (!this.currentLevel || x < 0 || y < 0 || x >= this.currentLevel.width || y >= this.currentLevel.height) {
      return TILE_TYPES.METAL;
    }
    return this.currentLevel.terrain[y][x];
  }

  setTileAt(x: number, y: number, tileType: number): void {
    if (!this.currentLevel || x < 0 || y < 0 || x >= this.currentLevel.width || y >= this.currentLevel.height) {
      return;
    }
    this.currentLevel.terrain[y][x] = tileType;
  }

  findPlayerStart(): { x: number; y: number } | null {
    if (!this.currentLevel) return null;

    for (let y = 0; y < this.currentLevel.height; y++) {
      for (let x = 0; x < this.currentLevel.width; x++) {
        if (this.currentLevel.terrain[y][x] === TILE_TYPES.PLAYER_START) {
          // Clear the player start tile after finding it
          this.currentLevel.terrain[y][x] = TILE_TYPES.EMPTY;
          return { x: x * GAME_CONFIG.TILE_SIZE, y: y * GAME_CONFIG.TILE_SIZE };
        }
      }
    }
    return { x: GAME_CONFIG.TILE_SIZE, y: GAME_CONFIG.TILE_SIZE };
  }

  findGuardStarts(): { x: number; y: number }[] {
    if (!this.currentLevel) return [];

    const guards: { x: number; y: number }[] = [];
    for (let y = 0; y < this.currentLevel.height; y++) {
      for (let x = 0; x < this.currentLevel.width; x++) {
        if (this.currentLevel.terrain[y][x] === TILE_TYPES.GUARD_START) {
          // Clear the guard start tile after finding it
          this.currentLevel.terrain[y][x] = TILE_TYPES.EMPTY;
          guards.push({ x: x * GAME_CONFIG.TILE_SIZE, y: y * GAME_CONFIG.TILE_SIZE });
        }
      }
    }
    return guards;
  }

  findGoldPositions(): { x: number; y: number }[] {
    if (!this.currentLevel) return [];

    const gold: { x: number; y: number }[] = [];
    for (let y = 0; y < this.currentLevel.height; y++) {
      for (let x = 0; x < this.currentLevel.width; x++) {
        if (this.currentLevel.terrain[y][x] === TILE_TYPES.GOLD) {
          // Clear the gold tile after finding it (gold becomes collectible entity)
          this.currentLevel.terrain[y][x] = TILE_TYPES.EMPTY;
          gold.push({ x: x * GAME_CONFIG.TILE_SIZE, y: y * GAME_CONFIG.TILE_SIZE });
        }
      }
    }
    return gold;
  }
}