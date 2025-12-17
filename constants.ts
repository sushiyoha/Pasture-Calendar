import * as THREE from 'three';

// Visual Constants
// Darker, richer green for healthy grass to pop against the light background
export const COLOR_GRASS_HEALTHY = new THREE.Color('#4ade80'); 
// Darker, more saturated earth tone for dry grass
export const COLOR_GRASS_DRY = new THREE.Color('#d97706'); 

export const COLOR_SHEEP_BODY = '#f1f5f9'; // Slate-100, slightly off-white to catch shadows better
export const COLOR_SHEEP_HEAD = '#1e293b'; // Slate-800

// Grid Logic
export const TILE_SIZE = 2;
export const TILE_GAP = 0.2;
export const MAX_SHEEP_FOR_BARREN = 5; // At 5 tasks, the grass is fully brown

// Camera
export const CAMERA_INITIAL_POS = [0, 10, 10];