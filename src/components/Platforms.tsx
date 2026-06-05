import { useMemo, useRef, useEffect } from 'react';
import { InstancedRigidBodies } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';

const PLATFORM_COUNT = 70; // Increased count to cover wider range
const SPACING = 4;

const NEON_COLORS = [
  new THREE.Color('#ffffff'),
  new THREE.Color('#00ffff'),
  new THREE.Color('#ff00ff'),
  new THREE.Color('#00ff00'),
  new THREE.Color('#ffff00'),
];

export default function Platforms() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const currentLevel = useGameStore((state) => state.currentLevel);

  // Lazy update: Only re-generate when player moves 10 levels away from the pivot
  const pivotLevel = Math.floor(currentLevel / 10) * 10;

  const instances = useMemo(() => {
    const startLevel = Math.max(1, pivotLevel - 20); 
    
    const items = [];
    for (let i = 0; i < PLATFORM_COUNT; i++) {
      const levelIndex = startLevel + i;
      const seed = levelIndex * 15485863;
      
      let x, z, scaleX, scaleZ, color;

      if (levelIndex <= 10) {
        const angle = levelIndex * 0.8;
        const radius = 5;
        x = Math.sin(angle) * radius;
        z = Math.cos(angle) * radius;
        scaleX = 6;
        scaleZ = 6;
        color = NEON_COLORS[0];
      } else {
        const angle = levelIndex * 0.5 + Math.sin(seed) * 0.3;
        const radius = 3 + (Math.abs(Math.sin(seed)) * 7);
        x = Math.sin(angle) * radius;
        z = Math.cos(angle) * radius;
        scaleX = 4 + Math.sin(seed * 2) * 1.5;
        scaleZ = 4 + Math.cos(seed * 2) * 1.5;
        
        const colorIndex = Math.abs(seed) % NEON_COLORS.length;
        color = NEON_COLORS[colorIndex];
      }

      items.push({
        key: `platform-${levelIndex}`,
        name: 'platform',
        position: [x, levelIndex * SPACING, z],
        rotation: [0, (seed % 100) / 100 * Math.PI, 0],
        scale: [scaleX, 0.6, scaleZ],
        color: color || NEON_COLORS[0], // Fallback to white if undefined
      });
    }
    return items;
  }, [pivotLevel]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.frustumCulled = false;
      
      instances.forEach((instance, i) => {
        if (instance.color) {
          meshRef.current?.setColorAt(i, instance.color);
        }
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
