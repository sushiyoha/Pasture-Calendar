import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { GridItemData, Task } from '../types';
import { COLOR_GRASS_HEALTHY, COLOR_GRASS_DRY, TILE_SIZE, MAX_SHEEP_FOR_BARREN } from '../constants';
import Sheep from './Sheep';

interface GrassPatchProps {
  data: GridItemData;
  position: [number, number, number];
  tasks: Task[];
  onClick: (id: string) => void;
  isSelected: boolean;
}

const GrassPatch: React.FC<GrassPatchProps> = ({ data, position, tasks, onClick, isSelected }) => {
  const [hovered, setHover] = useState(false);
  const taskCount = tasks.length;

  // Calculate Grass Color based on task count (grazing)
  const grassColor = useMemo(() => {
    const health = Math.max(0, 1 - taskCount / MAX_SHEEP_FOR_BARREN);
    const color = new THREE.Color().lerpColors(COLOR_GRASS_DRY, COLOR_GRASS_HEALTHY, health);
    return color;
  }, [taskCount]);

  // Animation for interaction
  const { scale, color } = useSpring({
    scale: isSelected ? 1.1 : hovered ? 1.05 : 1,
    color: isSelected ? '#fff0a5' : grassColor.getStyle(), // Highlight selection with a yellowish tint or just standard grass
    config: { tension: 300, friction: 15 }
  });

  return (
    <group position={position}>
      {/* The Ground */}
      <animated.mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick(data.id);
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={scale}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[TILE_SIZE, 0.5, TILE_SIZE]} />
        <animated.meshStandardMaterial color={color} roughness={1} />
      </animated.mesh>

      {/* Label (Floating Text) */}
      <Text
        position={[-TILE_SIZE / 2 + 0.2, 0.4, -TILE_SIZE / 2 + 0.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="#334155"
        anchorX="left"
        anchorY="top"
      >
        {data.label}
      </Text>

      {/* Task Count Indicator if zoomed out visually or just helpful */}
      {taskCount > 0 && (
         <Text
         position={[TILE_SIZE / 2 - 0.2, 0.4, TILE_SIZE / 2 - 0.2]}
         rotation={[-Math.PI / 2, 0, 0]}
         fontSize={0.2}
         color="#78350f"
         anchorX="right"
         anchorY="bottom"
       >
         {taskCount} 🐑
       </Text>
      )}

      {/* Sheep Herd */}
      <group position={[0, 0.25, 0]}>
        {tasks.map((task) => (
          <Sheep key={task.id} bounds={TILE_SIZE} />
        ))}
      </group>
    </group>
  );
};

export default GrassPatch;