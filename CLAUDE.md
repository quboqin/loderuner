# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A classic Lode Runner game implementation using Phaser 3 game framework and TypeScript, built with Vite for modern web development.

## Development Commands

- `npm install` - Install project dependencies
- `npm run dev` - Start development server (http://localhost:8080)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking

## Project Architecture

### Core Structure
- **Phaser 3 Framework**: Game engine with Arcade Physics
- **TypeScript**: Type-safe development
- **Vite**: Modern build tool with hot module replacement

### Game Architecture
- **Scenes**: GameScene manages main game loop and rendering
- **Entities**: Player class with movement, digging, physics
- **Systems**: LevelManager handles level data and terrain
- **Constants**: Centralized game configuration and tile types

### Key Files
- `src/main.ts` - Application entry point
- `src/game.ts` - Phaser game configuration
- `src/scenes/GameScene.ts` - Main game scene
- `src/entities/Player.ts` - Player character implementation
- `src/systems/LevelManager.ts` - Level loading and management
- `src/data/levels.json` - Level data storage
- `src/utils/constants.ts` - Game constants and configuration

### Game Features
- Grid-based movement (28x16 tiles, 32px each)
- Player movement via arrow keys (no jumping)
- Digging holes with Z/X keys (holes auto-fill after 3 seconds)
- Ladder and pole climbing mechanics
- Level loading from JSON data
- Arcade physics with gravity

## Memories
