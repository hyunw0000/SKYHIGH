import { useMemo, useRef, useEffect } from 'react';
import { InstancedRigidBodies } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';

const PLATFORM_COUNT = 50;
const SPACING = 4;

const NEON_COLORS = [
  '#ffffff', // White
  '#00ffff', // Cyan
  '#ff00ff', // Magenta
  '#00ff00', // Lime
  '#ffff00', // Yellow
];

export default function Platforms() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const score = useGameStore((state) => state.score);

  const instances = useMemo(() => {
    // We want a stable set of platforms around the current score
    const currentLevel = Math.floor(score / SPACING);
    const startLevel = Math.max(1, currentLevel - 10);
    
    const items = [];
    for (let i = 0; i < PLATFORM_COUNT; i++) {
      const levelIndex = startLevel + i;
      const seed = levelIndex * 15485863;
      
      let x, z, scaleX, scaleZ, colorStr;

      if (levelIndex <= 10) {
        // Easy staircase
        const angle = levelIndex * 0.8;
        const radius = 5;
        x = Math.sin(angle) * radius;
        z = Math.cos(angle) * radius;
        scaleX = 6;
        scaleZ = 6;
        colorStr = '#ffffff';
      } else {
        // Progressive difficulty
        const angle = levelIndex * 0.5 + Math.sin(seed) * 0.3;
        const radius = 3 + (Math.abs(Math.sin(seed)) * 7);
        x = Math.sin(angle) * radius;
        z = Math.cos(angle) * radius;
        scaleX = 4 + Math.sin(seed * 2) * 1.5;
        scaleZ = 4 + Math.cos(seed * 2) * 1.5;
        
        const colorIndex = Math.abs(Math.floor(Math.sin(seed) * NEON_COLORS.length));
        colorStr = NEON_COLORS[colorIndex];
      }

      items.push({
        key: `platform-${levelIndex}`,
        name: 'platform', // Crucial for jump detection
        position: [x, levelIndex * SPACING, z],
        rotation: [0, (seed % 100) / 100 * Math.PI, 0],
        scale: [scaleX, 0.6, scaleZ],
        color: new THREE.Color(colorStr),
      });
    }
    return items;
  }, [score]);

  useEffect(() => {
    if (meshRef.current) {
      // Disable frustum culling to prevent disappearing platforms
      meshRef.current.frustumCulled = false;
      
      instances.forEach((instance, i) => {
        meshRef.current?.setColorAt(i, instance.color);
      });
      
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }

      // Crucial: compute bounding volumes for instanced meshes
      meshRef.current.computeBoundingBox();
      meshRef.current.computeBoundingSphere();
    }
  }, [instances]);

  return (
    <InstancedRigidBodies
      instances={instances}
      type="fixed"
      colliders="cuboid"
    >
      <instancedMesh 
        ref={meshRef} 
        args={[undefined, undefined, PLATFORM_COUNT]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          toneMapped={false}
          emissive="#ffffff"
          emissiveIntensity={0.5} // Increased visibility
        />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}
