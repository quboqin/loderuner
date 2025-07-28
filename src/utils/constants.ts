export const GAME_CONFIG = {
  WIDTH: 896,
  HEIGHT: 512,
  TILE_SIZE: 32,
  TILES_X: 28,
  TILES_Y: 16
} as const;

export const COLORS = {
  BACKGROUND: 0x000000,
  BRICK: 0x8B4513,
  METAL: 0x808080,
  LADDER: 0xFFFF00,
  POLE: 0xFFFF00,
  PLAYER: 0x00FF00,
  GUARD: 0xFF0000,
  GOLD: 0xFFD700
} as const;

export const TILE_TYPES = {
  EMPTY: 0,
  BRICK: 1,
  METAL: 2,
  LADDER: 3,
  POLE: 4,
  GOLD: 5,
  PLAYER_START: 6,
  GUARD_START: 7
} as const;

export const KEYS = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  DIG_LEFT: 'KeyZ',
  DIG_RIGHT: 'KeyX',
  PAUSE: 'KeyP'
} as const;