import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLOR_SHEEP_BODY, COLOR_SHEEP_HEAD, TILE_SIZE } from '../constants';

interface SheepProps {
  bounds: number;
}

const Sheep: React.FC<SheepProps> = ({ bounds }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Random start position
  const startPos = useMemo(() => {
    const half = bounds / 2 - 0.4;
    return new THREE.Vector3(
      (Math.random() - 0.5) * 2 * half,
      0,
      (Math.random() - 0.5) * 2 * half
    );
  }, [bounds]);

  const [target, setTarget] = useState<THREE.Vector3>(startPos.clone());
  const speed = 0.01 + Math.random() * 0.01;
  const waitTime = useRef(Math.random() * 100);

  useFrame(() => {
    if (!groupRef.current) return;

    const currentPos = groupRef.current.position;
    
    // Simple state machine: Move or Wait
    if (waitTime.current > 0) {
      waitTime.current -= 1;
      
      // Bobbing animation while idle
      groupRef.current.position.y = Math.sin(Date.now() * 0.005) * 0.05;
      
    } else {
      // Move towards target
      const dir = new THREE.Vector3().subVectors(target, currentPos);
      dir.y = 0; // Keep on ground
      const dist = dir.length();

      if (dist < 0.1) {
        // Reached target, pick new one
        const half = bounds / 2 - 0.4; // Keep padding from edge
        setTarget(new THREE.Vector3(
          (Math.random() - 0.5) * 2 * half,
          0,
          (Math.random() - 0.5) * 2 * half
        ));
        waitTime.current = 60 + Math.random() * 120; // Wait 1-3 seconds (assuming 60fps)
      } else {
        // Move
        dir.normalize().multiplyScalar(speed);
        groupRef.current.position.add(dir);
        
        // Look at target
        groupRef.current.lookAt(target.x, groupRef.current.position.y, target.z);

        // Walking Hop animation
        groupRef.current.position.y = Math.abs(Math.sin(Date.now() * 0.015)) * 0.2;
      }
    }
  });

  return (
    <group ref={groupRef} position={startPos}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.5]} />
        <meshStandardMaterial color={COLOR_SHEEP_BODY} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.55, 0.3]} castShadow>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial color={COLOR_SHEEP_HEAD} />
      </mesh>

      {/* Legs (Visual only, simple boxes) */}
      <mesh position={[-0.15, 0.1, 0.15]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color={COLOR_SHEEP_HEAD} />
      </mesh>
      <mesh position={[0.15, 0.1, 0.15]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color={COLOR_SHEEP_HEAD} />
      </mesh>
      <mesh position={[-0.15, 0.1, -0.15]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color={COLOR_SHEEP_HEAD} />
      </mesh>
      <mesh position={[0.15, 0.1, -0.15]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color={COLOR_SHEEP_HEAD} />
      </mesh>
    </group>
  );
};

export default Sheep;